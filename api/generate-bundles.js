// Vercel Serverless Function — Real Product Search Pipeline (Groq + Gemini)

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return Math.round(parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0);
}

// AI call — tries Gemini first, falls back to Groq
async function callAI(prompt, options = {}) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GROQ_KEY = process.env.GROQ_API_KEY;

  // Try Gemini
  if (GEMINI_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: options.temperature || 0.7 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch {}
  }

  // Fallback to Groq
  if (GROQ_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: 4000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }
    const err = await res.text();
    throw new Error(`Groq error: ${err.slice(0, 100)}`);
  }

  throw new Error('No AI key configured');
}

async function generateSearchQueries(intentText, context) {
  const gender = context.gender?.includes('Men') ? 'men' : 'women';
  const prompt = `Generate 5 Google Shopping search queries for this request.
Request: "${intentText}"
Gender: ${gender}, Occasion: ${context.occasion}, Budget: ${context.budget}
Return ONLY a JSON array of 5 strings. Each query should search for ONE clothing item. Add "buy online India" to each.
Example: ["women cotton kurta casual buy online India under 1500", "women palazzo pants buy online India"]`;

  const text = await callAI(prompt);
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    const arr = match ? JSON.parse(match[0]) : JSON.parse(text);
    if (Array.isArray(arr) && arr.length > 0) return arr.slice(0, 5);
  } catch {}
  return [
    `${gender} ${context.occasion} outfit buy online India`,
    `${gender} top ${context.occasion} buy online India`,
    `${gender} bottom casual buy online India`,
    `${gender} footwear ${context.occasion} buy online India`,
    `${gender} accessories buy online India`,
  ];
}

async function searchProducts(query, serperKey) {
  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'in', num: 8 }),
    });
    if (!res.ok) return [];
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
  } catch { return []; }
}

async function curateBundles(products, intentText, context) {
  const pool = products.slice(0, 15);
  const forAI = pool.map((p, i) => `${i}. ${p.title.slice(0, 50)} | ₹${p.price} | ${p.source}`).join('\n');

  const prompt = `Create 3 outfit bundles for: "${intentText}". Budget: ${context.budget}.

Available products:
${forAI}

Return JSON: {"bundles":[{"bundle_name":"name","items":[${'{'}"index":0,"category":"top/bottom/footwear/accessory/dress"}],"total_price":0,"description":"fun one-liner","match_score":90,"why_picked":"reason"}]}
Pick 3-4 items per bundle by their index number. Mix categories. 3 different themed bundles.`;

  const text = await callAI(prompt, { temperature: 0.8 });

  let parsed;
  try { parsed = JSON.parse(text); } catch {
    try {
      const match = text.match(/\{[\s\S]*"bundles"[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {}
  }

  const rawBundles = parsed?.bundles || (Array.isArray(parsed) ? parsed : []);

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { intent_text, occasion, vibes, budget_min, budget_max, profile } = req.body;
    const SERPER_KEY = process.env.SERPER_API_KEY;

    if (!SERPER_KEY) return res.json({ error: 'SERPER_API_KEY not configured', fallback: true });
    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      return res.json({ error: 'No AI key configured', fallback: true });
    }

    const context = {
      occasion: occasion || 'casual',
      vibes: (vibes || ['chill']).join(', '),
      budget: `₹${budget_min || 1000}-₹${budget_max || 3000}`,
      ...(profile || {}),
    };

    const queries = await generateSearchQueries(intent_text, context);
    const results = await Promise.all(queries.map(q => searchProducts(q, SERPER_KEY)));
    const allProducts = results.flat().filter(p => p.price > 0 && p.title);

    if (allProducts.length === 0) {
      return res.json({ error: 'No products found', fallback: true });
    }

    const bundles = await curateBundles(allProducts, intent_text, context);

    if (!bundles || bundles.length === 0) {
      return res.json({ error: 'AI could not create bundles', fallback: true });
    }

    return res.json({ bundles, productCount: allProducts.length });
  } catch (e) {
    console.error('generate-bundles error:', e.message);
    return res.json({ error: e.message, fallback: true });
  }
}
