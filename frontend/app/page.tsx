'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import OverviewTab from '../components/OverviewTab';
import EstimatorTab from '../components/EstimatorTab';
import CalculatorTab from '../components/CalculatorTab';
import GuidanceTab from '../components/GuidanceTab';
import { Batch } from '../components/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'estimator' | 'calculator' | 'guidance'>('overview');
  const [timeStr, setTimeStr] = useState('13.17.04');
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: 'B001',
      name: 'Batch Manggarai Premium',
      region: 'Manggarai Barat, NTT',
      date: '2026-07-10',
      qtyWet: 15.0,
      qtyDry: 3.8,
      grade: 'Grade A',
      status: 'Conditioning'
    },
    {
      id: 'B002',
      name: 'Batch Ende Curing',
      region: 'Ende, NTT',
      date: '2026-07-05',
      qtyWet: 20.0,
      qtyDry: 4.8,
      grade: 'Grade B',
      status: 'Sun Drying'
    },
    {
      id: 'B003',
      name: 'Batch Flores Barat',
      region: 'Manggarai Barat, NTT',
      date: '2026-07-15',
      qtyWet: 10.0,
      qtyDry: 2.2,
      grade: 'Low Grade',
      status: 'Sweating'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hrs}.${mins}.${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveBatch = (name: string, region: string, wetQty: number, dryQty: number, grade: string) => {
    const newBatch: Batch = {
      id: `B${String(batches.length + 1).padStart(3, '0')}`,
      name,
      region,
      date: new Date().toISOString().split('T')[0],
      qtyWet: wetQty,
      qtyDry: dryQty,
      grade,
      status: 'Verification'
    };
    setBatches([newBatch, ...batches]);
    setActiveTab('overview');
  };

  const totalWetQty = batches.reduce((sum, b) => sum + b.qtyWet, 0);
  const totalDryQty = batches.reduce((sum, b) => sum + b.qtyDry, 0);
  const avgGrade = batches.filter(b => b.grade === 'Grade A').length >= batches.filter(b => b.grade === 'Grade B').length ? 'Grade A' : 'Grade B';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream-base font-sans text-primary-ink">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} timeStr={timeStr} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              batches={batches}
              totalWetQty={totalWetQty}
              totalDryQty={totalDryQty}
              avgGrade={avgGrade}
            />
          )}

          {activeTab === 'estimator' && (
            <EstimatorTab onSaveBatch={handleSaveBatch} />
          )}

          {activeTab === 'calculator' && (
            <CalculatorTab />
          )}

          {activeTab === 'guidance' && (
            <GuidanceTab />
          )}
        </main>
      </div>
    </div>
  );
}
