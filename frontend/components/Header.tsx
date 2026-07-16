import React from 'react';

interface HeaderProps {
  activeTab: 'overview' | 'estimator' | 'calculator' | 'guidance';
  timeStr: string;
}

export default function Header({ activeTab, timeStr }: HeaderProps) {
  return (
    <header className="h-16 border-b border-primary-ink bg-card-cream px-8 flex items-center justify-between">
      <h1 className="font-sans font-light text-2xl tracking-tight text-text-dark leading-none">
        {activeTab === 'overview' && 'Overview'}
        {activeTab === 'estimator' && 'Maturity & Grade Estimator'}
        {activeTab === 'calculator' && 'Value Addition Calculator'}
        {activeTab === 'guidance' && 'Curing Guidance Checklist'}
      </h1>

      <div className="flex items-center space-x-4 text-xs font-bold text-primary-ink">
        <div className="flex items-center px-3 py-1.5 rounded-lg border-2 border-primary-ink bg-card-cream shadow-[1px_1px_0_0_#3b2313]">
          <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span className="font-retro text-[8px]">MGR 26C</span>
        </div>

        <div className="flex items-center px-3 py-1.5 rounded-lg border-2 border-primary-ink bg-card-cream shadow-[1px_1px_0_0_#3b2313]">
          <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="font-retro text-[8px]">EN</span>
        </div>

        <div className="px-3 py-1.5 rounded-lg border-2 border-primary-ink bg-card-cream shadow-[1px_1px_0_0_#3b2313] font-retro text-[9px] tracking-wider">
          {timeStr}
        </div>

        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full border-2 border-primary-ink bg-[#EAE4D9] flex items-center justify-center font-bold text-sm shadow-[1px_1px_0_0_#3b2313]">
            Y
          </div>
          <span className="font-bold text-xs text-text-dark">Pak Yuven</span>
        </div>
      </div>
    </header>
  );
}
