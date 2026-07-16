'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import OverviewTab from '../../components/OverviewTab';
import EstimatorTab from '../../components/EstimatorTab';
import CalculatorTab from '../../components/CalculatorTab';
import GuidanceTab from '../../components/GuidanceTab';
import { Batch } from '../../components/types';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'estimator' | 'calculator' | 'guidance'>('overview');
  const [timeStr, setTimeStr] = useState('13.17.04');
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [profileName, setProfileName] = useState('');
  
  const [batches, setBatches] = useState<Batch[]>([]);

  const loadBatches = async () => {
    try {
      const { data } = await supabase
        .from('vanilla_batches')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const mapped: Batch[] = data.map((item: any, idx: number) => ({
          id: `B${String(data.length - idx).padStart(3, '0')}`,
          name: item.farmer_name,
          region: item.location_region,
          date: item.pollination_date,
          qtyWet: item.quantity_kg_wet,
          qtyDry: item.quantity_kg_dry_estimate,
          grade: item.predicted_grade,
          status: item.curing_method === 'terkontrol' ? 'Controlled' : 'Traditional'
        }));
        setBatches(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Read persisted language choice
    const savedLang = localStorage.getItem('vanility_lang') as 'en' | 'id';
    if (savedLang) {
      setLang(savedLang);
    }

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petani');
        await loadBatches();
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

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

  const handleSaveBatch = async (name: string, region: string, wetQty: number, dryQty: number, grade: string) => {
    await loadBatches();
    setActiveTab('overview');
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'id' : 'en';
    setLang(nextLang);
    localStorage.setItem('vanility_lang', nextLang);
  };

  const totalWetQty = batches.reduce((sum, b) => sum + b.qtyWet, 0);
  const totalDryQty = batches.reduce((sum, b) => sum + b.qtyDry, 0);
  const avgGrade = batches.filter(b => b.grade === 'Grade A').length >= batches.filter(b => b.grade === 'Grade B').length ? 'Grade A' : 'Grade B';

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-cream-base text-primary-ink">
        <div className="font-retro text-[8px] tracking-[0.2em] text-accent-gold uppercase animate-pulse">
          Authenticating Session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream-base font-sans text-primary-ink relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          timeStr={timeStr}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              batches={batches}
              totalWetQty={totalWetQty}
              totalDryQty={totalDryQty}
              avgGrade={avgGrade}
              userName={profileName}
              lang={lang}
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
