import React from 'react';
import { Batch } from './types';

interface OverviewTabProps {
  batches: Batch[];
  totalWetQty: number;
  totalDryQty: number;
  avgGrade: string;
}

export default function OverviewTab({ batches, totalWetQty, totalDryQty, avgGrade }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <p className="font-retro text-[8px] tracking-[0.25em] text-accent-gold mb-2 uppercase">System Welcome Ticker</p>
        <h2 className="text-3xl font-light tracking-[-0.045em] text-text-dark mb-1">Good afternoon, Pak Yuven</h2>
        <p className="text-sm text-primary-ink/75 max-w-2xl leading-relaxed">Here is your AI powered vanilla production dashboard. Standardize harvesting and curing processes to double your value-add.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Batches Tracked', value: batches.length },
          { label: 'Total Qty (Wet)', value: `${totalWetQty.toFixed(1)} kg` },
          { label: 'Potential Dry Yield', value: `${totalDryQty.toFixed(1)} kg` },
          { label: 'Average Grade', value: avgGrade }
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
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">Active Vanilla Batches</h3>
            <span className="font-retro text-[7px] text-primary-ink/50 uppercase">Live Database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-primary-ink">
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">ID</th>
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Batch Name</th>
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Region</th>
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Qty (Wet/Dry)</th>
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Grade</th>
                  <th className="pb-3 font-retro text-[8px] tracking-wider text-accent-gold uppercase">Status</th>
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
            <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">AI Agronomist logs</h3>
            <span className="w-2 h-2 rounded-full bg-[#065f46] animate-pulse"></span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">Batch B003 Alert</p>
              <p className="text-primary-ink/90 font-medium">The sweating duration recorded for Batch B003 was shorter than standard. Maintain sun drying strictly between 5 and 14 days under standard conditions to control microbial growth risk.</p>
            </div>
            <div className="p-4 rounded-lg bg-card-cream border-2 border-primary-ink text-xs leading-relaxed shadow-[2px_2px_0_0_#3b2313]">
              <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-1">Market Insight</p>
              <p className="text-primary-ink/90 font-medium">Global demand for premium Grade A vanilla beans has increased. Processing raw beans into high quality cured pods currently increases market value by up to 54 percent per kilogram.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
