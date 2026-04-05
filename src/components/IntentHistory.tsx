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
        <h2 className="text-xl font-extrabold text-text mb-2">No past searches yet</h2>
        <p className="text-sm text-text-secondary">
          Tell us what you're looking for!<br/>
          Your search history will appear here 📝
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-28 animate-slide-up">
      <div className="pt-6 pb-4">
        <h2 className="text-xl font-extrabold text-text">Search History 🕐</h2>
        <p className="text-sm text-text-tertiary mt-1">{history.length} past search{history.length !== 1 ? 'es' : ''}</p>
      </div>

      {history.map((intent, idx) => (
        <button
          key={`${intent.timestamp}-${idx}`}
          onClick={() => onRerun(intent)}
          className="w-full mb-3 p-4 bg-white border border-border rounded-2xl text-left hover:border-coral hover:shadow-sm transition-all animate-slide-up"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-bold text-text flex-1 pr-2">{intent.raw}</p>
            <span className="text-xs text-text-tertiary whitespace-nowrap">
              {new Date(intent.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 bg-coral-soft text-coral text-[10px] font-bold rounded-full">
              {OCCASION_EMOJIS[intent.occasion] || '👋'} {intent.occasion}
            </span>
            {intent.vibes.map(v => (
              <span key={v} className="px-2 py-1 bg-amber/10 text-amber text-[10px] font-bold rounded-full">
                {v}
              </span>
            ))}
            <span className="px-2 py-1 bg-sage/10 text-sage text-[10px] font-bold rounded-full">
              ₹{intent.budgetMin.toLocaleString()}–{intent.budgetMax.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-coral font-bold mt-2">Tap to search again →</p>
        </button>
      ))}
    </div>
  );
}
