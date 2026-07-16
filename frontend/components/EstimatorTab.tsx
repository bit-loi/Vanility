import React, { useState } from 'react';

interface EstimatorTabProps {
  onSaveBatch: (name: string, region: string, wetQty: number, dryQty: number, grade: string) => void;
}

export default function EstimatorTab({ onSaveBatch }: EstimatorTabProps) {
  const [estName, setEstName] = useState('');
  const [estRegion, setEstRegion] = useState('Manggarai Barat, NTT');
  const [estPollinationDate, setEstPollinationDate] = useState('');
  const [estCuringMethod, setEstCuringMethod] = useState<'tradisional' | 'terkontrol'>('tradisional');
  const [estSweatingDays, setEstSweatingDays] = useState(0);
  const [estDryingDays, setEstDryingDays] = useState(0);
  const [estConditioningDays, setEstConditioningDays] = useState(0);
  const [estWetQty, setEstWetQty] = useState(0);

  const [estResult, setEstResult] = useState<{
    daysSincePollination: number;
    harvestStatus: string;
    predictedGrade: string;
    confidence: number;
    dryQtyEstimate: number;
    priceMin: number;
    priceMax: number;
    recommendations: string[];
  } | null>(null);

  const handleEstimateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estPollinationDate) return;

    const pollDate = new Date(estPollinationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - pollDate.getTime());
    const daysSincePollination = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let harvestScore = 2;
    let harvestStatus = 'Ideal Maturity';

    if (daysSincePollination < 120) {
      harvestStatus = 'Too Early';
      harvestScore = 0;
    } else if (daysSincePollination < 210) {
      harvestStatus = 'Approaching Maturity';
      harvestScore = 1;
    } else if (daysSincePollination <= 270) {
      harvestStatus = 'Ideal Maturity';
      harvestScore = 2;
    } else {
      harvestStatus = 'Overmature';
      harvestScore = 1;
    }

    let sweatingScore = 0;
    if (estSweatingDays === 0) {
      sweatingScore = 0;
    } else if (estCuringMethod === 'terkontrol' && estSweatingDays >= 4 && estSweatingDays <= 8) {
      sweatingScore = 2;
    } else if (estCuringMethod === 'tradisional' && estSweatingDays >= 10 && estSweatingDays <= 15) {
      sweatingScore = 2;
    } else if (estSweatingDays > 0) {
      sweatingScore = 1;
    }

    let dryingScore = 0;
    if (estDryingDays === 0) {
      dryingScore = 0;
    } else if (estDryingDays >= 5 && estDryingDays <= 14) {
      dryingScore = 2;
    } else if (estDryingDays >= 15 && estDryingDays <= 25) {
      dryingScore = 1;
    } else {
      dryingScore = 0;
    }

    let conditioningScore = 0;
    if (estConditioningDays >= 60) {
      conditioningScore = 2;
    } else if (estConditioningDays >= 30) {
      conditioningScore = 1;
    } else {
      conditioningScore = 0;
    }

    const totalScore = harvestScore + sweatingScore + dryingScore + conditioningScore;
    let predictedGrade = 'Low Grade';
    let confidence = 0.5;

    if (totalScore >= 6) {
      predictedGrade = 'Grade A';
      confidence = 0.85 + (totalScore - 6) * 0.05;
    } else if (totalScore >= 3) {
      predictedGrade = 'Grade B';
      confidence = 0.60 + (totalScore - 3) * 0.05;
    } else {
      predictedGrade = 'Low Grade';
      confidence = 0.50 + totalScore * 0.03;
    }

    if (harvestScore === 0) {
      predictedGrade = 'Low Grade';
      confidence = Math.min(confidence, 0.55);
    }

    let priceMin = 40;
    let priceMax = 80;
    if (predictedGrade === 'Grade A') {
      priceMin = 180;
      priceMax = 220;
    } else if (predictedGrade === 'Grade B') {
      priceMin = 110;
      priceMax = 150;
    }

    const dryQtyEstimate = Number((estWetQty * 0.25).toFixed(1));

    const recommendations: string[] = [];
    if (harvestScore < 2) {
      recommendations.push('Wait for flower pollination age of 7 to 9 months for optimal vanillin content.');
    }
    if (sweatingScore < 2) {
      recommendations.push('Maintain sweating for 10 to 15 days (traditional) or 4 to 8 days (controlled).');
    }
    if (dryingScore < 2) {
      recommendations.push('Keep drying duration within 5 to 14 days under alternating sun and shade.');
    }
    if (conditioningScore < 2) {
      recommendations.push('Condition in sealed container boxes for at least 60 days before selling.');
    }

    setEstResult({
      daysSincePollination,
      harvestStatus,
      predictedGrade,
      confidence: Math.round(confidence * 100),
      dryQtyEstimate,
      priceMin,
      priceMax,
      recommendations
    });
  };

  const handleSave = () => {
    if (!estResult) return;
    onSaveBatch(
      estName || `Batch ${estRegion.split(',')[0]}`,
      estRegion,
      estWetQty,
      estResult.dryQtyEstimate,
      estResult.predictedGrade
    );
    setEstResult(null);
    setEstName('');
    setEstPollinationDate('');
    setEstSweatingDays(0);
    setEstDryingDays(0);
    setEstConditioningDays(0);
    setEstWetQty(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5]">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-4 border-b border-[#2C1E15]/10 pb-2">Input Production Data</h3>
        
        <form onSubmit={handleEstimateSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-bold mb-1">Batch Identifier</label>
            <input
              type="text"
              value={estName}
              onChange={e => setEstName(e.target.value)}
              placeholder="e.g. Batch Manggarai Utama"
              required
              className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Region</label>
              <select
                value={estRegion}
                onChange={e => setEstRegion(e.target.value)}
                className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
              >
                <option>Manggarai Barat, NTT</option>
                <option>Ende, NTT</option>
                <option>Flores Timur, NTT</option>
                <option>Minahasa, Sulawesi Utara</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Pollination Date</label>
              <input
                type="date"
                value={estPollinationDate}
                onChange={e => setEstPollinationDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Harvest Quantity (Wet kg)</label>
              <input
                type="number"
                min="1"
                value={estWetQty || ''}
                onChange={e => setEstWetQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Curing Method</label>
              <select
                value={estCuringMethod}
                onChange={e => setEstCuringMethod(e.target.value as 'tradisional' | 'terkontrol')}
                className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
              >
                <option value="tradisional">Traditional (Traditional Drying)</option>
                <option value="terkontrol">Controlled (Solar Greenhouse)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#2C1E15]/10 pt-4">
            <h4 className="font-bold mb-2 text-xs uppercase tracking-wider text-[#2C1E15]/60">Curing Step Durations (Days)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs mb-1">Sweating Stage</label>
                <input
                  type="number"
                  min="0"
                  value={estSweatingDays || ''}
                  onChange={e => setEstSweatingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Sun Drying</label>
                <input
                  type="number"
                  min="0"
                  value={estDryingDays || ''}
                  onChange={e => setEstDryingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Conditioning</label>
                <input
                  type="number"
                  min="0"
                  value={estConditioningDays || ''}
                  onChange={e => setEstConditioningDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#2C1E15] rounded bg-white text-[#2C1E15] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2C1E15] text-[#FAF8F5] font-bold py-3 rounded-lg border border-[#2C1E15] hover:bg-[#FAF8F5] hover:text-[#2C1E15] transition-all mt-4"
          >
            Run AI Estimation
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {estResult ? (
          <div className="relative border border-[#2C1E15] p-6 rounded-xl bg-[#FAF8F5]">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-4 border-b border-[#2C1E15]/10 pb-2">AI Grading Results</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-[#2C1E15] p-4 rounded-lg bg-[#FAF8F5]">
                <p className="text-xs uppercase tracking-wider text-[#2C1E15]/50 font-bold">Predicted Grade</p>
                <p className="text-2xl font-black mt-1">{estResult.predictedGrade}</p>
                <span className="text-xs text-[#2C1E15]/60 font-medium">Confidence: {estResult.confidence}%</span>
              </div>
              <div className="border border-[#2C1E15] p-4 rounded-lg bg-[#FAF8F5]">
                <p className="text-xs uppercase tracking-wider text-[#2C1E15]/50 font-bold">Harvest Status</p>
                <p className="text-xl font-bold mt-1 text-[#2C1E15]">{estResult.harvestStatus}</p>
                <span className="text-xs text-[#2C1E15]/60 font-medium">Age: {estResult.daysSincePollination} days</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between border-b border-[#2C1E15]/10 pb-2">
                <span className="text-[#2C1E15]/60">Estimated Dried Output</span>
                <span className="font-bold">{estResult.dryQtyEstimate} kg</span>
              </div>
              <div className="flex justify-between border-b border-[#2C1E15]/10 pb-2">
                <span className="text-[#2C1E15]/60">Market Value Range (USD)</span>
                <span className="font-bold">${estResult.priceMin} - ${estResult.priceMax} / kg</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-[#2C1E15]/60">Estimated Total Value</span>
                <span className="font-bold text-lg text-[#2C1E15]">${Math.round(estResult.dryQtyEstimate * estResult.priceMin)} - ${Math.round(estResult.dryQtyEstimate * estResult.priceMax)}</span>
              </div>
            </div>

            {estResult.recommendations.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2C1E15]/60 mb-2">Recommendations for Quality Improvement</p>
                <ul className="space-y-1.5 text-xs bg-[#F5EFE6] p-3 rounded-lg border border-[#2C1E15]/20">
                  {estResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2C1E15] mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-[#2C1E15] text-[#FAF8F5] font-bold py-3 rounded-lg border border-[#2C1E15] hover:bg-[#FAF8F5] hover:text-[#2C1E15] transition-all"
            >
              Save Batch to Dashboard
            </button>
          </div>
        ) : (
          <div className="relative border border-[#2C1E15] p-8 rounded-xl bg-[#FAF8F5] text-center flex flex-col items-center justify-center h-64">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-[#2C1E15] font-mono leading-none">+</span>
            <svg className="w-12 h-12 text-[#2C1E15]/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-bold text-[#2C1E15]/60">Enter production data on the left to display AI grading analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
