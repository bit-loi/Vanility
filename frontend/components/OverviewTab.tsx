'use client';

import React, { useState, useEffect } from 'react';
import { Batch } from './types';

interface OverviewTabProps {
  batches: Batch[];
  totalWetQty: number;
  totalDryQty: number;
  avgGrade: string;
  userName: string;
  lang: 'en' | 'id';
  activeBuyerCount: number;
  isBuyerMode?: boolean;
}

const overviewTranslations = {
  en: {
    welcome: 'Good afternoon',
    tickerSub: 'Here is your decision support dashboard for vanilla production. Standardize harvesting and curing processes to double your value-add.',
    batchesTracked: 'Batches Tracked',
    totalWet: 'Total Qty (Wet)',
    dryYield: 'Potential Dry Yield',
    avgGrade: 'Average Grade',
    activeBatches: 'Active Vanilla Batches',
    liveDb: 'Live Database',
    tblId: 'ID',
    tblName: 'Batch Name',
    tblRegion: 'Region',
    tblQty: 'Qty (Wet/Dry)',
    tblGrade: 'Grade',
    tblStatus: 'Status',
    logsTitle: 'Agronomist Insights',
    alertTitle: 'Batch B003 Alert',
    alertText: 'The sweating duration recorded for Batch B003 was shorter than standard. Maintain sun drying strictly between 15 and 35 days under standard conditions to control microbial growth risk.',
    marketTitle: 'Market Insight',
    marketText: 'Global demand for premium Grade A vanilla beans has increased. Processing raw beans into high quality cured pods currently increases market value by up to 54 percent per kilogram.'
  },
  id: {
    welcome: 'Selamat sore',
    tickerSub: 'Ini adalah dasbor pendukung keputusan produksi vanili Anda. Standardisasi proses panen dan curing untuk melipatgandakan nilai tambah Anda.',
    batchesTracked: 'Batch Dipantau',
    totalWet: 'Total Kuantitas (Basah)',
    dryYield: 'Potensi Hasil Kering',
    avgGrade: 'Rata-rata Mutu',
    activeBatches: 'Batch Vanili Aktif',
    liveDb: 'Database Langsung',
    tblId: 'ID',
    tblName: 'Nama Batch',
    tblRegion: 'Wilayah',
    tblQty: 'Kuantitas (Basah/Kering)',
    tblGrade: 'Mutu',
    tblStatus: 'Status',
    logsTitle: 'Wawasan Agronomis',
    alertTitle: 'Peringatan Batch B003',
    alertText: 'Durasi sweating yang tercatat untuk Batch B003 lebih singkat dari standar. Jaga durasi pengeringan matahari ketat antara 15 hingga 35 hari di bawah kondisi standar untuk mengendalikan risiko pertumbuhan mikroba.',
    marketTitle: 'Wawasan Pasar',
    marketText: 'Permintaan global untuk biji vanili Grade A premium telah meningkat. Mengolah biji mentah menjadi polong kering berkualitas tinggi saat ini meningkatkan nilai pasar hingga 54 persen per kilogram.'
  }
};

