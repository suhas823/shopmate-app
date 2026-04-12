export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  link: string;
  source: string;
  rating: number;
  delivery?: string;
  // Legacy fields (for backward compat)
  tags?: string[];
  occasion?: string[];
  reviews_count?: number;
}

export interface Bundle {
  id: string;
  bundle_name: string;
  items: Product[];
  total_price: number;
  description: string;
  match_score: number;
  why_picked: string;
}

export interface ParsedIntent {
  raw: string;
  occasion: string;
  vibes: string[];
  budgetMin: number;
  budgetMax: number;
  timestamp: number;
}

export interface SavedBundle extends Bundle {
  savedAt: number;
}
