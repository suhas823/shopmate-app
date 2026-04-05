// Authentication and user profiles will be implemented in Phase 2 using Supabase Auth.
import { useState, useCallback } from 'react';
import IntentCapture from './components/IntentCapture';
import BundleResults from './components/BundleResults';
import SavedBundles from './components/SavedBundles';
import IntentHistory from './components/IntentHistory';
import LoadingBundles from './components/LoadingBundles';
import BottomNav from './components/BottomNav';
import { useShopMate } from './hooks/useShopMate';
import type { ParsedIntent } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const {
    bundles, currentIntent, savedBundles, intentHistory,
    lastSearch, isLoading, usedAI,
    search, saveBundle, unsaveBundle, isSaved,
  } = useShopMate();

  const handleSearch = useCallback(async (
    text: string,
    occasion?: string,
    vibes?: string[],
    budget?: [number, number]
  ) => {
    setActiveTab('bundles');
    await search(text, occasion, vibes, budget);
  }, [search]);

  const handleRerun = useCallback(async (intent: ParsedIntent) => {
    setActiveTab('bundles');
    await search(intent.raw, intent.occasion, intent.vibes, [intent.budgetMin, intent.budgetMax]);
  }, [search]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">
            Shop<span className="text-coral">Mate</span>
          </h1>
          <span className="text-xs text-text-tertiary font-semibold">by Suhas</span>
        </div>
      </header>

      {/* Content */}
      <main className="min-h-[calc(100vh-120px)]">
        {activeTab === 'home' && (
          <IntentCapture onSearch={handleSearch} lastSearch={lastSearch} />
        )}
        {activeTab === 'bundles' && (
          isLoading ? <LoadingBundles /> : (
            <BundleResults
              bundles={bundles}
              intent={currentIntent}
              onSave={saveBundle}
              isSaved={isSaved}
              usedAI={usedAI}
              onBack={() => setActiveTab('home')}
            />
          )
        )}
        {activeTab === 'saved' && (
          <SavedBundles bundles={savedBundles} onUnsave={unsaveBundle} />
        )}
        {activeTab === 'history' && (
          <IntentHistory history={intentHistory} onRerun={handleRerun} />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav
        active={activeTab}
        onChange={setActiveTab}
        savedCount={savedBundles.length}
      />
    </div>
  );
}

export default App;
