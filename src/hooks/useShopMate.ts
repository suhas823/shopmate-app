import { useState, useCallback } from 'react';
import type { Bundle, SavedBundle, ParsedIntent } from '../types';
import { parseIntent, generateBundles, generateAIBundles } from '../services/aiService';

const STORAGE_KEYS = {
  savedBundles: 'shopmate_saved_bundles',
  intentHistory: 'shopmate_intent_history',
  lastSearch: 'shopmate_last_search',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useShopMate() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [currentIntent, setCurrentIntent] = useState<ParsedIntent | null>(null);
  const [savedBundles, setSavedBundles] = useState<SavedBundle[]>(
    () => loadFromStorage(STORAGE_KEYS.savedBundles, [])
  );
  const [intentHistory, setIntentHistory] = useState<ParsedIntent[]>(
    () => loadFromStorage(STORAGE_KEYS.intentHistory, [])
  );
  const [lastSearch, setLastSearch] = useState<{ text: string; occasion: string } | null>(
    () => loadFromStorage(STORAGE_KEYS.lastSearch, null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [usedAI, setUsedAI] = useState(false);

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

    // Try AI first, fall back to local
    let results: Bundle[] | null = null;
    try {
      results = await generateAIBundles(intent);
      if (results) setUsedAI(true);
    } catch { /* fallback */ }

    if (!results) {
      results = generateBundles(intent);
    }

    setBundles(results);
    setIsLoading(false);

    // Save to history
    const newHistory = [intent, ...intentHistory].slice(0, 50);
    setIntentHistory(newHistory);
    saveToStorage(STORAGE_KEYS.intentHistory, newHistory);

    const ls = { text: raw, occasion: intent.occasion };
    setLastSearch(ls);
    saveToStorage(STORAGE_KEYS.lastSearch, ls);

    return results;
  }, [intentHistory]);

  const saveBundle = useCallback((bundle: Bundle) => {
    const exists = savedBundles.some(b => b.id === bundle.id);
    if (exists) return false;

    const saved: SavedBundle = { ...bundle, savedAt: Date.now() };
    const updated = [saved, ...savedBundles];
    setSavedBundles(updated);
    saveToStorage(STORAGE_KEYS.savedBundles, updated);
    return true;
  }, [savedBundles]);

  const unsaveBundle = useCallback((bundleId: string) => {
    const updated = savedBundles.filter(b => b.id !== bundleId);
    setSavedBundles(updated);
    saveToStorage(STORAGE_KEYS.savedBundles, updated);
  }, [savedBundles]);

  const isSaved = useCallback((bundleId: string) => 
    savedBundles.some(b => b.id === bundleId), [savedBundles]);

  return {
    bundles, currentIntent, savedBundles, intentHistory,
    lastSearch, isLoading, usedAI,
    search, saveBundle, unsaveBundle, isSaved,
  };
}
