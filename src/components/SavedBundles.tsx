import type { SavedBundle } from '../types';

interface Props {
  bundles: SavedBundle[];
  onUnsave: (id: string) => void;
}

export default function SavedBundles({ bundles, onUnsave }: Props) {
  if (bundles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="text-6xl mb-4 animate-float">🛍️</span>
        <h2 className="text-xl font-extrabold text-text mb-2">No saved bundles yet!</h2>
        <p className="text-sm text-text-secondary">
          Start exploring and save your favorites.<br/>
          They'll show up right here 💛
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-28 animate-slide-up">
      <div className="pt-6 pb-4">
        <h2 className="text-xl font-extrabold text-text">Your Saved Bundles 💛</h2>
        <p className="text-sm text-text-tertiary mt-1">{bundles.length} bundle{bundles.length !== 1 ? 's' : ''} saved</p>
      </div>

      {bundles.map((bundle, idx) => (
        <div
          key={bundle.id}
          className="mb-4 bg-white border border-border rounded-2xl overflow-hidden shadow-sm animate-slide-up"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-extrabold text-text">{bundle.bundle_name}</h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Saved {new Date(bundle.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className="text-lg font-extrabold text-coral">₹{bundle.total_price.toLocaleString()}</span>
            </div>

            {/* Mini product grid */}
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {bundle.items.slice(0, 4).map(item => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  loading="lazy"
                />
              ))}
            </div>

            <p className="text-xs text-text-secondary mb-3">{bundle.description}</p>

            <div className="flex gap-2">
              <button
                onClick={() => onUnsave(bundle.id)}
                className="flex-1 py-2.5 bg-white border border-border text-text-tertiary rounded-xl text-xs font-bold hover:border-red-300 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
              <button className="flex-[2] py-2.5 bg-gradient-to-r from-coral to-coral-light text-white rounded-xl text-xs font-bold shadow-md">
                🛒 Shop Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
