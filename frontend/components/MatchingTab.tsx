'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Batch } from './types';

interface MatchingTabProps {
  batches: Batch[];
  lang: 'en' | 'id';
  isBuyerMode?: boolean;
}

interface Buyer {
  id: string;
  company_name: string;
  country: string;
  industry: string;
  required_grade: string;
  min_quantity_kg: number;
  max_quantity_kg: number;
  preferred_origin: string;
  description: string;
  contact_email: string;
}

interface RecommendedBuyerMatch {
  buyer: Buyer;
  compatibility_score: number;
  explanation?: string;
}

interface MatchResponse {
  batch_id: string;
  export_readiness_score: number;
  recommended_buyers: RecommendedBuyerMatch[];
}

const translations = {
  en: {
    selectBatch: 'Select a Vanilla Batch to Match',
    noBatches: 'No batches found. Please go to "Grade Assessment" to estimate and save a batch first.',
    matchingLabel: 'Running Matching Engine...',
    readinessScore: 'Export Readiness Score',
    recommendedTitle: 'Recommended Export Buyers',
    advisorTitle: 'LLM Export Advisor Recommendations',
    compatibility: 'Compatibility',
    reqGrade: 'Required Grade',
    demand: 'Demand Range',
    prefOrigin: 'Preferred Origin',
    requestContact: 'Request Contact Partner',
    requestSent: 'Request Sent ✓',
    contactAlertTitle: 'Request Sent!',
    contactAlertText: (company: string, email: string) => {
      if (email) {
        return `A secure contact request has been sent to <strong>${company}</strong>. We have shared your verified batch specifications. They will contact you at <strong>${email}</strong>.`;
      }
      return `A secure purchase request has been sent for batch from <strong>${company}</strong>. The seller will be notified of your interest.`;
    },
    readinessDescription: 'This score measures how close your curing metrics align with the Indonesian National Standard (SNI) for global export.',
    methodologyNote: 'Methodology: The compatibility score is determined by a rule-based matching engine comparing grade requirements, quantity bounds, regional origin, and industry alignment. The narrative explanation is drafted in real-time by the OpenRouter Export Advisor.',
    placeholderPrompt: 'Select a batch from the dropdown above to analyze buyer compatibility.',
    // Buyer marketplace translations
    marketplaceTitle: 'Available Seller Products',
    marketplaceSub: 'Browse export-ready vanilla batches from verified farmers and cooperatives',
    productGrade: 'Grade',
    productQtyWet: 'Wet Qty',
    productQtyDry: 'Dry Qty',
    productFarmer: 'Farmer',
    productOrigin: 'Origin',
    productStatus: 'Curing Status',
    buyBtn: 'Request to Purchase',
    buyBtnSent: 'Purchase Request Sent ✓',
    purchaseAlertSuccess: 'Purchase Request Sent!',
    purchaseAlertText: (farmer: string) => `Your purchase request has been sent for the batch from <strong>${farmer}</strong>. The seller will be notified of your interest.`,
    emptyMarket: 'No export-ready vanilla batches available in the market currently.',
    emptyMarketSub: 'Check back later when farmers have completed their curing process.',
    marketInsight: 'Marketplace Insights',
  },
  id: {
    selectBatch: 'Pilih Batch Vanili untuk Dicocokkan',
    noBatches: 'Belum ada batch. Silakan masuk ke menu "Penilaian Mutu" untuk menyimpan batch terlebih dahulu.',
    matchingLabel: 'Menjalankan Sistem Pencocokan...',
    readinessScore: 'Skor Kesiapan Ekspor',
    recommendedTitle: 'Rekomendasi Pembeli Ekspor',
    advisorTitle: 'Analisis Penasihat Ekspor LLM',
    compatibility: 'Kompatibilitas',
    reqGrade: 'Grade Minimum',
    demand: 'Rentang Permintaan',
    prefOrigin: 'Asal Pilihan',
    requestContact: 'Hubungkan Mitra Pembeli',
    requestSent: 'Permintaan Dikirim ✓',
    contactAlertTitle: 'Permintaan Dikirim!',
    contactAlertText: (company: string, email: string) => {
      if (email) {
        return `Permintaan kontak aman telah dikirim ke <strong>${company}</strong>. Spesifikasi batch Anda yang terverifikasi telah dibagikan. Mereka akan menghubungi Anda di <strong>${email}</strong>.`;
      }
      return `Permintaan pembelian telah dikirim untuk batch dari <strong>${company}</strong>. Penjual akan diberitahu tentang minat Anda.`;
    },
    readinessDescription: 'Skor ini mengukur seberapa dekat metrik curing Anda dengan Standar Nasional Indonesia (SNI) untuk ekspor global.',
    methodologyNote: 'Metodologi: Skor kompatibilitas ditentukan oleh mesin pencocokan berbasis aturan (rule-based) yang membandingkan standar grade, jumlah kuantitas, asal wilayah, dan profil industri. Narasi penjelasan dibuat secara real-time oleh Penasihat Ekspor LLM OpenRouter.',
    placeholderPrompt: 'Pilih batch dari dropdown di atas untuk memulai analisis kecocokan buyer.',
    // Buyer marketplace translations
    marketplaceTitle: 'Produk Tersedia dari Petani',
    marketplaceSub: 'Jelajahi batch vanili siap ekspor dari petani dan koperasi terverifikasi',
    productGrade: 'Grade',
    productQtyWet: 'Basah',
    productQtyDry: 'Kering',
    productFarmer: 'Petani',
    productOrigin: 'Asal',
    productStatus: 'Status Curing',
    buyBtn: 'Ajukan Pembelian',
    buyBtnSent: 'Pembelian Dikirim ✓',
    purchaseAlertSuccess: 'Permintaan Pembelian Dikirim!',
    purchaseAlertText: (farmer: string) => `Permintaan pembelian Anda telah dikirim untuk batch dari <strong>${farmer}</strong>. Penjual akan diberitahu tentang minat Anda.`,
    emptyMarket: 'Belum ada batch vanili siap ekspor yang tersedia di pasar saat ini.',
    emptyMarketSub: 'Silakan periksa kembali nanti setelah petani menyelesaikan proses curing.',
    marketInsight: 'Wawasan Pasar',
  }
};

