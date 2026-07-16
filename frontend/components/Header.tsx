'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';

interface HeaderProps {
  activeTab: 'overview' | 'estimator' | 'calculator' | 'guidance';
  timeStr: string;
  lang: 'en' | 'id';
  onToggleLang: () => void;
}

const headerTranslations = {
  en: {
    overview: 'Overview',
    estimator: 'Maturity & Grade Assessment',
    calculator: 'Value Addition Calculator',
    guidance: 'Curing Guidance Checklist'
  },
  id: {
    overview: 'Ikhtisar',
    estimator: 'Penilaian Kematangan & Mutu',
    calculator: 'Kalkulator Nilai Tambah',
    guidance: 'Panduan Verifikasi Curing'
  }
};

export default function Header({ activeTab, timeStr, lang, onToggleLang }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('Petani');

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petani');
      }
    }
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
        setDisplayName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Petani');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-primary-ink bg-card-cream px-8 flex items-center justify-between">
      <h1 className="font-sans font-light text-2xl tracking-tight text-text-dark leading-none">
        {headerTranslations[lang][activeTab]}
      </h1>

      <div className="flex items-center space-x-4 text-xs font-bold text-primary-ink">


        <button
          onClick={onToggleLang}
          className="flex items-center px-3 py-1.5 rounded-lg border-2 border-primary-ink bg-card-cream shadow-[1px_1px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-retro text-[8px]"
        >
          {lang === 'en' ? 'EN' : 'ID'}
        </button>

        <div className="px-3 py-1.5 rounded-lg border-2 border-primary-ink bg-card-cream shadow-[1px_1px_0_0_#3b2313] font-retro text-[9px] tracking-wider">
          {timeStr}
        </div>

        <button
          onClick={() => router.push('/profile')}
          className="flex items-center space-x-2 pl-2 hover:opacity-85 transition-opacity"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="w-8 h-8 rounded-full border-2 border-primary-ink object-cover shadow-[1px_1px_0_0_#3b2313]"
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-primary-ink bg-[#EAE4D9] flex items-center justify-center font-bold text-sm shadow-[1px_1px_0_0_#3b2313]">
              {initial}
            </div>
          )}
          <span className="font-bold text-xs text-text-dark truncate max-w-[80px]">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
