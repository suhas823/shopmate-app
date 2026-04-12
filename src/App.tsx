import { useState, useCallback } from 'react';
import IntentCapture from './components/IntentCapture';
import FollowUpQuestions from './components/FollowUpQuestions';
import BundleResults from './components/BundleResults';
import SavedBundles from './components/SavedBundles';
import IntentHistory from './components/IntentHistory';
import LoadingBundles from './components/LoadingBundles';
import BottomNav from './components/BottomNav';
import AuthScreen from './components/AuthScreen';
import { useShopMate } from './hooks/useShopMate';
import { useAuth } from './hooks/useAuth';
import type { ParsedIntent } from './types';

function App() {
  const { user, loading: authLoading, error: authError, signIn, signUp, signInWithGoogle, signOut, clearError } = useAuth();

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

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-gradient-mesh">
        <div className="text-center animate-pulse-glow">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
            <span className="text-gradient">Shop</span><span className="text-text">Mate</span>
          </h1>
          <p className="text-text-tertiary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show auth screen
  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
        error={authError}
        clearError={clearError}
      />
    );
  }

  // Logged in → show app
  return (
    <div className="min-h-screen bg-bg-primary bg-gradient-mesh">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-glass-border px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-gradient">Shop</span><span className="text-text">Mate</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-tertiary font-medium truncate max-w-[120px]">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="w-8 h-8 glass-card rounded-full flex items-center justify-center hover:bg-bg-card-hover transition-all"
              title="Sign out"
            >
              <svg width="14" height="14" fill="none" stroke="#A1A1B5" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
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
