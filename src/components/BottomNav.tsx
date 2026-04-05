interface Props {
  active: string;
  onChange: (tab: string) => void;
  savedCount: number;
}

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'bundles', label: 'Bundles', icon: '📦' },
  { id: 'saved', label: 'Saved', icon: '💛' },
  { id: 'history', label: 'History', icon: '🕐' },
];

export default function BottomNav({ active, onChange, savedCount }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-border px-2 py-2 z-40">
      <div className="flex justify-around">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative ${
              active === tab.id
                ? 'text-coral scale-105'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold">{tab.label}</span>
            {active === tab.id && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-coral rounded-full" />
            )}
            {tab.id === 'saved' && savedCount > 0 && (
              <div className="absolute -top-0.5 -right-1 w-4 h-4 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
