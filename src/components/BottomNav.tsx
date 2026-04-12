interface Props {
  active: string;
  onChange: (tab: string) => void;
  savedCount: number;
}

const TABS = [
  {
    id: 'home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#7C5CFC' : '#6B6B80'} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'bundles',
    label: 'Bundles',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#7C5CFC' : '#6B6B80'} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill={active ? '#7C5CFC' : 'none'} stroke={active ? '#7C5CFC' : '#6B6B80'} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" stroke={active ? '#7C5CFC' : '#6B6B80'} strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange, savedCount }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass border-t border-glass-border px-2 py-2 z-40">
      <div className="flex justify-around">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative ${
              active === tab.id
                ? 'scale-105'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            {/* Active pill background */}
            {active === tab.id && (
              <div className="absolute inset-0 rounded-xl bg-purple/10 border border-purple/20" />
            )}
            <span className="relative z-10">{tab.icon(active === tab.id)}</span>
            <span className={`relative z-10 text-[10px] font-semibold ${active === tab.id ? 'text-purple-light' : 'text-text-tertiary'}`}>
              {tab.label}
            </span>
            {tab.id === 'saved' && savedCount > 0 && (
              <div className="absolute -top-0.5 right-1 w-4 h-4 bg-gradient-to-r from-purple to-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center z-20">
                {savedCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
