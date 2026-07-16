import React, { useState } from 'react';
import { estimateBatch } from '../lib/api';

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
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isCuringOpen, setIsCuringOpen] = useState(false);

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

  const handleEstimateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estPollinationDate) return;

    try {
      const data = await estimateBatch({
        farmer_name: estName || 'Pak Yuven',
        location_region: estRegion,
        pollination_date: estPollinationDate,
        curing_method: estCuringMethod,
        sweating_duration_days: estSweatingDays,
        sun_drying_duration_days: estDryingDays,
        conditioning_duration_days: estConditioningDays,
        quantity_kg_wet: estWetQty
      });

      const pollDate = new Date(estPollinationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - pollDate.getTime());
      const daysSincePollination = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setEstResult({
        daysSincePollination,
        harvestStatus: data.harvest_status,
        predictedGrade: data.predicted_grade,
        confidence: Math.round(data.confidence_score * 100),
        dryQtyEstimate: data.quantity_kg_dry_estimate,
        priceMin: data.estimated_price_usd_per_kg_min,
        priceMax: data.estimated_price_usd_per_kg_max,
        recommendations: data.recommendations
      });
    } catch (err) {
      console.error(err);
    }
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
      <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        
        <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
          <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">Input Production Data</h3>
          <span className="font-retro text-[7px] text-primary-ink/50 uppercase">Form Session</span>
        </div>
        
        <form onSubmit={handleEstimateSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-bold mb-1 text-text-dark">Batch Identifier</label>
            <input
              type="text"
              value={estName}
              onChange={e => setEstName(e.target.value)}
              placeholder="e.g. Batch Manggarai Utama"
              required
              className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none focus:bg-[#FAF8F5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block font-bold mb-1 text-text-dark">Region</label>
              <button
                type="button"
                onClick={() => {
                  setIsRegionOpen(!isRegionOpen);
                  setIsCuringOpen(false);
                }}
                className="w-full flex justify-between items-center px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-medium text-sm text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>{estRegion}</span>
                <svg className={`w-4 h-4 transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isRegionOpen && (
                <div className="absolute left-0 right-0 mt-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-10 overflow-hidden max-h-48 overflow-y-auto">
                  {['Manggarai Barat, NTT', 'Ende, NTT', 'Flores Timur, NTT', 'Minahasa, Sulawesi Utara'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setEstRegion(r);
                        setIsRegionOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors border-b border-primary-ink/10 last:border-0 ${
                        estRegion === r ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block font-bold mb-1 text-text-dark">Pollination Date</label>
              <input
                type="date"
                value={estPollinationDate}
                onChange={e => setEstPollinationDate(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1 text-text-dark">Harvest Quantity (Wet kg)</label>
              <input
                type="number"
                min="1"
                value={estWetQty || ''}
                onChange={e => setEstWetQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
              />
            </div>
            <div className="relative">
              <label className="block font-bold mb-1 text-text-dark">Curing Method</label>
              <button
                type="button"
                onClick={() => {
                  setIsCuringOpen(!isCuringOpen);
                  setIsRegionOpen(false);
                }}
                className="w-full flex justify-between items-center px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-medium text-sm text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>{estCuringMethod === 'tradisional' ? 'Traditional (Traditional Drying)' : 'Controlled (Solar Greenhouse)'}</span>
                <svg className={`w-4 h-4 transition-transform ${isCuringOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCuringOpen && (
                <div className="absolute left-0 right-0 mt-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setEstCuringMethod('tradisional');
                      setIsCuringOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors border-b border-primary-ink/10 ${
                      estCuringMethod === 'tradisional' ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                    }`}
                  >
                    Traditional (Traditional Drying)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEstCuringMethod('terkontrol');
                      setIsCuringOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors ${
                      estCuringMethod === 'terkontrol' ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                    }`}
                  >
                    Controlled (Solar Greenhouse)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t-2 border-primary-ink/10 pt-4">
            <h4 className="font-retro text-[8px] tracking-wider text-accent-gold uppercase mb-3">Curing Step Durations (Days)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-primary-ink/70">Sweating</label>
                <input
                  type="number"
                  min="0"
                  value={estSweatingDays || ''}
                  onChange={e => setEstSweatingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-primary-ink/70">Sun Drying</label>
                <input
                  type="number"
                  min="0"
                  value={estDryingDays || ''}
                  onChange={e => setEstDryingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-primary-ink/70">Conditioning</label>
                <input
                  type="number"
                  min="0"
                  value={estConditioningDays || ''}
                  onChange={e => setEstConditioningDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white text-primary-ink focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full cartoon-btn cartoon-shine-container font-bold py-3.5 rounded-lg text-sm cursor-pointer mt-4"
          >
            Run AI Estimation
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {estResult ? (
          <div className="relative border-2 border-primary-ink p-6 rounded-xl bg-card-cream cartoon-shadow-lg">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            
            <div className="flex justify-between items-center mb-4 border-b-2 border-primary-ink/15 pb-2">
              <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">AI Grading Results</h3>
              <span className="font-retro text-[7px] text-[#065f46] uppercase">ESTIMATED</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-primary-ink p-4 rounded-lg bg-card-cream shadow-[2px_2px_0_0_#3b2313]">
                <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase">Predicted Grade</p>
                <p className="text-2xl font-black mt-1 text-text-dark">{estResult.predictedGrade}</p>
                <span className="text-[10px] text-primary-ink/60 font-bold">Confidence: {estResult.confidence}%</span>
              </div>
              <div className="border-2 border-primary-ink p-4 rounded-lg bg-card-cream shadow-[2px_2px_0_0_#3b2313]">
                <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase">Harvest Status</p>
                <p className="text-lg font-bold mt-1 text-text-dark">{estResult.harvestStatus}</p>
                <span className="text-[10px] text-primary-ink/60 font-bold">Age: {estResult.daysSincePollination} days</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm border-b-2 border-primary-ink/10 pb-4">
              <div className="flex justify-between pb-1">
                <span className="text-primary-ink/70 font-semibold">Estimated Dried Output</span>
                <span className="font-bold text-text-dark">{estResult.dryQtyEstimate} kg</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-primary-ink/70 font-semibold">Market Value Range (USD)</span>
                <span className="font-bold text-text-dark">${estResult.priceMin} - ${estResult.priceMax} / kg</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-primary-ink/10">
                <span className="text-primary-ink/80 font-bold">Estimated Total Value</span>
                <span className="font-black text-lg text-text-dark">${Math.round(estResult.dryQtyEstimate * estResult.priceMin)} - ${Math.round(estResult.dryQtyEstimate * estResult.priceMax)}</span>
              </div>
            </div>

            {estResult.recommendations.length > 0 && (
              <div className="mb-6">
                <p className="font-retro text-[7px] tracking-wider text-accent-gold uppercase mb-2">Recommendations for Quality Improvement</p>
                <ul className="space-y-2 text-xs bg-cream-base border-2 border-primary-ink p-3 rounded-lg">
                  {estResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-ink mt-1.5 mr-2 flex-shrink-0"></span>
                      <span className="font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full cartoon-btn cartoon-shine-container font-bold py-3 rounded-lg text-xs cursor-pointer"
            >
              Save Batch to Dashboard
            </button>
          </div>
        ) : (
          <div className="relative border-2 border-primary-ink p-8 rounded-xl bg-card-cream cartoon-shadow-lg text-center flex flex-col items-center justify-center h-64">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <svg className="w-12 h-12 text-primary-ink/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-bold text-primary-ink/60">Enter production data on the left to display AI grading analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
