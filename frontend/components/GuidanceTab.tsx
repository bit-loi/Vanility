import React, { useState } from 'react';

export default function GuidanceTab() {
  const [guideChecks, setGuideChecks] = useState<Record<string, boolean>>({
    b1: false, b2: false,
    s1: false, s2: false, s3: false,
    d1: false, d2: false, d3: false,
    c1: false, c2: false
  });

  const handleCheckChange = (key: string) => {
    setGuideChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getGuideProgress = () => {
    const total = Object.keys(guideChecks).length;
    const checked = Object.values(guideChecks).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="relative border border-[#2C1E15] p-5 rounded-xl bg-[#FAF8F5] flex items-center justify-between">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60">Curing Process Checklist</h3>
          <p className="text-xs text-[#2C1E15]/70 mt-1">Follow standard stages to secure premium quality vanilla beans compatible with export standards.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2C1E15]/50">Completion Progress</p>
          <p className="text-2xl font-black text-[#2C1E15]">{getGuideProgress()}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: '1. Blanching (Pencelupan Air Panas)',
            items: [
              { id: 'b1', label: 'Heat water strictly between 63 and 65 degrees Celsius.' },
              { id: 'b2', label: 'Immerse raw green vanilla pods for 2 to 3 minutes.' }
            ]
          },
          {
            title: '2. Sweating (Pemeraman)',
            items: [
              { id: 's1', label: 'Wrap hot beans in clean woolen fabrics.' },
              { id: 's2', label: 'Store in airtight sweating boxes to retain moisture.' },
              { id: 's3', label: 'Maintain sweating process for 10 to 15 days (traditional) or 4 to 8 days (controlled).' }
            ]
          },
          {
            title: '3. Sun Drying (Penjemuran)',
            items: [
              { id: 'd1', label: 'Spread vanilla pods under moderate sun for 2 to 3 hours daily.' },
              { id: 'd2', label: 'Cover with canvas during peak afternoon heat.' },
              { id: 'd3', label: 'Continue drying for 5 to 14 days until beans feel flexible and turn dark brown.' }
            ]
          },
          {
            title: '4. Conditioning (Aging / Penyimpanan)',
            items: [
              { id: 'c1', label: 'Store standard beans inside closed conditioning boxes lined with wax paper.' },
              { id: 'c2', label: 'Maintain storage for at least 60 to 90 days to allow aroma compounds to mature.' }
            ]
          }
        ].map((sec, idx) => (
          <div key={idx} className="relative border border-[#2C1E15] p-5 rounded-xl bg-[#FAF8F5]">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <h4 className="font-bold text-sm mb-3 border-b border-[#2C1E15]/10 pb-1.5 uppercase tracking-wide">{sec.title}</h4>
            <div className="space-y-3">
              {sec.items.map(item => (
                <label key={item.id} className="flex items-start space-x-3 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={guideChecks[item.id]}
                    onChange={() => handleCheckChange(item.id)}
                    className="mt-0.5 border-[#2C1E15] text-[#2C1E15] rounded focus:ring-0 w-4 h-4"
                  />
                  <span className={guideChecks[item.id] ? 'line-through text-[#2C1E15]/40' : ''}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
