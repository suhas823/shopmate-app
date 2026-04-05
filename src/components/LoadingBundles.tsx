import { useState, useEffect } from 'react';

const STEPS = [
  'Understanding your intent...',
  'Matching your taste...',
  'Curating best picks across brands...',
  'Almost there... ✨',
];

export default function LoadingBundles() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      {/* Spinning rings */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 w-28 h-28 rounded-full border-[3px] border-coral/30 border-t-coral animate-spin-slow" />
        <div className="absolute inset-3 w-22 h-22 rounded-full border-[3px] border-sage/30 border-t-sage animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '2.5s' }} />
        <div className="absolute inset-6 w-16 h-16 rounded-full border-[3px] border-amber/30 border-t-amber animate-spin-slow" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-pulse-glow">✨</span>
        </div>
      </div>

      {/* Step text */}
      <p className="text-lg font-bold text-text mb-4 text-center animate-pulse-glow">
        {STEPS[step]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-coral scale-110' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
