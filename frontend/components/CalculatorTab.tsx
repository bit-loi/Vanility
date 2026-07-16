import React, { useState } from 'react';

export default function CalculatorTab() {
  const [calcQty, setCalcQty] = useState(10);
  const [calcGrade, setCalcGrade] = useState<'Grade A' | 'Grade B' | 'Low Grade'>('Grade A');

  const getCalcResults = () => {
    let rawPrice = 60;
    if (calcGrade === 'Grade A') rawPrice = 175;
    else if (calcGrade === 'Grade B') rawPrice = 130;

    const rawIncome = calcQty * rawPrice;
    const extractIncome = calcQty * 270;
    const gap = extractIncome - rawIncome;
    const pct = rawIncome > 0 ? Math.round((gap / rawIncome) * 100) : 0;

    return { rawIncome, extractIncome, gap, pct };
  };

  const calcRes = getCalcResults();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5]">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-4 border-b border-[#2C1E15]/10 pb-2">Calculator Input</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-bold mb-1">Dried Vanilla beans (kg)</label>
            <input
              type="number"
              min="1"
              value={calcQty || ''}
              onChange={e => setCalcQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Estimated Vanilla Grade</label>
            <select
              value={calcGrade}
              onChange={e => setCalcGrade(e.target.value as 'Grade A' | 'Grade B' | 'Low Grade')}
              className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
            >
              <option>Grade A</option>
              <option>Grade B</option>
              <option>Low Grade</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5] lg:col-span-2">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-6 border-b border-[#2C1E15]/10 pb-2">Value Addition Comparison</h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C1E15]/50">Option 1: Selling Cured Beans Raw</p>
                <p className="text-2xl font-black">${calcRes.rawIncome.toLocaleString()}</p>
              </div>
              <span className="text-xs text-[#2C1E15]/60">Estimated average market price</span>
            </div>
            <div className="w-full bg-[#EAE4D9] h-6 rounded border border-[#2C1E15] overflow-hidden relative">
              <div
                className="bg-[#C65911] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (calcRes.rawIncome / calcRes.extractIncome) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C1E15]/50">Option 2: Processing into Vanilla Extract</p>
                <p className="text-2xl font-black">${calcRes.extractIncome.toLocaleString()}</p>
              </div>
              <span className="text-xs text-[#2C1E15]/60">Standard processed value</span>
            </div>
            <div className="w-full bg-[#EAE4D9] h-6 rounded border border-[#2C1E15] overflow-hidden relative">
              <div
                className="bg-[#385723] h-full transition-all duration-500"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div className="p-5 rounded-lg border border-[#2C1E15] bg-[#F5EFE6] flex items-center justify-between mt-4">
            <div>
              <p className="text-sm font-bold uppercase text-[#2C1E15]">Potential Income Increase</p>
              <p className="text-xs text-[#2C1E15]/70">By processing standard dried vanilla beans into pure vanilla extracts or pastes.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#385723]">+${calcRes.gap.toLocaleString()}</p>
              <p className="text-xs font-bold text-[#385723]">{calcRes.pct}% Value Increase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
