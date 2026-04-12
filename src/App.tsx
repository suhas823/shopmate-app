import { useState, useCallback } from 'react';
import IntentCapture from './components/IntentCapture';
import FollowUpQuestions from './components/FollowUpQuestions';
import BundleResults from './components/BundleResults';
import SavedBundles from './components/SavedBundles';
import IntentHistory from './components/IntentHistory';
import LoadingBundles from './components/LoadingBundles';
import BottomNav from './components/BottomNav';
import { useShopMate } from './hooks/useShopMate';
import type { ParsedIntent } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [pendingSearch, setPendingSearch] = useState<{
    text: string;
    occasion?: string;
    vibes?: string[];
    budget?: [number, number];
  } | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);

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
    // FIX: Default to 'casual' if no occasion selected (fixes text-only search)
    const resolvedOccasion = occasion || 'casual';
    setPendingSearch({ text, occasion: resolvedOccasion, vibes, budget });
    setShowFollowUp(true);
    setActiveTab('bundles');
  }, []);

  const handleFollowUpComplete = useCallback(async (answers: Record<string, string>) => {
    setShowFollowUp(false);
    if (pendingSearch) {
      const enriched = pendingSearch.text + '. ' + Object.values(answers).join(', ');
      await search(enriched, pendingSearch.occasion, pendingSearch.vibes, pendingSearch.budget);
    }
  }, [pendingSearch, search]);

  const handleFollowUpSkip = useCallback(async () => {
    setShowFollowUp(false);
    if (pendingSearch) {
      await search(pendingSearch.text, pendingSearch.occasion, pendingSearch.vibes, pendingSearch.budget);
    }
  }, [pendingSearch, search]);

  const handleRerun = useCallback(async (intent: ParsedIntent) => {
    setActiveTab('bundles');
    setShowFollowUp(false);
    await search(intent.raw, intent.occasion, intent.vibes, [intent.budgetMin, intent.budgetMax]);
  }, [search]);

  return (
    <div className="min-h-screen bg-bg-primary bg-gradient-mesh">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-glass-border px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-gradient">Shop</span><span className="text-text">Mate</span>
          </h1>
          <span className="text-[10px] text-text-tertiary font-medium tracking-wider uppercase">by Suhas</span>
        </div>
      </header>

      {/* Content */}
      <main className="min-h-[calc(100vh-120px)]">
        {activeTab === 'home' && (
          <IntentCapture onSearch={handleSearch} lastSearch={lastSearch} />
        )}
        {activeTab === 'bundles' && (
          showFollowUp && pendingSearch?.occasion ? (
            <FollowUpQuestions
              occasion={pendingSearch.occasion}
              onComplete={handleFollowUpComplete}
              onSkip={handleFollowUpSkip}
            />
          ) : isLoading ? (
            <LoadingBundles />
          ) : (
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
