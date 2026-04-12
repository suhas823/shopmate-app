import { useState, useEffect, useRef } from 'react';

const OCCASIONS = [
  { emoji: '🎁', label: 'Gift', value: 'gift' },
  { emoji: '💼', label: 'Work', value: 'work' },
  { emoji: '🎉', label: 'Party', value: 'party' },
  { emoji: '✈️', label: 'Travel', value: 'travel' },
  { emoji: '💍', label: 'Wedding', value: 'wedding' },
  { emoji: '🏖️', label: 'Vacation', value: 'travel' },
];

const VIBES = [
  { emoji: '🌊', label: 'Chill', value: 'chill' },
  { emoji: '💃', label: 'Bold', value: 'bold' },
  { emoji: '🍃', label: 'Minimal', value: 'minimal' },
  { emoji: '✨', label: 'Festive', value: 'festive' },
  { emoji: '🔥', label: 'Streetwear', value: 'streetwear' },
  { emoji: '🌸', label: 'Ethnic', value: 'ethnic' },
];

const PLACEHOLDERS = [
  'outfit for a Goa trip under 3K...',
  'birthday gift for my roommate 🎁',
  'kuch smart dikhne wala office ke liye',
  'sangeet outfit, ethnic but trendy',
  'vacation wardrobe for Manali ❄️',
];

interface Props {
  onSearch: (text: string, occasion?: string, vibes?: string[], budget?: [number, number]) => void;
  lastSearch: { text: string; occasion: string } | null;
}

export default function IntentCapture({ onSearch, lastSearch }: Props) {
  const [text, setText] = useState('');
  const [occasion, setOccasion] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([1000, 3000]);
  const [showBudget, setShowBudget] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const toggleVibe = (v: string) => {
    setSelectedVibes(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
    );
  };

  const handleSubmit = () => {
    if (!text.trim() && !occasion) return;
    const query = text.trim() || `Looking for something for ${occasion}`;
    onSearch(query, occasion || undefined, selectedVibes.length ? selectedVibes : undefined, budgetRange);
  };

  const handleOccasionClick = (value: string, label: string) => {
    setOccasion(value);
    if (!text) setText(`I need something for ${label.toLowerCase()}`);
  };

  return (
    <div className="px-5 pb-28 animate-slide-up">
      {/* Hero */}
      <div className="pt-8 pb-5">
        <p className="text-text-tertiary text-sm font-medium">Hey there 👋</p>
        <h1 className="text-[26px] font-bold text-text mt-1 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          What are you <span className="text-gradient">shopping</span> for?
        </h1>
      </div>

      {/* Last search */}
      {lastSearch && (
        <button
          onClick={() => onSearch(lastSearch.text, lastSearch.occasion)}
          className="w-full mb-5 p-3.5 glass-card flex items-center gap-3.5 text-left hover:bg-bg-card-hover transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-soft flex items-center justify-center">
            <span className="text-lg">🔄</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">Last search</p>
            <p className="text-sm text-text font-semibold truncate group-hover:text-coral transition-colors">{lastSearch.text}</p>
          </div>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-text-tertiary">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Input */}
      <div className="relative mb-3">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          rows={2}
          className="w-full p-4 pr-14 glass-card text-[15px] text-text resize-none focus:outline-none transition-all placeholder:text-text-tertiary/50"
          style={{ borderColor: text ? 'rgba(124, 92, 252, 0.4)' : undefined, boxShadow: text ? '0 0 20px rgba(124, 92, 252, 0.15)' : undefined }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <button
          onClick={handleSubmit}
          className="absolute right-3 bottom-3 w-10 h-10 bg-gradient-to-br from-purple to-coral rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="text-xs text-text-tertiary mb-7 px-1">
        Type like you'd text a friend — in English, Hindi, or Hinglish 💛
      </p>

      {/* Occasion chips */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold text-text-tertiary mb-3 uppercase tracking-widest">Pick an occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(o => (
            <button
              key={o.label}
              onClick={() => handleOccasionClick(o.value, o.label)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                occasion === o.value
                  ? 'bg-gradient-to-r from-purple to-coral text-white shadow-lg shadow-purple/20 scale-[1.03]'
                  : 'glass-card text-text-secondary hover:text-text hover:bg-bg-card-hover'
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe tags */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold text-text-tertiary mb-3 uppercase tracking-widest">What's the vibe?</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <button
              key={v.value}
              onClick={() => toggleVibe(v.value)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                selectedVibes.includes(v.value)
                  ? 'glass-strong border-purple/40 text-purple-light shadow-lg shadow-purple/10 scale-[1.03]'
                  : 'glass-card text-text-secondary hover:text-text hover:bg-bg-card-hover'
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget toggle */}
      <div className="mb-7">
        <button
          onClick={() => setShowBudget(!showBudget)}
          className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest flex items-center gap-1.5"
        >
          💰 Budget range (optional)
          <span className={`transition-transform text-xs ${showBudget ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showBudget && (
          <div className="mt-3 p-5 glass-card animate-slide-up">
            <div className="flex justify-between text-sm font-bold mb-3">
              <span className="text-purple-light">₹{budgetRange[0].toLocaleString()}</span>
              <span className="text-coral">₹{budgetRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={budgetRange[1]}
              onChange={e => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-purple via-coral to-pink text-white font-bold text-[17px] rounded-2xl shadow-xl shadow-purple/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98] animate-gradient"
        style={{ backgroundSize: '200% 200%' }}
      >
        ✨ Find My Bundle
      </button>
    </div>
  );
}
