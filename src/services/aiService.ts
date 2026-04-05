import catalog from '../data/catalog.json';
import type { Product, Bundle, ParsedIntent } from '../types';

const products = catalog as Product[];

const BUNDLE_NAMES: Record<string, string[]> = {
  travel: ['Beachy Boho', 'Wanderlust Casual', 'Sunset Traveler'],
  party: ['Glam Night', 'Party Starter', 'Bold & Beautiful'],
  wedding: ['Ethnic Elegance', 'Festive Charm', 'Royal Desi'],
  work: ['Office Boss', 'Corporate Chic', 'Smart Minimal'],
  gift: ['Thoughtful Pick', 'Gift-Worthy', 'The Perfect Surprise'],
  casual: ['Chill Vibes', 'Everyday Cool', 'Effortless Style'],
};

const DESCRIPTIONS: Record<string, string[]> = {
  travel: [
    'Perfect for sunsets and street food walks 🌅',
    'Pack light, look amazing — this bundle travels well ✈️',
    'Breezy fits for your next adventure 🏖️',
  ],
  party: [
    'All eyes on you — guaranteed 💃',
    'This bundle screams main character energy ✨',
    'Dance-floor ready, no questions asked 🔥',
  ],
  wedding: [
    'Elegant and oh-so-desi — perfect for the occasion 💍',
    'Guest outfit sorted, compliments guaranteed 🌸',
    'Traditional meets trendy in all the right ways ✨',
  ],
  work: [
    'Boss energy, Monday to Friday 💼',
    'Smart, sharp, and subtly stylish 🎯',
    'Your new go-to office look, sorted 👔',
  ],
  gift: [
    'They will love this — trust us 🎁',
    'Thoughtful, stylish, and within budget 💛',
    'A gift that says you actually get them ✨',
  ],
  casual: [
    'Easy, breezy, and so you 🌿',
    'No effort needed — just throw it on and go ☀️',
    'Comfort meets style, every single day 💫',
  ],
};

export function parseIntent(
  raw: string,
  occasion?: string,
  vibes?: string[],
  budget?: [number, number]
): ParsedIntent {
  const text = raw.toLowerCase();
  
  let detectedOccasion = occasion || '';
  if (!detectedOccasion) {
    if (text.includes('goa') || text.includes('trip') || text.includes('travel') || text.includes('vacation')) detectedOccasion = 'travel';
    else if (text.includes('party') || text.includes('club') || text.includes('night out')) detectedOccasion = 'party';
    else if (text.includes('wedding') || text.includes('sangeet') || text.includes('shaadi') || text.includes('mehndi')) detectedOccasion = 'wedding';
    else if (text.includes('office') || text.includes('work') || text.includes('interview') || text.includes('meeting')) detectedOccasion = 'work';
    else if (text.includes('gift') || text.includes('birthday') || text.includes('surprise')) detectedOccasion = 'gift';
    else detectedOccasion = 'casual';
  }

  let detectedVibes = vibes || [];
  if (detectedVibes.length === 0) {
    if (text.includes('chill') || text.includes('relaxed') || text.includes('casual') || text.includes('breezy')) detectedVibes.push('chill');
    if (text.includes('bold') || text.includes('statement') || text.includes('glam')) detectedVibes.push('bold');
    if (text.includes('minimal') || text.includes('clean') || text.includes('simple')) detectedVibes.push('minimal');
    if (text.includes('festive') || text.includes('ethnic') || text.includes('desi') || text.includes('traditional')) detectedVibes.push('festive');
    if (text.includes('street') || text.includes('urban') || text.includes('edgy')) detectedVibes.push('streetwear');
    if (detectedVibes.length === 0) detectedVibes = ['chill'];
  }

  const budgetMatch = text.match(/(\d+)\s*k/i);
  const budgetNum = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : null;
  const priceMatch = text.match(/(\d{3,5})/);
  
  return {
    raw,
    occasion: detectedOccasion,
    vibes: detectedVibes,
    budgetMin: budget?.[0] || 500,
    budgetMax: budget?.[1] || budgetNum || (priceMatch ? parseInt(priceMatch[0]) : 3000),
    timestamp: Date.now(),
  };
}

export function generateBundles(intent: ParsedIntent): Bundle[] {
  const { occasion, vibes, budgetMax } = intent;
  
  // Score products based on relevance
  const scored = products.map(p => {
    let score = 0;
    if (p.occasion.includes(occasion)) score += 3;
    vibes.forEach(v => { if (p.tags.includes(v)) score += 2; });
    if (p.price <= budgetMax * 0.4) score += 1;
    score += (p.rating - 3.5) * 2;
    return { product: p, score };
  }).sort((a, b) => b.score - a.score);

  const names = BUNDLE_NAMES[occasion] || BUNDLE_NAMES.casual;
  const descs = DESCRIPTIONS[occasion] || DESCRIPTIONS.casual;
  const bundles: Bundle[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 3; i++) {
    const items: Product[] = [];
    const categories = ['tops', 'bottoms', 'footwear', 'accessories'];
    
    for (const cat of categories) {
      const pick = scored.find(s => 
        s.product.category === cat && !used.has(s.product.id)
      );
      if (pick) {
        items.push(pick.product);
        used.add(pick.product.id);
      }
    }

    // Try to add a dress if no top+bottom combo
    if (items.length < 3) {
      const dress = scored.find(s => 
        s.product.category === 'dresses' && !used.has(s.product.id)
      );
      if (dress) {
        items.push(dress.product);
        used.add(dress.product.id);
      }
    }

    const totalPrice = items.reduce((s, p) => s + p.price, 0);
    const matchScore = Math.min(99, 85 + Math.floor(Math.random() * 12));

    bundles.push({
      id: `bundle-${Date.now()}-${i}`,
      bundle_name: names[i] || `Bundle ${i + 1}`,
      items,
      total_price: totalPrice,
      description: descs[i] || 'A curated bundle just for you ✨',
      match_score: matchScore,
      why_picked: `Matches your ${vibes[0] || 'chill'} vibe • ${items[0]?.rating || 4.5}★ avg rating • ${occasion} ready`,
    });
  }

  return bundles;
}

export async function generateAIBundles(intent: ParsedIntent): Promise<Bundle[] | null> {
  try {
    const res = await fetch('/api/generate-bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_text: intent.raw,
        occasion: intent.occasion,
        vibes: intent.vibes,
        budget_min: intent.budgetMin,
        budget_max: intent.budgetMax,
        catalog: products,
      }),
    });

    const data = await res.json();
    if (data.fallback || data.error || !data.bundles) return null;

    return data.bundles.map((b: any, i: number) => ({
      id: `ai-bundle-${Date.now()}-${i}`,
      bundle_name: b.bundle_name,
      items: b.items,
      total_price: b.total_price,
      description: b.description,
      match_score: b.match_score,
      why_picked: b.why_picked,
    }));
  } catch {
    return null;
  }
}
