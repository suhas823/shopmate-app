import type { ParsedIntent } from '../types';

interface Props {
  history: ParsedIntent[];
  onRerun: (intent: ParsedIntent) => void;
}

const OCCASION_EMOJIS: Record<string, string> = {
  travel: '✈️', party: '🎉', wedding: '💍', work: '💼', gift: '🎁', casual: '👋',
};

export default function IntentHistory({ history, onRerun }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="text-6xl mb-4 animate-float">💬</span>
        <h2 className="text-xl font-bold text-text mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No past searches yet</h2>
        <p className="text-sm text-text-tertiary">
          Tell us what you're looking for!<br/>
          Your search history will appear here 📝
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-28 animate-slide-up">
      <div className="pt-6 pb-4">
        <h2 className="text-xl font-bold text-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Search History</h2>
        <p className="text-sm text-text-tertiary mt-1">{history.length} past search{history.length !== 1 ? 'es' : ''}</p>
      </div>

      {history.map((intent, idx) => (
        <button
          key={`${intent.timestamp}-${idx}`}
          onClick={() => onRerun(intent)}
          className="w-full mb-3 p-4 glass-card text-left hover:bg-bg-card-hover hover:border-purple/20 hover:shadow-lg hover:shadow-purple/10 transition-all animate-slide-up group"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-text flex-1 pr-2 group-hover:text-purple-light transition-colors">{intent.raw}</p>
            <span className="text-[10px] text-text-tertiary whitespace-nowrap">
              {new Date(intent.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF8E8E' }}>
              {OCCASION_EMOJIS[intent.occasion] || '👋'} {intent.occasion}
            </span>
            {intent.vibes.map(v => (
              <span key={v} className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                {v}
              </span>
            ))}
            <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
              ₹{intent.budgetMin.toLocaleString()}–{intent.budgetMax.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-purple-light font-semibold mt-2 flex items-center gap-1">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tap to search again
          </p>
        </button>
      ))}
    </div>
  );
}