export default function MatchingTab({ batches, lang, isBuyerMode }: MatchingTabProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  const t = translations[lang];

  const displayBatches = isBuyerMode 
    ? batches.filter(b => b.status === 'Export Ready') 
    : batches;

  // Auto-select first batch if available
  useEffect(() => {
    if (displayBatches.length > 0) {
      if (!selectedBatchId || !displayBatches.find(b => b.id === selectedBatchId)) {
        setSelectedBatchId(displayBatches[0].id);
      }
    } else {
      setSelectedBatchId('');
      setMatchData(null);
    }
  }, [displayBatches, selectedBatchId]);

  // Fetch match details when batch is selected
  useEffect(() => {
    if (!selectedBatchId) return;

    const selectedBatch = displayBatches.find(b => b.id === selectedBatchId);
    if (!selectedBatch || !selectedBatch.dbId) return;

    let active = true;
    async function fetchMatches() {
      setLoading(true);
      try {
        const { createClient } = await import('../utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`http://127.0.0.1:8000/api/matches/${selectedBatch.dbId}?lang=${lang}`, {
          headers
        });
        if (!res.ok) throw new Error('API error matching buyers');
        const data = await res.json();
        if (active) {
          setMatchData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchMatches();
    return () => {
      active = false;
    };
  }, [selectedBatchId, displayBatches, lang]);

  const handleRequestContact = async (buyer: Buyer) => {
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('http://127.0.0.1:8000/api/contact-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ batch_id: selectedBatch?.dbId })
      });
      if (!res.ok) throw new Error('API error sending contact request');

      setSentRequests(prev => ({ ...prev, [buyer.id]: true }));
      Swal.fire({
        icon: 'success',
        title: t.contactAlertTitle,
        html: `<p style="font-size: 14px; color: #3b2313;">${t.contactAlertText(buyer.company_name, buyer.contact_email)}</p>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b2313',
        background: '#fbf7ee',
        color: '#3b2313',
        iconColor: '#065f46',
        customClass: {
          popup: 'rounded-xl border-2 border-primary-ink',
          title: 'text-xl font-black',
          confirmButton: 'rounded-lg font-bold text-sm px-6 py-2',
        },
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: 'Could not send contact request. Please try again.',
        background: '#fbf7ee',
        color: '#3b2313',
        customClass: { popup: 'rounded-xl border-2 border-primary-ink' }
      });
    }
  };

  // Buyer mode: purchase request for any batch without needing API match data
  const handleBuyerPurchaseRequest = async (batch: Batch) => {
    if (!batch.dbId) {
      console.error('Missing dbId for batch:', batch.id);
      return;
    }
    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('http://127.0.0.1:8000/api/contact-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ batch_id: batch.dbId })
      });
      if (!res.ok) throw new Error('API error sending purchase request');

      setSentRequests(prev => ({ ...prev, [batch.id]: true }));
      Swal.fire({
        icon: 'success',
        title: t.purchaseAlertSuccess,
        html: `<p style="font-size: 14px; color: #3b2313;">${t.purchaseAlertText(batch.name)}</p>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b2313',
        background: '#fbf7ee',
        color: '#3b2313',
        iconColor: '#065f46',
        customClass: {
          popup: 'rounded-xl border-2 border-primary-ink',
          title: 'text-xl font-black',
          confirmButton: 'rounded-lg font-bold text-sm px-6 py-2',
        },
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: lang === 'en' ? 'Purchase Request Failed' : 'Permintaan Gagal',
        text: lang === 'en' ? 'Could not send purchase request. Please try again.' : 'Gagal mengirim permintaan pembelian. Silakan coba lagi.',
        background: '#fbf7ee',
        color: '#3b2313',
        customClass: { popup: 'rounded-xl border-2 border-primary-ink' }
      });
    }
  };

  const selectedBatch = displayBatches.find(b => b.id === selectedBatchId);

  if (displayBatches.length === 0) {
    return (
      <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-card-cream cartoon-shadow-lg text-center flex flex-col items-center justify-center h-64">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <svg className="w-12 h-12 text-primary-ink/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-bold text-primary-ink/60">
          {isBuyerMode 
            ? (lang === 'en' ? 'No export-ready vanilla batches available in the market currently.' : 'Belum ada batch vanili siap ekspor yang tersedia di pasar saat ini.') 
            : t.noBatches}
        </p>
      </div>
    );
  }

  // ----- BUYER MODE: Product Marketplace Grid -----
  if (isBuyerMode) {
    const totalBatches = displayBatches.length;
    const gradeADist = displayBatches.filter(b => b.grade === 'Grade A').length;
    return (
      <div className="space-y-6">
        {/* Marketplace Header */}
        <div className="relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow-lg">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">{t.marketplaceTitle}</h3>
              <p className="text-xs text-primary-ink/70 mt-1 max-w-xl">{t.marketplaceSub}</p>
            </div>
            <div className="text-right">
              <span className="font-retro text-[8px] text-primary-ink/50 uppercase">{lang === 'en' ? 'Available' : 'Tersedia'}</span>
              <p className="font-mono font-black text-sm text-text-dark">{totalBatches} {lang === 'en' ? 'batch(es)' : 'batch'}</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayBatches.map((batch) => {
            const isSent = !!sentRequests[batch.id];
            return (
              <div key={batch.id} className="relative border-2 border-primary-ink rounded-xl bg-card-cream cartoon-shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                {/* Grade stripe */}
                <div className={`h-2 w-full ${
                  batch.grade === 'Grade A' ? 'bg-[#065f46]' :
                  batch.grade === 'Grade B' ? 'bg-[#7F6000]' :
                  'bg-[#C65911]'
                }`} />

                <div className="p-4 flex flex-col flex-1">
                  {/* Batch header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm text-text-dark truncate">{batch.name}</h4>
                      <p className="text-[9px] font-bold text-primary-ink/50 uppercase tracking-wide">
                        {batch.region}
                      </p>
                    </div>
                    <span className={`ml-2 shrink-0 px-2 py-1 rounded text-[9px] font-bold border-2 border-primary-ink ${
                      batch.grade === 'Grade A' ? 'bg-[#ecfdf5] text-[#065f46]' :
                      batch.grade === 'Grade B' ? 'bg-[#FFF2CC] text-[#7F6000]' :
                      'bg-[#FCE4D6] text-[#C65911]'
                    }`}>
                      {batch.grade}
                    </span>
                  </div>

                  {/* Batch details */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] font-semibold">
                    <div className="bg-cream-base border border-primary-ink/10 p-2 rounded">
                      <p className="text-[7px] font-retro text-primary-ink/50 uppercase">{t.productQtyWet}</p>
                      <p className="font-black text-text-dark">{batch.qtyWet} kg</p>
                    </div>
                    <div className="bg-cream-base border border-primary-ink/10 p-2 rounded">
                      <p className="text-[7px] font-retro text-primary-ink/50 uppercase">{t.productQtyDry}</p>
                      <p className="font-black text-text-dark">{batch.qtyDry} kg</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mb-3 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'Export Ready' ? 'bg-[#065f46] animate-pulse' : 'bg-accent-gold'}`}></span>
                    <span className="text-[8px] font-bold text-primary-ink/60 uppercase">{batch.status}</span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Purchase button */}
                  <button
                    onClick={() => handleBuyerPurchaseRequest(batch)}
                    disabled={isSent}
                    className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all border-2 border-primary-ink ${
                      isSent
                        ? 'bg-[#E2DDD3] text-primary-ink/50 cursor-not-allowed'
                        : 'bg-[#3b2313] text-[#fbf7ee] hover:bg-[#4d3221] cursor-pointer shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none'
                    }`}
                  >
                    {isSent ? t.buyBtnSent : t.buyBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Marketplace Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-primary-ink/20 p-3 rounded-lg bg-cream-base text-[9px] font-semibold text-primary-ink/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#065f46]"></span>
            {lang === 'en' ? `Grade A: ${gradeADist} batch(es)` : `Grade A: ${gradeADist} batch`}
          </div>
          <div className="border-2 border-primary-ink/20 p-3 rounded-lg bg-cream-base text-[9px] font-semibold text-primary-ink/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7F6000]"></span>
            {lang === 'en' ? `Grade B: ${displayBatches.filter(b => b.grade === 'Grade B').length} batch(es)` : `Grade B: ${displayBatches.filter(b => b.grade === 'Grade B').length} batch`}
          </div>
          <div className="border-2 border-primary-ink/20 p-3 rounded-lg bg-cream-base text-[9px] font-semibold text-primary-ink/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C65911]"></span>
            {lang === 'en' ? `Low Grade: ${displayBatches.filter(b => b.grade === 'Low Grade' || b.grade === 'Grade C').length} batch(es)` : `Low Grade: ${displayBatches.filter(b => b.grade === 'Low Grade' || b.grade === 'Grade C').length} batch`}
          </div>
        </div>
      </div>
    );
  }

  // ----- SELLER MODE: Match buyers with batch -----
  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        
        <div>
          <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">{t.selectBatch}</h3>
          <p className="text-xs text-primary-ink/70 mt-0.5">
            {selectedBatch ? `${selectedBatch.name} (${selectedBatch.id} - ${selectedBatch.grade})` : ''}
          </p>
        </div>

        {/* Custom Retro Dropdown */}
        <div className="relative w-full md:w-64">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex justify-between items-center px-4 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-bold text-sm text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-primary-ink"
          >
            <span>{selectedBatch ? `${selectedBatch.id} - ${selectedBatch.name}` : 'Choose batch'}</span>
            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 left-0 mt-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-20 overflow-hidden max-h-48 overflow-y-auto">
              {displayBatches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBatchId(b.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left text-xs font-bold transition-colors border-b border-primary-ink/10 last:border-0 block ${
                    selectedBatchId === b.id ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{b.id} - {b.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 border border-primary-ink/20 rounded bg-cream-base text-primary-ink/75 font-mono">
                      {b.grade}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="relative border-2 border-primary-ink p-12 rounded-xl bg-card-cream cartoon-shadow-lg text-center flex flex-col items-center justify-center h-64">
          <div className="font-retro text-[9px] tracking-[0.2em] text-accent-gold uppercase animate-pulse">
            {t.matchingLabel}
          </div>
        </div>
      ) : matchData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Buyers List (2 Cols on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-retro text-[10px] tracking-wider text-accent-gold uppercase flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary-ink mr-2"></span>
              {t.recommendedTitle}
            </h3>

            <div className="space-y-4">
              {matchData.recommended_buyers.map((match, index) => {
                const b = match.buyer;
                const isSent = !!sentRequests[b.id];
                return (
                  <div
                    key={b.id}
                    className={`relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow-lg hover:-translate-y-0.5 transition-all ${
                      index === 0 ? 'border-accent-gold ring-2 ring-accent-gold/20' : ''
                    }`}
                  >
                    {index === 0 && (
                      <span className="absolute -top-3 left-4 bg-accent-gold text-white font-retro text-[7px] tracking-wider uppercase px-2 py-0.5 rounded border border-primary-ink shadow-[1px_1px_0_0_#3b2313]">
                        BEST MATCH
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-primary-ink/10">
                      <div>
                        <h4 className="font-black text-base text-text-dark">{b.company_name}</h4>
                        <p className="text-[10px] font-bold text-primary-ink/60 uppercase tracking-wide">
                          {b.country} / {b.industry}
                        </p>
                      </div>
                      
                      {/* Compatibility Badge */}
                      <div className="text-right flex items-center gap-2">
                        <span className="text-[9px] font-retro text-accent-gold uppercase">{t.compatibility}</span>
                        <span className="px-2 py-1 rounded bg-[#EAE4D9] border border-primary-ink font-mono font-black text-sm text-text-dark">
                          {match.compatibility_score}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-primary-ink/80 mb-4 italic font-medium">
                      "{b.description}"
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs font-semibold">
                      <div className="border border-primary-ink/15 p-2 rounded bg-cream-base">
                        <p className="text-[8px] font-retro text-primary-ink/50 uppercase">{t.reqGrade}</p>
                        <p className="font-black text-text-dark mt-0.5">{b.required_grade}</p>
                      </div>
                      <div className="border border-primary-ink/15 p-2 rounded bg-cream-base">
                        <p className="text-[8px] font-retro text-primary-ink/50 uppercase">{t.demand}</p>
                        <p className="font-black text-text-dark mt-0.5">{b.min_quantity_kg} - {b.max_quantity_kg} kg</p>
                      </div>
                      <div className="border border-primary-ink/15 p-2 rounded bg-cream-base col-span-2 md:col-span-1">
                        <p className="text-[8px] font-retro text-primary-ink/50 uppercase">{t.prefOrigin}</p>
                        <p className="font-black text-text-dark mt-0.5">{b.preferred_origin}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestContact(b)}
                      disabled={isSent}
                      className={`w-full text-center py-2.5 rounded-lg text-xs font-bold transition-all border-2 border-primary-ink ${
                        isSent
                          ? 'bg-[#E2DDD3] text-primary-ink/50 cursor-not-allowed'
                          : 'bg-white text-primary-ink hover:bg-cream-base cursor-pointer shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none'
                      }`}
                    >
                      {isSent ? t.requestSent : t.requestContact}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Readiness & LLM Advisor Panel (1 Col on large screens) */}
          <div className="space-y-6">
            <h3 className="font-retro text-[10px] tracking-wider text-accent-gold uppercase flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent-gold mr-2"></span>
              {t.readinessScore}
            </h3>

            {/* Gauge Box */}
            <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg text-center flex flex-col items-center">
              {/* ... + corners ... */}
              <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    className="stroke-primary-ink/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    className="stroke-accent-gold transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="314.16"
                    strokeDashoffset={314.16 - (314.16 * matchData.export_readiness_score) / 100}
                  />
                </svg>
                <span className="absolute font-mono font-black text-2xl text-text-dark">{matchData.export_readiness_score}%</span>
              </div>
              <p className="text-[10px] font-bold text-primary-ink/65 leading-relaxed mt-4 max-w-[200px]">
                {t.readinessDescription}
              </p>
            </div>

            {/* LLM Advisor Box */}
            <h3 className="font-retro text-[10px] tracking-wider text-accent-gold uppercase flex items-center pt-2">
              <span className="w-2 h-2 rounded-full bg-primary-ink mr-2"></span>
              {t.advisorTitle}
            </h3>

            <div className="relative border-2 border-primary-ink p-5 rounded-xl bg-[#FFF8E7] border-accent-gold/45 cartoon-shadow-lg">
              <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
              
              <div className="flex items-center space-x-2.5 mb-3 pb-2 border-b border-accent-gold/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-gold"></span>
                </div>
                <div>
                  <h4 className="font-black text-xs text-accent-gold uppercase font-retro tracking-wide">LLM Export Advisor</h4>
                  <p className="text-[8px] text-primary-ink/50 font-bold uppercase">Real-Time Context Analysis</p>
                </div>
              </div>

              <div className="text-xs font-semibold text-text-dark leading-relaxed text-justify space-y-2">
                {matchData.recommended_buyers[0]?.explanation ? (
                  <p>{matchData.recommended_buyers[0].explanation}</p>
                ) : (
                  <p className="italic text-primary-ink/50">Could not generate explanation.</p>
                )}
              </div>
            </div>

            {/* Methodology Small Note */}
            <div className="p-3 rounded-lg bg-cream-base border border-primary-ink/10 text-[9px] leading-relaxed text-primary-ink/60 font-medium">
              {t.methodologyNote}
            </div>

          </div>
        </div>
      ) : (
        <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-card-cream cartoon-shadow-lg text-center flex flex-col items-center justify-center h-64">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <p className="text-sm font-bold text-primary-ink/60">{t.placeholderPrompt}</p>
        </div>
      )}
    </div>
  );
}
