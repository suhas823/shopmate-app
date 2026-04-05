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
  'Try: outfit for a Goa trip under 3K...',
  'Try: birthday gift for my roommate 🎁',
  'Try: kuch smart dikhne wala office ke liye',
  'Try: sangeet outfit, ethnic but trendy',
  'Try: vacation wardrobe for Manali ❄️',
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
      {/* Greeting */}
      <div className="pt-6 pb-4">
        <p className="text-text-tertiary text-sm">Hey there 👋</p>
        <h1 className="text-2xl font-extrabold text-text mt-1">
          What are you shopping for?
        </h1>
      </div>

      {/* Last search */}
      {lastSearch && (
        <button
          onClick={() => onSearch(lastSearch.text, lastSearch.occasion)}
          className="w-full mb-4 p-3 bg-coral-soft rounded-2xl flex items-center gap-3 text-left hover:scale-[1.01] transition-transform"
        >
          <span className="text-lg">🔄</span>
          <div>
            <p className="text-xs text-text-tertiary font-semibold">Last search</p>
            <p className="text-sm text-text font-bold truncate">{lastSearch.text}</p>
          </div>
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
          className="w-full p-4 pr-14 bg-white border-2 border-border rounded-2xl text-[15px] text-text resize-none focus:outline-none focus:border-coral focus:shadow-[0_0_0_3px_rgba(232,132,107,0.15)] transition-all placeholder:text-text-tertiary"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <button
          onClick={handleSubmit}
          className="absolute right-3 bottom-3 w-10 h-10 bg-gradient-to-br from-coral to-coral-light rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="text-xs text-text-tertiary mb-6 px-1">
        Type like you'd text a friend — in English, Hindi, or Hinglish 💛
      </p>

      {/* Occasion chips */}
      <div className="mb-5">
        <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(o => (
            <button
              key={o.label}
              onClick={() => handleOccasionClick(o.value, o.label)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                occasion === o.value
                  ? 'bg-coral text-white shadow-md scale-[1.02]'
                  : 'bg-white border border-border text-text-secondary hover:border-coral hover:text-coral'
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe tags */}
      <div className="mb-5">
        <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">What's the vibe?</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <button
              key={v.value}
              onClick={() => toggleVibe(v.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedVibes.includes(v.value)
                  ? 'bg-coral-soft border-2 border-coral text-coral scale-[1.02]'
                  : 'bg-white border border-border text-text-secondary hover:border-coral-light hover:text-coral'
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowBudget(!showBudget)}
          className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1"
        >
          Budget range (optional)
          <span className={`transition-transform ${showBudget ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showBudget && (
          <div className="mt-3 p-4 bg-white border border-border rounded-2xl animate-slide-up">
            <div className="flex justify-between text-sm font-bold text-text mb-2">
              <span>₹{budgetRange[0].toLocaleString()}</span>
              <span>₹{budgetRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={budgetRange[1]}
              onChange={e => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
              className="w-full accent-coral"
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-coral to-coral-light text-white font-bold text-[17px] rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
      >
        ✨ Find My Bundle
      </button>
    </div>
  );
}
