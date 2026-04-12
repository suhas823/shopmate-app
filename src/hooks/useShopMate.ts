import { useState, useCallback, useEffect } from 'react';
import type { Bundle, SavedBundle, ParsedIntent } from '../types';
import { parseIntent, generateAIBundles } from '../services/aiService';
import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
  lastSearch: 'shopmate_last_search',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

export function useShopMate() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [currentIntent, setCurrentIntent] = useState<ParsedIntent | null>(null);
  const [savedBundles, setSavedBundles] = useState<SavedBundle[]>([]);
  const [intentHistory, setIntentHistory] = useState<ParsedIntent[]>([]);
  const [lastSearch, setLastSearch] = useState<{ text: string; occasion: string } | null>(
    () => loadFromStorage(STORAGE_KEYS.lastSearch, null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved bundles from Supabase on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load saved bundles
      const { data: bundles } = await supabase
        .from('saved_bundles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bundles) {
        setSavedBundles(bundles.map(b => ({
          ...b.bundle_data,
          id: b.id,
          bundle_name: b.bundle_name,
          savedAt: new Date(b.created_at).getTime(),
        })));
      }

      // Load search history
      const { data: history } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (history) {
        setIntentHistory(history.map(h => ({
          raw: h.query,
          occasion: h.occasion || 'casual',
          vibes: h.vibes || [],
          budgetMin: h.budget_min || 1000,
          budgetMax: h.budget_max || 3000,
          timestamp: new Date(h.created_at).getTime(),
        })));
      }
    })();
  }, []);

  const search = useCallback(async (
    raw: string,
    occasion?: string,
    vibes?: string[],
    budget?: [number, number]
  ) => {
    const intent = parseIntent(raw, occasion, vibes, budget);
    setCurrentIntent(intent);
    setIsLoading(true);
    setUsedAI(false);
    setError(null);

    try {
      const results = await generateAIBundles(intent);
      if (results && results.length > 0) {
        setBundles(results);
        setUsedAI(true);
      } else {
        setBundles([]);
        setError('No matching products found. Try adjusting your search or budget.');
      }
    } catch {
      setBundles([]);
      setError('Something went wrong. Please try again.');
    }

    setIsLoading(false);

    // Save to Supabase history
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('search_history').insert({
        user_id: user.id,
        query: raw,
        occasion: intent.occasion,
        vibes: intent.vibes,
        budget_min: intent.budgetMin,
        budget_max: intent.budgetMax,
      });
    }

    // Update local history state
    const newHistory = [intent, ...intentHistory].slice(0, 50);
    setIntentHistory(newHistory);

    // Save last search locally (just for UX)
    const ls = { text: raw, occasion: intent.occasion };
    setLastSearch(ls);
    localStorage.setItem(STORAGE_KEYS.lastSearch, JSON.stringify(ls));
  }, [intentHistory]);

  const saveBundle = useCallback((bundle: Bundle) => {
    const exists = savedBundles.some(b => b.id === bundle.id);
    if (exists) return false;

    const saved: SavedBundle = { ...bundle, savedAt: Date.now() };
    const updated = [saved, ...savedBundles];
    setSavedBundles(updated);

    // Save to Supabase
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('saved_bundles').insert({
          user_id: user.id,
          bundle_name: bundle.bundle_name,
          bundle_data: bundle,
        }).select().single();

        // Update ID with Supabase's UUID
        if (data) {
          setSavedBundles(prev =>
            prev.map(b => b.id === bundle.id ? { ...b, id: data.id } : b)
          );
        }
      }
    })();

    return true;
  }, [savedBundles]);

  const unsaveBundle = useCallback((bundleId: string) => {
    const updated = savedBundles.filter(b => b.id !== bundleId);
    setSavedBundles(updated);

    // Delete from Supabase
    supabase.from('saved_bundles').delete().eq('id', bundleId);
  }, [savedBundles]);

  const isSaved = useCallback((bundleId: string) =>
    savedBundles.some(b => b.id === bundleId), [savedBundles]);

  return {
    bundles, currentIntent, savedBundles, intentHistory,
    lastSearch, isLoading, usedAI, error,
    search, saveBundle, unsaveBundle, isSaved,
  };
}