export default function OverviewTab({ batches, totalWetQty, totalDryQty, avgGrade, userName, lang, activeBuyerCount, isBuyerMode }: OverviewTabProps) {
  const t = overviewTranslations[lang];

  const [marketInsight, setMarketInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function fetchInsight() {
      setLoadingInsight(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/market-insight?lang=${lang}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (active) {
          setMarketInsight(data.insight);
          setLoadingInsight(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setMarketInsight(t.marketText);
          setLoadingInsight(false);
        }
      }
    }
    fetchInsight();
    return () => {
      active = false;
    };
  }, [lang, t.marketText]);

  useEffect(() => {
    if (!isBuyerMode) return;
    
    let active = true;
    async function fetchTransactions() {
      setLoadingTx(true);
      try {
        const { createClient } = await import('../utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch('http://127.0.0.1:8000/api/contact-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        if (active) {
          setTransactions(data);
          setLoadingTx(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setLoadingTx(false);
        }
      }
    }
    fetchTransactions();
    return () => {
      active = false;
    };
  }, [isBuyerMode]);

  const displayBatches = isBuyerMode ? batches.filter(b => b.status === 'Export Ready') : batches;

  // Calculate Buyer-specific average grade
  let avgGradeDisplay = avgGrade;
  if (isBuyerMode) {
    if (transactions.length > 0) {
      const grades = transactions.map(tx => tx.batches?.grade).filter(Boolean);
      const freqs = grades.reduce((acc: Record<string, number>, g) => {
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {});
      const maxGrade = Object.keys(freqs).reduce((a, b) => freqs[a] > freqs[b] ? a : b, 'Grade A');
      avgGradeDisplay = maxGrade;
    } else {
      avgGradeDisplay = '-';
    }
  }

  // Calculate distribution metrics
  const totalCount = isBuyerMode ? transactions.length : displayBatches.length;
  const gradeACount = isBuyerMode 
    ? transactions.filter(t => t.batches?.grade === 'Grade A').length
    : displayBatches.filter(b => b.grade === 'Grade A').length;
  const gradeBCount = isBuyerMode 
    ? transactions.filter(t => t.batches?.grade === 'Grade B').length
    : displayBatches.filter(b => b.grade === 'Grade B').length;
  const lowGradeCount = isBuyerMode
    ? transactions.filter(t => t.batches?.grade === 'Low Grade' || t.batches?.grade === 'Grade C' || (!t.batches?.grade?.includes('A') && !t.batches?.grade?.includes('B'))).length
    : displayBatches.filter(b => b.grade === 'Low Grade' || b.grade === 'Grade C' || (!b.grade.includes('A') && !b.grade.includes('B'))).length;

  const pctA = totalCount > 0 ? (gradeACount / totalCount) * 100 : 0;
  const pctB = totalCount > 0 ? (gradeBCount / totalCount) * 100 : 0;
  const pctLow = totalCount > 0 ? (lowGradeCount / totalCount) * 100 : 0;

  const kpis = [
    { 
      label: isBuyerMode ? (lang === 'en' ? 'Initiated Deals' : 'Transaksi Dimulai') : t.batchesTracked, 
      value: isBuyerMode ? transactions.length : displayBatches.length 
    },
    { 
      label: isBuyerMode ? (lang === 'en' ? 'Total Qty Bought (Wet)' : 'Total Beli (Basah)') : t.totalWet, 
      value: isBuyerMode 
        ? `${transactions.reduce((sum, tx) => sum + (tx.batches?.quantity_kg / 0.25 || 0), 0).toFixed(1)} kg`
        : `${(displayBatches.reduce((sum, b) => sum + b.qtyWet, 0)).toFixed(1)} kg` 
    },
    { 
      label: isBuyerMode ? (lang === 'en' ? 'Total Qty Bought (Dry)' : 'Total Beli (Kering)') : t.dryYield, 
      value: isBuyerMode 
        ? `${transactions.reduce((sum, tx) => sum + (tx.batches?.quantity_kg || 0), 0).toFixed(1)} kg`
        : `${(displayBatches.reduce((sum, b) => sum + b.qtyDry, 0)).toFixed(1)} kg` 
    },
    { 
      label: t.avgGrade, 
      value: avgGradeDisplay 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <p className="font-retro text-[8px] tracking-[0.25em] text-accent-gold mb-2 uppercase">
          {isBuyerMode 
            ? (lang === 'en' ? 'Global Buyer Dashboard' : 'Dasbor Pembeli Global') 
            : (lang === 'en' ? 'Farmer Decision Support' : 'Dukungan Keputusan Petani')}
        </p>
        <h2 className="text-3xl font-light tracking-[-0.045em] text-text-dark mb-1">
          {t.welcome}, {userName}{isBuyerMode ? ' (Buyer)' : ''}
        </h2>
        <p className="text-sm text-primary-ink/75 max-w-2xl leading-relaxed">
          {isBuyerMode 
            ? (lang === 'en' ? 'Welcome to the Buyer Portal. Browse your purchase history and established premium spice export lines.' : 'Selamat datang di Portal Pembeli. Telusuri riwayat transaksi pembelian dan jalin jalur ekspor rempah premium.') 
            : t.tickerSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow flex flex-col justify-between">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="font-retro text-[8px] tracking-wider text-accent-gold uppercase leading-none">{kpi.label}</span>
            <span className="text-3xl font-black mt-3 tracking-tight text-text-dark">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg lg:col-span-2">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          
          <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">
              {isBuyerMode 
                ? (lang === 'en' ? 'Purchase Deal History' : 'Riwayat Transaksi Pembelian') 
                : t.activeBatches}
            </h3>
            <span className="font-retro text-[7px] text-primary-ink/50 uppercase">
              {isBuyerMode ? (lang === 'en' ? 'Deal Logs' : 'Log Transaksi') : t.liveDb}
            </span>
          </div>

          <div className="overflow-x-auto">
            {isBuyerMode ? (
              loadingTx ? (
                <div className="py-12 text-center text-xs font-bold text-accent-gold uppercase animate-pulse">
                  {lang === 'en' ? 'Loading transactions...' : 'Memuat transaksi...'}
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-primary-ink/50 italic">
                  {lang === 'en' 
                    ? 'No purchase deals initiated yet. Go to "Find Vanilla Batches" to connect with sellers.' 
                    : 'Belum ada transaksi pembelian. Silakan masuk ke "Cari Batch Vanili" untuk menghubungkan dengan penjual.'}
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-primary-ink">
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{lang === 'en' ? 'Deal ID' : 'ID Transaksi'}</th>
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{lang === 'en' ? 'Seller/Farmer' : 'Penjual/Petani'}</th>
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{lang === 'en' ? 'Region' : 'Wilayah'}</th>
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{lang === 'en' ? 'Dry Qty' : 'Jumlah Kering'}</th>
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{lang === 'en' ? 'Grade' : 'Mutu'}</th>
                      <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => {
                      const dealId = `D${String(transactions.length - idx).padStart(3, '0')}`;
                      const sellerName = tx.batches?.profiles?.full_name || tx.batches?.profiles?.company_name || 'Petani';
                      const region = tx.batches?.origin || 'Unknown';
                      const qtyDry = `${tx.batches?.quantity_kg || 0} kg`;
                      const grade = tx.batches?.grade || 'Grade A';
                      const statusDisplay = tx.status === 'requested' ? (lang === 'en' ? 'Connecting' : 'Menghubungkan') : tx.status;
                      return (
                        <tr key={idx} className="border-b border-primary-ink/10 hover:bg-cream-base/50 transition-colors">
                          <td className="py-3 font-bold text-text-dark">{dealId}</td>
                          <td className="py-3 font-medium text-text-dark">{sellerName}</td>
                          <td className="py-3 text-xs text-primary-ink/80">{region}</td>
                          <td className="py-3 font-semibold">{qtyDry}</td>
                          <td className="py-3">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border-2 border-primary-ink ${
                              grade === 'Grade A'
                                ? 'bg-[#ecfdf5] text-[#065f46]'
                                : grade === 'Grade B'
                                ? 'bg-[#FFF2CC] text-[#7F6000]'
                                : 'bg-[#FCE4D6] text-[#C65911]'
                            }`}>
                              {grade}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center text-xs font-bold">
                              <span className="w-2.5 h-2.5 rounded-full bg-accent-gold border border-primary-ink mr-2"></span>
                              {statusDisplay}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary-ink">
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblId}</th>
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblName}</th>
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblRegion}</th>
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblQty}</th>
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblGrade}</th>
                    <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">{t.tblStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBatches.map((batch, idx) => (
                    <tr key={idx} className="border-b border-primary-ink/10 hover:bg-cream-base/50 transition-colors">
                      <td className="py-3 font-bold text-text-dark">{batch.id}</td>
                      <td className="py-3 font-medium text-text-dark">{batch.name}</td>
                      <td className="py-3 text-xs text-primary-ink/80">{batch.region}</td>
                      <td className="py-3 font-semibold">{batch.qtyWet} kg / {batch.qtyDry} kg</td>
                      <td className="py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border-2 border-primary-ink ${
                          batch.grade === 'Grade A'
                            ? 'bg-[#ecfdf5] text-[#065f46]'
                            : batch.grade === 'Grade B'
                            ? 'bg-[#FFF2CC] text-[#7F6000]'
                            : 'bg-[#FCE4D6] text-[#C65911]'
                        }`}>
                          {batch.grade}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center text-xs font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-ink border border-primary-ink mr-2"></span>
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          
          <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">
              {isBuyerMode ? (lang === 'en' ? 'Purchase Distribution' : 'Distribusi Pembelian') : t.logsTitle}
            </h3>
            <span className="w-2 h-2 rounded-full bg-[#065f46] animate-pulse"></span>
          </div>

          <div className="mb-6 pb-6 border-b border-primary-ink/20">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-retro text-[8px] tracking-wider text-accent-gold uppercase">
                {isBuyerMode ? (lang === 'en' ? 'Quality Distribution' : 'Proporsi Mutu Vanili') : (lang === 'en' ? 'Weekly Grade Distribution' : 'Tren Distribusi Mutu')}
              </h4>
              <span className="font-retro text-[7px] text-primary-ink/50 uppercase">
                {totalCount} {isBuyerMode ? (lang === 'en' ? 'Deals Total' : 'Total Transaksi') : (lang === 'en' ? 'Batches Total' : 'Total Batch')}
              </span>
            </div>
            {totalCount > 0 ? (
              <div className="space-y-3">
                <div className="w-full h-4 border-2 border-primary-ink rounded-lg overflow-hidden flex bg-[#eae4d9] shadow-[1px_1px_0_0_#3b2313]">
                  {gradeACount > 0 && (
                    <div 
                      style={{ width: `${pctA}%` }} 
                      className="bg-[#065f46] h-full border-r-2 border-primary-ink last:border-r-0"
                      title={`Grade A: ${gradeACount}`} 
                    />
                  )}
                  {gradeBCount > 0 && (
                    <div 
                      style={{ width: `${pctB}%` }} 
                      className="bg-[#FFF2CC] h-full border-r-2 border-primary-ink last:border-r-0"
                      title={`Grade B: ${gradeBCount}`} 
                    />
                  )}
                  {lowGradeCount > 0 && (
                    <div 
                      style={{ width: `${pctLow}%` }} 
                      className="bg-[#FCE4D6] h-full border-r-2 border-primary-ink last:border-r-0"
                      title={`Low Grade: ${lowGradeCount}`} 
                    />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-center">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded border border-primary-ink bg-[#065f46] mb-1" />
                    <span className="text-text-dark whitespace-nowrap">Grade A: {gradeACount} ({Math.round(pctA)}%)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded border border-primary-ink bg-[#FFF2CC] mb-1" />
                    <span className="text-text-dark whitespace-nowrap">Grade B: {gradeBCount} ({Math.round(pctB)}%)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded border border-primary-ink bg-[#FCE4D6] mb-1" />
                    <span className="text-text-dark whitespace-nowrap">Low: {lowGradeCount} ({Math.round(pctLow)}%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-primary-ink/50 text-center py-2 italic">{lang === 'en' ? 'No deal data available yet' : 'Belum ada data transaksi'}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313] transition-all hover:scale-[1.01]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-2">
                {lang === 'en' ? 'Live Presence Pool' : 'Kolam Kehadiran Langsung'}
              </p>
              <div className="flex items-center space-x-3">
                <span className="relative flex h-2.5 w-2.5 my-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-gold"></span>
                </span>
                <div>
                  <p className="text-xs font-bold text-text-dark">
                    <span className="text-lg text-accent-gold mr-1 inline-block transition-all duration-300 font-retro">
                      {activeBuyerCount}
                    </span> 
                    {lang === 'en' ? 'Active Buyers Online' : 'Buyer Aktif Sekarang'}
                  </p>
                  <p className="text-[9px] text-primary-ink/60 font-mono leading-none mt-1">
                    {lang === 'en' ? '● Real-time sync enabled' : '● Sinkronisasi real-time aktif'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">
                {isBuyerMode ? (lang === 'en' ? 'Buyer Procurement Guideline' : 'Panduan Pengadaan Buyer') : t.alertTitle}
              </p>
              <p className="text-primary-ink/90 font-medium">
                {isBuyerMode 
                  ? (lang === 'en' ? 'Before confirming transactions, verify that the moisture content is strictly below 30% for export compliance. Check the curing checklists provided by farmers.' : 'Sebelum mengonfirmasi transaksi, pastikan kadar air vanili berada di bawah 30% untuk kepatuhan ekspor. Periksa checklist proses curing yang disediakan petani.')
                  : t.alertText}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">{t.marketTitle}</p>
              <p className="text-primary-ink/90 font-medium">
                {loadingInsight ? (
                  <span className="animate-pulse text-accent-gold font-retro text-[7px] tracking-wider block">
                    {lang === 'en' ? 'Fetching Live Insights...' : 'Mengambil Data Pasar...'}
                  </span>
                ) : (
                  marketInsight
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
