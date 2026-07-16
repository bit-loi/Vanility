'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-cream-base font-sans text-primary-ink flex flex-col justify-between">
      <header className="border-b-2 border-primary-ink px-6 py-4 flex justify-between items-center bg-card-cream">
        <div className="flex items-center">
          <img src="/Logo_Vanility.png" className="w-10 h-auto object-contain" alt="Logo" />
        </div>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 border-2 border-primary-ink bg-white font-bold text-xs rounded-lg shadow-[2px_2px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all"
        >
          ENTER PORTAL
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto">
        <div className="relative border-2 border-primary-ink p-8 rounded-2xl bg-card-cream shadow-[4px_4px_0_0_#3b2313] mb-12">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

          <span className="font-retro text-[8px] tracking-[0.25em] text-accent-gold uppercase block mb-3">Empowering Smallholders</span>
          <h1 className="text-3xl md:text-5xl font-black text-text-dark leading-tight uppercase mb-4">
            Decision Support System for Vanilla Farmers
          </h1>
          <p className="text-sm md:text-md text-primary-ink/80 max-w-2xl mx-auto leading-relaxed mb-6">
            Indonesia is the second largest global producer of vanilla, yet captures minimal export value because crops are sold raw. Vanility translates SNI grading standards and IPB curing research into a structured digital tool — no lab required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-primary-ink text-card-cream border-2 border-primary-ink font-bold text-sm rounded-xl shadow-[3px_3px_0_0_#75662c] hover:opacity-90 active:translate-y-0.5 active:shadow-none transition-all"
            >
              START GRADE ASSESSMENT
            </button>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-primary-ink border-2 border-primary-ink font-bold text-sm rounded-xl shadow-[3px_3px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
            >
              EXPLORE FEATURES
            </a>
          </div>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-white shadow-[3px_3px_0_0_#3b2313]">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-10 h-10 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-4">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-dark uppercase mb-2">Grade Assessment</h3>
            <p className="text-xs text-primary-ink/80 leading-relaxed">
              Estimate harvest maturity and bean grade from pollination logs and curing durations — powered by SNI-standard rules and a trained ML model.
            </p>
          </div>

          <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-white shadow-[3px_3px_0_0_#3b2313]">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-10 h-10 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-4">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-dark uppercase mb-2">Value Calculator</h3>
            <p className="text-xs text-primary-ink/80 leading-relaxed">
              Project potential sales value differences and highlight gaps between exporting raw beans versus premium extracts.
            </p>
          </div>

          <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-white shadow-[3px_3px_0_0_#3b2313]">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

            <div className="w-10 h-10 border-2 border-primary-ink bg-card-cream flex items-center justify-center rounded-lg mb-4">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-dark uppercase mb-2">Curing Guide</h3>
            <p className="text-xs text-primary-ink/80 leading-relaxed">
              Ensure batch consistency through all major steps: sweating/fermenting, sun drying, and container conditioning boxes.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-primary-ink px-6 py-4 text-center bg-card-cream text-xs text-primary-ink/60 font-retro text-[8px] uppercase tracking-wider">
        Garuda Hacks 7.0 Event Submission
      </footer>
    </div>
  );
}
