import { useState } from 'react';
import type { Bundle, ParsedIntent } from '../types';

const STORE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Myntra': { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.3)' },
  'AJIO': { bg: 'rgba(251, 146, 60, 0.15)', text: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  'Amazon': { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  'Amazon.in': { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  'Flipkart': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.3)' },
  'Meesho': { bg: 'rgba(192, 132, 252, 0.15)', text: '#C084FC', border: 'rgba(192, 132, 252, 0.3)' },
  'Nykaa': { bg: 'rgba(244, 114, 182, 0.15)', text: '#F472B6', border: 'rgba(244, 114, 182, 0.3)' },
  'Tata CLiQ': { bg: 'rgba(129, 140, 248, 0.15)', text: '#818CF8', border: 'rgba(129, 140, 248, 0.3)' },
};

function getStoreStyle(source: string) {
  for (const [key, val] of Object.entries(STORE_COLORS)) {
    if (source.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { bg: 'rgba(255,255,255,0.08)', text: '#A1A1B5', border: 'rgba(255,255,255,0.12)' };
}

interface Props {
  bundles: Bundle[];
  intent: ParsedIntent | null;
  onSave: (bundle: Bundle) => boolean;
  isSaved: (id: string) => boolean;
  usedAI: boolean;
  onBack: () => void;
}

export default function BundleResults({ bundles, intent, onSave, isSaved, usedAI, onBack }: Props) {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(bundles[0]?.id || null);
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = (bundle: Bundle) => {
    const success = onSave(bundle);
    if (success) showToast('💾 Bundle saved!');
    else showToast('Already saved!');
  };

  const hasRealLinks = bundles.some(b => b.items.some(i => i.link && i.link.startsWith('http')));

  return (
    <div className="px-5 pb-28 animate-slide-up">
      {/* Header */}
      <div className="pt-6 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {hasRealLinks ? 'Real products, real links!' : "Here's what we found!"}
          </h2>
        </div>
        {usedAI && (
          <span className="px-3 py-1.5 glass-card text-purple-light text-[10px] font-bold border-purple/20">
            ✨ AI + Live
          </span>
        )}
      </div>

      {/* Intent echo */}
      {intent && (
        <div className="flex flex-wrap gap-2 mb-5">
          {intent.occasion && (
            <span className="px-3 py-1.5 text-[11px] font-semibold rounded-full" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF8E8E' }}>
              {intent.occasion === 'travel' ? '🌊' : intent.occasion === 'party' ? '🎉' : intent.occasion === 'wedding' ? '💍' : intent.occasion === 'work' ? '💼' : '🎁'} {intent.occasion}
            </span>
          )}
          {intent.vibes.map(v => (
            <span key={v} className="px-3 py-1.5 text-[11px] font-semibold rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
              {v}
            </span>
          ))}
          <span className="px-3 py-1.5 text-[11px] font-semibold rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
            💰 Under ₹{intent.budgetMax.toLocaleString()}
          </span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-5 text-sm text-text-tertiary font-medium hover:text-purple-light transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        New search
      </button>

      {/* No results */}
      {bundles.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">😅</span>
          <p className="text-text-secondary font-semibold mb-2">Couldn't find matching products</p>
          <p className="text-sm text-text-tertiary">Try a different search or adjust your budget</p>
        </div>
      )}

      {/* Bundle cards */}
      {bundles.map((bundle, idx) => (
        <div
          key={bundle.id}
          className="mb-5 glass-card overflow-hidden animate-slide-up"
          style={{ animationDelay: `${idx * 120}ms` }}
        >
          {/* Top badge for first */}
          {idx === 0 && (
            <div className="bg-gradient-to-r from-purple to-coral px-4 py-2 text-white text-xs font-bold text-center tracking-wide">
              Best match for you 💫
            </div>
          )}

          <div className="p-5">
            {/* Bundle name + score */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {bundle.bundle_name}
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple/20 to-coral/20 text-coral-light border border-coral/20">
                {bundle.match_score}% match
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-text-tertiary mb-4">{bundle.description}</p>

            {/* Product preview */}
            <button
              onClick={() => setExpandedBundle(expandedBundle === bundle.id ? null : bundle.id)}
              className="w-full text-left"
            >
              <div className="flex gap-2 mb-3">
                {bundle.items.slice(0, 4).map(item => (
                  <div key={item.id} className="relative flex-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-xl border border-glass-border"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/150x150/1a1a2e/7C5CFC?text=${encodeURIComponent('📦')}`; }}
                    />
                    {item.source && (
                      <span
                        className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[7px] font-bold rounded-md backdrop-blur-md"
                        style={{
                          background: getStoreStyle(item.source).bg,
                          color: getStoreStyle(item.source).text,
                          border: `1px solid ${getStoreStyle(item.source).border}`,
                        }}
                      >
                        {item.source.length > 10 ? item.source.slice(0, 10) : item.source}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-light font-semibold mb-2 flex items-center gap-1">
                {expandedBundle === bundle.id ? (
                  <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg> Hide details</>
                ) : (
                  <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg> Show all items & buy links</>
                )}
              </p>
            </button>

            {/* Expanded products */}
            {expandedBundle === bundle.id && (
              <div className="space-y-3 mb-4 animate-slide-up">
                {bundle.items.map(item => {
                  const storeStyle = getStoreStyle(item.source);
                  return (
                    <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-glass-border"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1a1a2e/7C5CFC?text=${encodeURIComponent('📦')}`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text leading-tight line-clamp-2">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-gradient">₹{item.price.toLocaleString()}</span>
                          {item.rating > 0 && (
                            <span className="text-xs text-amber">⭐ {item.rating}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold rounded-md"
                            style={{ background: storeStyle.bg, color: storeStyle.text, border: `1px solid ${storeStyle.border}` }}
                          >
                            {item.source}
                          </span>
                        </div>
                        {item.link && item.link.startsWith('http') && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.03] hover:shadow-lg"
                            style={{ background: storeStyle.bg, color: storeStyle.text, border: `1px solid ${storeStyle.border}` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Buy on {item.source} →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price + stores */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold text-gradient">₹{bundle.total_price.toLocaleString()}</span>
                <span className="text-xs text-text-tertiary ml-2">{bundle.items.length} items</span>
              </div>
              <div className="flex items-center gap-1">
                {[...new Set(bundle.items.map(i => i.source).filter(Boolean))].slice(0, 3).map(store => {
                  const s = getStoreStyle(store);
                  return (
                    <span key={store} className="px-2 py-0.5 text-[9px] font-bold rounded-md" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                      {store}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Why this */}
            <button
              onClick={() => setExpandedWhy(expandedWhy === bundle.id ? null : bundle.id)}
              className="w-full text-left mb-3"
            >
              <div className={`p-3 rounded-xl transition-all glass-card ${expandedWhy === bundle.id ? 'border-purple/20' : ''}`}>
                <p className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  💡 Why this?
                  <span className={`ml-auto transition-transform ${expandedWhy === bundle.id ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </p>
                {expandedWhy === bundle.id && (
                  <p className="text-xs text-text-tertiary mt-2 leading-relaxed animate-fade-in">
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
                    ? 'glass-card text-sage border-sage/20'
                    : 'glass-card text-text-secondary hover:text-purple-light hover:border-purple/30'
                }`}
              >
                {isSaved(bundle.id) ? '✅ Saved' : '💛 Save'}
              </button>
              <button
                onClick={() => setExpandedBundle(bundle.id)}
                className="flex-[2] py-3 bg-gradient-to-r from-purple to-coral text-white rounded-xl text-sm font-bold shadow-lg shadow-purple/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                🛒 View & Buy — ₹{bundle.total_price.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-strong text-text px-5 py-3 rounded-2xl text-sm font-bold shadow-xl animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
