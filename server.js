import express from 'express';

const app = express();
app.use(express.json({ limit: '2mb' }));

// ============================================
// AI CALL — Groq only (Gemini quota is exhausted)
// ============================================
async function callAI(prompt, options = {}) {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY not set');

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'user', content: prompt },
    ],
    temperature: options.temperature || 0.7,
    max_tokens: 4000,
  };

  console.log('   Calling Groq... (prompt length:', prompt.length, 'chars)');
  
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('   ❌ Groq error:', res.status, errText.slice(0, 300));
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 100)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  console.log('   ✅ Groq responded (', text.length, 'chars)');
  return text;
}

// ============================================
// STEP 1: Generate search queries
// ============================================
async function generateSearchQueries(intentText, context) {
  const gender = context.gender?.includes('Men') ? 'men' : 'women';
  const prompt = `Generate 5 Google Shopping search queries for this request.

Request: "${intentText}"
Gender: ${gender}, Occasion: ${context.occasion}, Budget: ${context.budget}

Return ONLY a JSON array of 5 strings. Each query should search for ONE clothing item (top, bottom, footwear, accessory, dress). Add "buy online India" to each.

Example: ["women cotton kurta casual buy online India under 1500", "women palazzo pants buy online India", "women kolhapuri sandals buy online India", "women jhumka earrings buy online India", "women cotton dupatta buy online India"]`;

  const text = await callAI(prompt);
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    const arr = match ? JSON.parse(match[0]) : JSON.parse(text);
    if (Array.isArray(arr) && arr.length > 0) return arr.slice(0, 5);
  } catch (e) {
    console.log('   Parse error, using fallback queries');
  }
  
  // Fallback queries
  return [
    `${gender} ${context.occasion} outfit buy online India`,
    `${gender} top ${context.occasion} buy online India`,
    `${gender} bottom casual buy online India`,
    `${gender} footwear ${context.occasion} buy online India`,
    `${gender} accessories buy online India`,
  ];
}

// ============================================
// STEP 2: Serper.dev Google Shopping
// ============================================
async function searchProducts(query, serperKey) {
  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'in', num: 8 }),
    });

    if (!res.ok) {
      console.error(`   Serper error for "${query}":`, res.status);
      return [];
    }

    const data = await res.json();
    return (data.shopping || []).map((item, i) => ({
      id: `s${Date.now()}-${i}`,
      title: item.title || '',
      price: parsePrice(item.price),
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      source: item.source || '',
      rating: item.rating || 0,
    }));
  } catch (e) {
    console.error(`   Serper fetch error:`, e.message);
    return [];
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return Math.round(parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0);
}

// ============================================
// STEP 3: Curate bundles from real products
// ============================================
async function curateBundles(products, intentText, context) {
  // Only send titles + prices to AI (NO URLs — they waste tokens and get broken)
  const pool = products.slice(0, 15);
  const forAI = pool.map((p, i) => `${i}. ${p.title.slice(0, 50)} | ₹${p.price} | ${p.source}`).join('\n');

  const prompt = `Create 3 outfit bundles for: "${intentText}". Budget: ${context.budget}.

Available products:
${forAI}

Return JSON: {"bundles":[{"bundle_name":"name","items":[${'{'}"index":0,"category":"top/bottom/footwear/accessory/dress"}],"total_price":0,"description":"fun one-liner","match_score":90,"why_picked":"reason"}]}
Pick 3-4 items per bundle by their index number. Mix categories. 3 different themed bundles.`;

  const text = await callAI(prompt, { temperature: 0.8 });
  
  // Parse AI response
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*"bundles"[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {}
  }

  const rawBundles = parsed?.bundles || (Array.isArray(parsed) ? parsed : []);
  
  // Map AI's index picks back to full product data
  return rawBundles.map(b => ({
    bundle_name: b.bundle_name || 'Curated Bundle',
    items: (b.items || []).map(item => {
      const idx = item.index ?? item.i ?? 0;
      const product = pool[idx] || pool[0];
      return {
        id: product?.id || `p-${idx}`,
        name: product?.title || item.name || 'Product',
        price: product?.price || item.price || 0,
        image: product?.imageUrl || '',
        link: product?.link || '',
        source: product?.source || '',
        category: item.category || 'unknown',
        rating: product?.rating || 0,
      };
    }),
    total_price: b.total_price || 0,
    description: b.description || '',
    match_score: b.match_score || 90,
    why_picked: b.why_picked || '',
  }));
}

// ============================================
// MAIN ROUTE
// ============================================
app.post('/api/generate-bundles', async (req, res) => {
  const startTime = Date.now();

  try {
    const { intent_text, occasion, vibes, budget_min, budget_max, profile } = req.body;
    const SERPER_KEY = process.env.SERPER_API_KEY;

    if (!SERPER_KEY) return res.json({ error: 'SERPER_API_KEY not configured', fallback: true });
    if (!process.env.GROQ_API_KEY) return res.json({ error: 'GROQ_API_KEY not configured', fallback: true });

    const context = {
      occasion: occasion || 'casual',
      vibes: (vibes || ['chill']).join(', '),
      budget: `₹${budget_min || 1000}-₹${budget_max || 3000}`,
      ...(profile || {}),
    };

    console.log(`\n🛍️ [${new Date().toLocaleTimeString()}] "${intent_text}"`);

    // Step 1: Generate queries
    console.log('   Step 1: Generating queries...');
    const queries = await generateSearchQueries(intent_text, context);
    console.log('   Queries:', queries);

    // Step 2: Search Google Shopping
    console.log('   Step 2: Searching Google Shopping...');
    const results = await Promise.all(queries.map(q => searchProducts(q, SERPER_KEY)));
    const allProducts = results.flat().filter(p => p.price > 0 && p.title);
    console.log(`   Found ${allProducts.length} products`);

    if (allProducts.length === 0) {
      return res.json({ error: 'No products found', fallback: true });
    }

    // Step 3: Curate bundles
    console.log('   Step 3: Curating bundles...');
    const bundles = await curateBundles(allProducts, intent_text, context);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ Done in ${elapsed}s — ${bundles.length} bundles`);

    if (!bundles || bundles.length === 0) {
      return res.json({ error: 'AI could not create bundles', fallback: true });
    }

    return res.json({ bundles, productCount: allProducts.length, elapsed });
  } catch (e) {
    console.error('❌ Error:', e.message);
    return res.json({ error: e.message, fallback: true });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ShopMate API on http://localhost:${PORT}`);
  console.log(`   Groq:   ${process.env.GROQ_API_KEY ? '✅' : '❌'}`);
  console.log(`   Serper: ${process.env.SERPER_API_KEY ? '✅' : '❌'}`);
});
