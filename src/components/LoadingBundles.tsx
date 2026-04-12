import { useState, useEffect } from 'react';

const STEPS = [
  { text: 'Searching across stores...', emoji: '🔍' },
  { text: 'Found products on Myntra, AJIO, Amazon...', emoji: '🛍️' },
  { text: 'AI is curating your perfect bundles...', emoji: '✨' },
  { text: 'Almost ready...', emoji: '🎉' },
];

const STORES = ['Myntra', 'AJIO', 'Amazon', 'Flipkart', 'Meesho', 'Nykaa'];

export default function LoadingBundles() {
  const [step, setStep] = useState(0);
  const [visibleStores, setVisibleStores] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2500);
    const storeTimer = setInterval(() => {
      setVisibleStores(s => (s < STORES.length ? s + 1 : s));
    }, 600);
    return () => { clearInterval(stepTimer); clearInterval(storeTimer); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 bg-gradient-hero">
      {/* Animated orb */}
      <div className="relative w-32 h-32 mb-10">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-purple/30 animate-spin-slow" />
        {/* Middle ring */}
        <div
          className="absolute inset-3 rounded-full border-2 border-coral/30 animate-spin-slow"
          style={{ animationDirection: 'reverse', animationDuration: '2.5s' }}
        />
        {/* Inner glow */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-purple/20 to-coral/20 animate-glow" />
        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-pulse-glow">{STEPS[step].emoji}</span>
        </div>
      </div>

      {/* Step text */}
      <p className="text-lg font-bold text-text mb-2 text-center animate-fade-in" key={step}>
        {STEPS[step].text}
      </p>

      {/* Store badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 mt-4">
        {STORES.slice(0, visibleStores).map((store, i) => (
          <span
            key={store}
            className="px-3 py-1.5 glass-card text-xs font-semibold text-text-secondary animate-scale-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {store}
          </span>
        ))}
      </div>

      {/* Scanning line */}
      <div className="w-48 h-0.5 rounded-full overflow-hidden bg-glass-border">
        <div
          className="h-full w-1/3 bg-gradient-to-r from-purple to-coral rounded-full"
          style={{ animation: 'scan-line 1.5s ease-in-out infinite' }}
        />
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= step
                ? 'bg-gradient-to-r from-purple to-coral scale-110'
                : 'bg-glass-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
