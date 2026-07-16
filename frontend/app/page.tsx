'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const translations = {
  en: {
    enterPortal: 'ENTER PORTAL',
    tagline: 'Empowering Indonesian Smallholders',
    boldHeading: 'Vanilla farmers need structured post-harvest processes that meet global export standards. ',
    mutedHeading: 'Vanility translates SNI grading regulations and IPB curing research into actionable, data-backed decisions before you sell your crop.',
    exploreFeatures: 'EXPLORE FEATURES',
    stats: {
      harvest: { val: 'Harvest', label: 'Maturity Estimate' },
      curing: { val: 'Curing', label: 'SNI Guidelines' },
      value: { val: 'Value', label: 'Financial Ratios' },
      grade: { val: 'Grade', label: 'Decision Support' }
    },
    features: {
      grading: {
        title: 'Grade Assessment',
        desc: 'Estimate harvest maturity and bean grade from pollination logs and curing durations — powered by SNI-standard rules and a trained ML model.'
      },
      calculator: {
        title: 'Value Calculator',
        desc: 'Project potential sales value differences and highlight gaps between exporting raw beans versus premium extracts.'
      },
      curing: {
        title: 'Curing Guide',
        desc: 'Ensure batch consistency through all major steps: sweating/fermenting, sun drying, and container conditioning boxes.'
      }
    },
    footer: 'Garuda Hacks 7.0 Event Submission • Made with passion for Indonesian Vanilla Farmers'
  },
  id: {
    enterPortal: 'MASUK PORTAL',
    tagline: 'Memberdayakan Petani Swadaya Indonesia',
    boldHeading: 'Petani vanilla membutuhkan proses pasca-panen terstruktur yang memenuhi standar ekspor global. ',
    mutedHeading: 'Vanility menerjemahkan regulasi mutu SNI dan riset curing IPB menjadi keputusan berbasis data sebelum Anda menjual hasil panen.',
    exploreFeatures: 'JELAJAHI FITUR',
    stats: {
      harvest: { val: 'Panen', label: 'Estimasi Kematangan' },
      curing: { val: 'Curing', label: 'Panduan Mutu SNI' },
      value: { val: 'Nilai', label: 'Proyeksi Keuangan' },
      grade: { val: 'Mutu', label: 'Dukungan Keputusan' }
    },
    features: {
      grading: {
        title: 'Penilaian Mutu',
        desc: 'Perkirakan kematangan panen dan mutu biji vanilla dari log penyerbukan dan durasi curing — didukung aturan SNI dan model ML terlatih.'
      },
      calculator: {
        title: 'Kalkulator Nilai',
        desc: 'Proyeksikan selisih nilai penjualan dan tunjukkan celah pendapatan antara mengekspor biji mentah vs ekstrak premium.'
      },
      curing: {
        title: 'Panduan Curing',
        desc: 'Pastikan konsistensi batch melalui langkah-langkah utama: sweating/fermentasi, pengeringan matahari, dan kotak pengondisian.'
      }
    },
    footer: 'Pengajuan Acara Garuda Hacks 7.0 • Dibuat dengan dedikasi untuk Petani Vanilla Indonesia'
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'id'>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('vanility_lang') as 'en' | 'id';
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'id' : 'en';
    setLang(nextLang);
    localStorage.setItem('vanility_lang', nextLang);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen w-screen bg-[#faf8f5] font-sans text-primary-ink flex flex-col justify-between overflow-x-hidden">
      {/* 1. Header (Original style with language switcher) */}
      <header className="border-b-2 border-primary-ink px-6 py-4 flex justify-between items-center bg-card-cream w-full z-50">
        <div className="flex items-center pl-8 md:pl-12">
          <img src="/Logo_Vanility.png" className="w-10 h-auto object-contain" alt="Logo" />
        </div>
        <div className="flex items-center space-x-3 pr-8 md:pr-12">
          {/* Language Switcher */}
          <button
            onClick={handleToggleLang}
            className="px-3 py-2 border-2 border-primary-ink bg-white font-black text-xs rounded-lg shadow-[2px_2px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-primary-ink uppercase"
          >
            {lang === 'en' ? 'EN' : 'ID'}
          </button>
        </div>
      </header>

      {/* 2. Hero Image Banner (Full Width, directly below header - no blur overlay) */}
      <div className="w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[420px] relative overflow-hidden border-b-2 border-primary-ink">
        <img 
          src="/Homepage-Image.webp" 
          alt="Indonesian Vanilla Farmers Banner" 
          className="w-full h-full object-cover object-center" 
        />
      </div>

      {/* 3. Hero Content Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Typographically styled heading container - matches user request */}
        {/* Grid layout with text on left and vanilla PNG on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-16">
          <div className="lg:col-span-2">
            <span className="font-retro text-xs tracking-[0.25em] text-[#75662c] uppercase block mb-6 font-bold text-left">
              {t.tagline}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#130f0c] leading-tight text-left tracking-tight mb-8">
              <span className="text-[#130f0c]">{t.boldHeading}</span>
              <span className="text-[#3b2313]/60 font-semibold">{t.mutedHeading}</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3.5 bg-primary-ink text-card-cream border-2 border-primary-ink font-bold text-sm rounded-xl shadow-[4px_4px_0_0_#75662c] hover:opacity-90 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
              >
                {t.enterPortal}
              </button>
              <a
                href="#features"
                className="px-8 py-3.5 bg-white text-primary-ink border-2 border-primary-ink font-bold text-sm rounded-xl shadow-[4px_4px_0_0_#3b2313] hover:bg-[#faf8f5] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer text-center"
              >
                {t.exploreFeatures}
              </a>
            </div>
          </div>
          <div className="lg:col-span-1 flex justify-center lg:justify-end relative">
            <img 
              src="/vanila-image.png" 
              className="w-full max-w-[280px] md:max-w-[320px] h-auto object-contain select-none" 
              alt="Vanilla Pods and Flower" 
            />
          </div>
        </div>

        {/* 4. Stats Section (Clean design matching user's second screenshot) */}
        <div id="stats" className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-[#3b2313]/10 mb-16 text-left">
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-[#130f0c] tracking-tight">{t.stats.harvest.val}</h4>
            <p className="text-[10px] md:text-xs font-retro tracking-[0.18em] text-[#75662c] uppercase font-bold mt-1.5">{t.stats.harvest.label}</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-[#130f0c] tracking-tight">{t.stats.curing.val}</h4>
            <p className="text-[10px] md:text-xs font-retro tracking-[0.18em] text-[#75662c] uppercase font-bold mt-1.5">{t.stats.curing.label}</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-[#130f0c] tracking-tight">{t.stats.value.val}</h4>
            <p className="text-[10px] md:text-xs font-retro tracking-[0.18em] text-[#75662c] uppercase font-bold mt-1.5">{t.stats.value.label}</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black text-[#130f0c] tracking-tight">{t.stats.grade.val}</h4>
            <p className="text-[10px] md:text-xs font-retro tracking-[0.18em] text-[#75662c] uppercase font-bold mt-1.5">{t.stats.grade.label}</p>
          </div>
        </div>

        {/* 5. Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-white shadow-[4px_4px_0_0_#3b2313] hover:-translate-y-1 transition-transform duration-200">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-12 h-12 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-6">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-black text-xl text-[#130f0c] uppercase mb-3">{t.features.grading.title}</h3>
            <p className="text-sm text-primary-ink/80 leading-relaxed">
              {t.features.grading.desc}
            </p>
          </div>

          <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-white shadow-[4px_4px_0_0_#3b2313] hover:-translate-y-1 transition-transform duration-200">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-12 h-12 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-6">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-black text-xl text-[#130f0c] uppercase mb-3">{t.features.calculator.title}</h3>
            <p className="text-sm text-primary-ink/80 leading-relaxed">
              {t.features.calculator.desc}
            </p>
          </div>

          <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-white shadow-[4px_4px_0_0_#3b2313] hover:-translate-y-1 transition-transform duration-200">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-12 h-12 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-6">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-black text-xl text-[#130f0c] uppercase mb-3">{t.features.curing.title}</h3>
            <p className="text-sm text-primary-ink/80 leading-relaxed">
              {t.features.curing.desc}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-primary-ink px-6 py-6 text-center bg-card-cream text-xs text-[#130f0c]/60 font-retro tracking-wider mt-12">
        {t.footer}
      </footer>
    </div>
  );
}
