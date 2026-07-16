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
      <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5]">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Good afternoon, Pak Yuven</h2>
        <p className="text-sm text-[#2C1E15]/70">Here is your AI powered vanilla production dashboard. Standardize harvesting and curing processes to double your value-add.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Batches Tracked', value: batches.length },
          { label: 'Total Qty (Wet)', value: `${totalWetQty.toFixed(1)} kg` },
          { label: 'Potential Dry Yield', value: `${totalDryQty.toFixed(1)} kg` },
          { label: 'Average Grade', value: avgGrade }
        ].map((kpi, idx) => (
          <div key={idx} className="relative border border-[#2C1E15] p-5 rounded-xl bg-[#FAF8F5] flex flex-col justify-between">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2C1E15]/55">{kpi.label}</span>
            <span className="text-3xl font-black mt-2 tracking-tight">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5] lg:col-span-2">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-4 border-b border-[#2C1E15]/10 pb-2">Active Vanilla Batches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#2C1E15]/20">
                  <th className="pb-3 font-bold uppercase text-xs">ID</th>
                  <th className="pb-3 font-bold uppercase text-xs">Batch Name</th>
                  <th className="pb-3 font-bold uppercase text-xs">Region</th>
                  <th className="pb-3 font-bold uppercase text-xs">Qty (Wet/Dry)</th>
                  <th className="pb-3 font-bold uppercase text-xs">Grade</th>
                  <th className="pb-3 font-bold uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, idx) => (
                  <tr key={idx} className="border-b border-[#2C1E15]/5 hover:bg-[#FAF8F5]/50">
                    <td className="py-3 font-bold">{batch.id}</td>
                    <td className="py-3">{batch.name}</td>
                    <td className="py-3 text-xs text-[#2C1E15]/80">{batch.region}</td>
                    <td className="py-3">{batch.qtyWet} kg / {batch.qtyDry} kg</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                        batch.grade === 'Grade A'
                          ? 'bg-[#E2F0D9] text-[#385723] border-[#385723]/30'
                          : batch.grade === 'Grade B'
                          ? 'bg-[#FFF2CC] text-[#7F6000] border-[#7F6000]/30'
                          : 'bg-[#FCE4D6] text-[#C65911] border-[#C65911]/30'
                      }`}>
                        {batch.grade}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2C1E15] mr-2"></span>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5]">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-4 border-b border-[#2C1E15]/10 pb-2">AI Agronomist Insights</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#2C1E15] text-xs leading-relaxed">
              <p className="font-bold mb-1">Batch B003 Alert</p>
              <p>The sweating duration recorded for Batch B003 was shorter than standard. Maintain sun drying strictly between 5 and 14 days under standard conditions to control microbial growth risk.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#2C1E15] text-xs leading-relaxed">
              <p className="font-bold mb-1">Market Insight</p>
              <p>Global demand for premium Grade A vanilla beans has increased. Processing raw beans into high quality cured pods currently increases market value by up to 54 percent per kilogram.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
