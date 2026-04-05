import { useState } from 'react';
import type { Bundle, ParsedIntent } from '../types';

interface Props {
  bundles: Bundle[];
  intent: ParsedIntent | null;
  onSave: (bundle: Bundle) => boolean;
  isSaved: (id: string) => boolean;
  usedAI: boolean;
  onBack: () => void;
}

export default function BundleResults({ bundles, intent, onSave, isSaved, usedAI, onBack }: Props) {
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = (bundle: Bundle) => {
    const success = onSave(bundle);
    if (success) showToast('💾 Bundle saved! Find it in your Saved tab anytime.');
    else showToast('Already saved!');
  };

  return (
    <div className="px-5 pb-28 animate-slide-up">
      {/* Header */}
      <div className="pt-6 pb-2 flex items-center justify-between">
        <div>
          <p className="text-text-tertiary text-sm">Hi there 👋</p>
          <h2 className="text-xl font-extrabold text-text">Here's what we found!</h2>
        </div>
        {usedAI && (
          <span className="px-3 py-1 bg-lavender/15 text-lavender text-xs font-bold rounded-full">
            ✨ AI-Powered
          </span>
        )}
      </div>

      {/* Intent echo */}
      {intent && (
        <div className="flex flex-wrap gap-2 mb-5">
          {intent.occasion && (
            <span className="px-3 py-1.5 bg-coral-soft text-coral text-xs font-bold rounded-full">
              {intent.occasion === 'travel' ? '🌊' : intent.occasion === 'party' ? '🎉' : intent.occasion === 'wedding' ? '💍' : intent.occasion === 'work' ? '💼' : '🎁'} {intent.occasion}
            </span>
          )}
          {intent.vibes.map(v => (
            <span key={v} className="px-3 py-1.5 bg-amber/10 text-amber text-xs font-bold rounded-full">
              {v}
            </span>
          ))}
          <span className="px-3 py-1.5 bg-sage/10 text-sage text-xs font-bold rounded-full">
            💰 Under ₹{intent.budgetMax.toLocaleString()}
          </span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 text-sm text-text-tertiary font-semibold hover:text-coral transition-colors"
      >
        ← New search
      </button>

      {/* Bundle cards */}
      {bundles.map((bundle, idx) => (
        <div key={bundle.id} className="mb-5 bg-white border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
          {/* Top nudge for first bundle */}
          {idx === 0 && (
            <div className="bg-gradient-to-r from-coral to-coral-light px-4 py-2 text-white text-xs font-bold text-center">
              This one's very you 💫
            </div>
          )}

          <div className="p-5">
            {/* Bundle name + score */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-extrabold text-text">{bundle.bundle_name}</h3>
              <span className="px-3 py-1 bg-coral-soft text-coral text-xs font-bold rounded-full whitespace-nowrap">
                {bundle.match_score}% match ✨
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-text-secondary mb-4">{bundle.description}</p>

            {/* Product grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {bundle.items.slice(0, 4).map(item => (
                <div key={item.id} className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-xl"
                    loading="lazy"
                  />
                  <p className="text-[10px] text-text-tertiary font-semibold mt-1 truncate">{item.name}</p>
                  <p className="text-[10px] text-coral font-bold">₹{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Price + count */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-extrabold text-coral">₹{bundle.total_price.toLocaleString()}</span>
                <span className="text-xs text-text-tertiary ml-2">{bundle.items.length} items</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-tertiary">
                <span>⭐</span>
                <span>{(bundle.items.reduce((s, p) => s + (p.rating || 4.3), 0) / bundle.items.length).toFixed(1)} avg</span>
              </div>
            </div>

            {/* Why this? */}
            <button
              onClick={() => setExpandedWhy(expandedWhy === bundle.id ? null : bundle.id)}
              className="w-full text-left mb-3"
            >
              <div className={`p-3 rounded-xl transition-all ${expandedWhy === bundle.id ? 'bg-amber/5 border border-amber/20' : 'bg-cream'}`}>
                <p className="text-xs font-bold text-text-secondary flex items-center gap-1">
                  💡 Why this?
                  <span className={`ml-auto transition-transform ${expandedWhy === bundle.id ? 'rotate-180' : ''}`}>▼</span>
                </p>
                {expandedWhy === bundle.id && (
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed animate-slide-up">
                    {bundle.why_picked}
                  </p>
                )}
              </div>
            </button>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(bundle)}
                disabled={isSaved(bundle.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  isSaved(bundle.id)
                    ? 'bg-sage/10 text-sage border border-sage/20'
                    : 'bg-white border border-border text-text-secondary hover:border-coral hover:text-coral'
                }`}
              >
                {isSaved(bundle.id) ? '✅ Saved' : '💛 Save'}
              </button>
              <button className="flex-[2] py-3 bg-gradient-to-r from-coral to-coral-light text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                🛒 Shop Now — ₹{bundle.total_price.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {bundles.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">🛍️</span>
          <p className="text-text-secondary font-semibold">No bundles yet. Tell us what you're looking for!</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-text text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
