import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// Load catalog
const catalogPath = join(__dirname, 'src', 'data', 'catalog.json');
let catalog;
try {
  catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
} catch {
  catalog = [];
}

// Gemini AI bundle generation
app.post('/api/generate-bundles', async (req, res) => {
  try {
    const { intent_text, occasion, vibes, budget_min, budget_max } = req.body;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_KEY) {
      return res.json({ error: 'GEMINI_API_KEY not configured', fallback: true });
    }

    const systemPrompt = `You are a friendly AI shopping assistant for Indian Gen Z and Millennials.

The user wants: "${intent_text}".

Parsed details — Occasion: ${occasion || 'casual'}, Vibe: ${(vibes || ['chill']).join(', ')}, Budget: ₹${budget_min || 1000}–₹${budget_max || 3000}.

Here is the product catalog:
${JSON.stringify(catalog)}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences. Return exactly 3 complete product bundles. Each bundle must have:
- bundle_name (creative, fun name like "Beachy Boho" or "Office Boss")
- items (array of product objects from the catalog with id, name, price, image, category, tags, occasion, rating, reviews_count)
- total_price (sum of all item prices)
- description (1-line fun description, max 20 words, casual exciting tone)
- match_score (number between 85-99)
- why_picked (1-2 sentence explanation why these items match the user)

Keep the tone warm, personal, Gen Z-friendly. Use Indian context (₹ prices, Indian fashion terms).
Pick 3-5 items per bundle from the catalog. Each bundle should have different style. Include items from different categories (tops, bottoms, footwear, accessories).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nUser shopping intent: ' + intent_text }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      return res.json({ error: 'AI service error', fallback: true });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let bundles;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      bundles = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    } catch (parseErr) {
      console.error('Parse error:', text.substring(0, 200));
      return res.json({ error: 'Failed to parse AI response', fallback: true });
    }

    return res.json({ bundles });
  } catch (e) {
    console.error('generate-bundles error:', e);
    return res.json({ error: e.message, fallback: true });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ShopMate API server running on http://localhost:${PORT}`);
});
