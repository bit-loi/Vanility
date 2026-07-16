'use client';

import React from 'react';
import { Batch } from './types';

interface OverviewTabProps {
  batches: Batch[];
  totalWetQty: number;
  totalDryQty: number;
  avgGrade: string;
  userName: string;
  lang: 'en' | 'id';
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
    alertText: 'The sweating duration recorded for Batch B003 was shorter than standard. Maintain sun drying strictly between 5 and 14 days under standard conditions to control microbial growth risk.',
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
    alertText: 'Durasi sweating yang tercatat untuk Batch B003 lebih singkat dari standar. Jaga durasi pengeringan matahari ketat antara 5 hingga 14 hari di bawah kondisi standar untuk mengendalikan risiko pertumbuhan mikroba.',
    marketTitle: 'Wawasan Pasar',
    marketText: 'Permintaan global untuk biji vanili Grade A premium telah meningkat. Mengolah biji mentah menjadi polong kering berkualitas tinggi saat ini meningkatkan nilai pasar hingga 54 persen per kilogram.'
  }
};

export default function OverviewTab({ batches, totalWetQty, totalDryQty, avgGrade, userName, lang }: OverviewTabProps) {
  const t = overviewTranslations[lang];

  return (
    <div className="space-y-6">
      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <p className="font-retro text-[8px] tracking-[0.25em] text-accent-gold mb-2 uppercase">Farmer Decision Support</p>
        <h2 className="text-3xl font-light tracking-[-0.045em] text-text-dark mb-1">
          {t.welcome}, {userName}
        </h2>
        <p className="text-sm text-primary-ink/75 max-w-2xl leading-relaxed">
          {t.tickerSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t.batchesTracked, value: batches.length },
          { label: t.totalWet, value: `${totalWetQty.toFixed(1)} kg` },
          { label: t.dryYield, value: `${totalDryQty.toFixed(1)} kg` },
          { label: t.avgGrade, value: avgGrade }
        ].map((kpi, idx) => (
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
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">{t.activeBatches}</h3>
            <span className="font-retro text-[7px] text-primary-ink/50 uppercase">{t.liveDb}</span>
          </div>

          <div className="overflow-x-auto">
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
                {batches.map((batch, idx) => (
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
          </div>
        </div>

        <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          
          <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">{t.logsTitle}</h3>
            <span className="w-2 h-2 rounded-full bg-[#065f46] animate-pulse"></span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">{t.alertTitle}</p>
              <p className="text-primary-ink/90 font-medium">{t.alertText}</p>
            </div>
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">{t.marketTitle}</p>
              <p className="text-primary-ink/90 font-medium">{t.marketText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
