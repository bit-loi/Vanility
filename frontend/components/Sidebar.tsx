'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';

interface SidebarProps {
  activeTab: 'overview' | 'estimator' | 'calculator' | 'guidance' | 'matching';
  setActiveTab: (tab: 'overview' | 'estimator' | 'calculator' | 'guidance' | 'matching') => void;
  lang: 'en' | 'id';
  isOpen?: boolean;
  onClose?: () => void;
  isBuyerMode?: boolean;
}

const sidebarTranslations = {
  en: {
    overview: 'Overview',
    estimator: 'Grade Assessment',
    calculator: 'Value Add Calc',
    guidance: 'Curing Guidance',
    matching: 'Buyer Matching'
  },
  id: {
    overview: 'Ikhtisar Dasbor',
    estimator: 'Penilaian Mutu',
    calculator: 'Nilai Tambah',
    guidance: 'Panduan Curing',
    matching: 'Pencocokan Buyer'
  }
};

export default function Sidebar({ activeTab, setActiveTab, lang, isOpen, onClose, isBuyerMode }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('Petani');

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        setName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petani');
      }
    }
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setEmail(session.user.email || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
        setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Petani');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleTabSelect = (tab: 'overview' | 'estimator' | 'calculator' | 'guidance' | 'matching') => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const t = sidebarTranslations[lang];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#130f0c]/60 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar aside Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 border-r border-primary-ink bg-card-cream flex flex-col justify-between p-6 z-50 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo with Close button on mobile */}
          <div className="mb-8 pb-4 border-b border-primary-ink/20 flex justify-between items-center relative">
            <div className="flex-1 flex justify-center">
              <img src="/Logo_Vanility.png" className="w-28 h-auto object-contain block" alt="Vanility Logo" />
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="md:hidden absolute right-0 p-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[1px_1px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-primary-ink"
                title="Close Menu"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => handleTabSelect('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary-ink text-card-cream border-primary-ink cartoon-shadow'
                  : 'hover:bg-cream-base border-transparent text-primary-ink'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className="font-medium text-sm">{t.overview}</span>
            </button>

            {!isBuyerMode && (
              <>
                <button
                  onClick={() => handleTabSelect('estimator')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                    activeTab === 'estimator'
                      ? 'bg-primary-ink text-card-cream border-primary-ink cartoon-shadow'
                      : 'hover:bg-cream-base border-transparent text-primary-ink'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span className="font-medium text-sm">{t.estimator}</span>
                </button>

                <button
                  onClick={() => handleTabSelect('calculator')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                    activeTab === 'calculator'
                      ? 'bg-primary-ink text-card-cream border-primary-ink cartoon-shadow'
                      : 'hover:bg-cream-base border-transparent text-primary-ink'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                    <line x1="12" y1="9" x2="12" y2="17" />
                  </svg>
                  <span className="font-medium text-sm">{t.calculator}</span>
                </button>

                <button
                  onClick={() => handleTabSelect('guidance')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                    activeTab === 'guidance'
                      ? 'bg-primary-ink text-card-cream border-primary-ink cartoon-shadow'
                      : 'hover:bg-cream-base border-transparent text-primary-ink'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span className="font-medium text-sm">{t.guidance}</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleTabSelect('matching')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'matching'
                  ? 'bg-primary-ink text-card-cream border-primary-ink cartoon-shadow'
                  : 'hover:bg-cream-base border-transparent text-primary-ink'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span className="font-medium text-sm">
                {isBuyerMode ? (lang === 'en' ? 'Find Vanilla Batches' : 'Cari Batch Vanili') : t.matching}
              </span>
            </button>
          </nav>

          {/* Mobile Mode & Language Controls */}
        </div>

        <div className="border-t border-primary-ink/20 pt-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center space-x-3 overflow-hidden hover:opacity-85 transition-opacity text-left"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-10 h-10 rounded-full border-2 border-primary-ink object-cover flex-shrink-0 shadow-[1px_1px_0_0_#3b2313]"
                alt="Avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-primary-ink bg-[#EAE4D9] flex-shrink-0 flex items-center justify-center font-bold text-lg text-primary-ink shadow-[1px_1px_0_0_#3b2313]">
                {name ? name.charAt(0).toUpperCase() : 'P'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold leading-tight text-text-dark truncate max-w-[90px]">{name}</p>
              <p className="font-retro text-[5px] tracking-wider text-accent-gold mt-0.5">FARMER USER</p>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="p-1.5 hover:bg-[#EAE4D9] rounded-lg transition-colors border border-transparent text-primary-ink"
            title="Sign Out"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
