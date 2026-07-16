import React from 'react';

interface SidebarProps {
  activeTab: 'overview' | 'estimator' | 'calculator' | 'guidance';
  setActiveTab: (tab: 'overview' | 'estimator' | 'calculator' | 'guidance') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#2C1E15] bg-[#FAF8F5] flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center mb-8 pb-4 border-b border-[#2C1E15]/20">
          <svg className="w-8 h-8 mr-2 text-[#2C1E15]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22C2 22 8 20 12 16C16 12 22 2 22 2C22 2 12 8 8 12C4 16 2 22 2 22Z" />
            <path d="M12 16L8 12" />
            <path d="M17 11L13 7" />
            <path d="M7 21L3 17" />
          </svg>
          <span className="text-xl font-bold tracking-wider">VANILITY</span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'overview'
                ? 'bg-[#2C1E15] text-[#FAF8F5] border-[#2C1E15]'
                : 'hover:bg-[#EAE4D9] border-transparent text-[#2C1E15]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'estimator'
                ? 'bg-[#2C1E15] text-[#FAF8F5] border-[#2C1E15]'
                : 'hover:bg-[#EAE4D9] border-transparent text-[#2C1E15]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="font-medium text-sm">Grade Estimator</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'calculator'
                ? 'bg-[#2C1E15] text-[#FAF8F5] border-[#2C1E15]'
                : 'hover:bg-[#EAE4D9] border-transparent text-[#2C1E15]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="15" y2="17" />
              <line x1="12" y1="9" x2="12" y2="17" />
            </svg>
            <span className="font-medium text-sm">Value Add Calc</span>
          </button>

          <button
            onClick={() => setActiveTab('guidance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'guidance'
                ? 'bg-[#2C1E15] text-[#FAF8F5] border-[#2C1E15]'
                : 'hover:bg-[#EAE4D9] border-transparent text-[#2C1E15]'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="font-medium text-sm">Curing Guidance</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-[#2C1E15]/20 pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border border-[#2C1E15] bg-[#EAE4D9] flex items-center justify-center font-bold text-lg">
            Y
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Pak Yuven</p>
            <p className="text-xs text-[#2C1E15]/60 leading-none">Farmer Admin</p>
          </div>
        </div>
        <button className="p-1.5 hover:bg-[#EAE4D9] rounded-lg transition-colors border border-transparent">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
