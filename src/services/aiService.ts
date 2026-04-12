import type { Bundle, ParsedIntent } from '../types';

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

function getProfile(): Record<string, string> {
  try {
    const stored = localStorage.getItem('shopmate_profile');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export async function generateAIBundles(intent: ParsedIntent): Promise<Bundle[] | null> {
  try {
    const profile = getProfile();

    const res = await fetch('/api/generate-bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_text: intent.raw,
        occasion: intent.occasion,
        vibes: intent.vibes,
        budget_min: intent.budgetMin,
        budget_max: intent.budgetMax,
        profile,
      }),
    });

    const data = await res.json();
    if (data.fallback || data.error || !data.bundles) {
      console.warn('AI bundle error:', data.error);
      return null;
    }

    return data.bundles.map((b: any, i: number) => ({
      id: `ai-bundle-${Date.now()}-${i}`,
      bundle_name: b.bundle_name,
      items: (b.items || []).map((item: any, j: number) => ({
        id: item.id || `item-${i}-${j}`,
        name: item.name || item.title || 'Product',
        category: item.category || 'unknown',
        price: item.price || 0,
        image: item.image || item.imageUrl || '',
        link: item.link || '',
        source: item.source || 'Online Store',
        rating: item.rating || 0,
        delivery: item.delivery || '',
      })),
      total_price: b.total_price,
      description: b.description,
      match_score: b.match_score,
      why_picked: b.why_picked,
    }));
  } catch (err) {
    console.error('generateAIBundles error:', err);
    return null;
  }
}
