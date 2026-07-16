import React, { useState, useEffect } from 'react';
import { calculateValueAdd } from '../lib/api';

export default function CalculatorTab() {
  const [calcQty, setCalcQty] = useState(10);
  const [calcGrade, setCalcGrade] = useState<'Grade A' | 'Grade B' | 'Low Grade'>('Grade A');
  const [isGradeOpen, setIsGradeOpen] = useState(false);

  const [rawIncome, setRawIncome] = useState(1750);
  const [extractIncome, setExtractIncome] = useState(2700);
  const [gap, setGap] = useState(950);
  const [pct, setPct] = useState(54);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const data = await calculateValueAdd({
          quantity_kg_dry: calcQty || 0,
          predicted_grade: calcGrade
        });
        if (active) {
          setRawIncome(data.raw_bean_income_usd);
          setExtractIncome(data.extract_income_usd);
          setGap(data.value_add_gap_usd);
          setPct(data.value_add_gap_percentage);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [calcQty, calcGrade]);

  const calcRes = { rawIncome, extractIncome, gap, pct };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        
        <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
          <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">Calculator Input</h3>
          <span className="font-retro text-[7px] text-primary-ink/50 uppercase">Settings</span>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-bold mb-1 text-text-dark">Dried Vanilla beans (kg)</label>
            <input
              type="number"
              min="1"
              value={calcQty || ''}
              onChange={e => setCalcQty(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
            />
          </div>

          <div className="relative">
            <label className="block font-bold mb-1 text-text-dark">Estimated Vanilla Grade</label>
            <button
              type="button"
              onClick={() => setIsGradeOpen(!isGradeOpen)}
              className="w-full flex justify-between items-center px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-bold text-sm text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span>{calcGrade}</span>
              <svg className={`w-4 h-4 transition-transform ${isGradeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isGradeOpen && (
              <div className="absolute left-0 right-0 mt-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-10 overflow-hidden">
                {['Grade A', 'Grade B', 'Low Grade'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setCalcGrade(g as 'Grade A' | 'Grade B' | 'Low Grade');
                      setIsGradeOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-bold transition-colors border-b border-primary-ink/10 last:border-0 ${
                      calcGrade === g ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg lg:col-span-2">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        
        <div className="flex justify-between items-center mb-6 border-b-2 border-primary-ink/15 pb-2">
          <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">Value Addition Comparison</h3>
          <span className="font-retro text-[7px] text-primary-ink/50 uppercase">Analysis</span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-primary-ink/65">Option 1: Selling Cured Beans Raw</p>
                <p className="text-2xl font-black text-text-dark">${calcRes.rawIncome.toLocaleString()}</p>
              </div>
              <span className="text-xs text-primary-ink/60 font-medium">Estimated average market price</span>
            </div>
            <div className="w-full bg-[#EAE4D9] h-6 rounded-md border-2 border-primary-ink overflow-hidden relative">
              <div
                className="bg-[#C65911] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (calcRes.rawIncome / calcRes.extractIncome) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-primary-ink/65">Option 2: Processing into Vanilla Extract</p>
                <p className="text-2xl font-black text-text-dark">${calcRes.extractIncome.toLocaleString()}</p>
              </div>
              <span className="text-xs text-primary-ink/60 font-medium">Standard processed value</span>
            </div>
            <div className="w-full bg-[#EAE4D9] h-6 rounded-md border-2 border-primary-ink overflow-hidden relative">
              <div
                className="bg-[#065f46] h-full transition-all duration-500"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div className="p-5 rounded-lg border-2 border-primary-ink bg-cream-base flex items-center justify-between mt-4">
            <div>
              <p className="text-sm font-bold uppercase text-text-dark">Potential Income Increase</p>
              <p className="text-xs text-primary-ink/80 leading-relaxed max-w-sm mt-0.5">By processing standard dried vanilla beans into pure vanilla extracts or pastes.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#065f46]">+${calcRes.gap.toLocaleString()}</p>
              <p className="text-xs font-bold text-[#065f46]">{calcRes.pct}% Value Increase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
