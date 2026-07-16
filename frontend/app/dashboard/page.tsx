'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Auto-save on form submit — saves to DB then stays on Estimator tab to show results
  const handleSaveBatchAuto = async (batchData: {
    farmer_name: string;
    location_region: string;
    pollination_date: string;
    curing_method: string;
    sweating_duration_days: number;
    sun_drying_duration_days: number;
    conditioning_duration_days: number;
    predicted_grade: string;
    confidence_score: number;
    quantity_kg_wet: number;
    quantity_kg_dry_estimate: number;
  }) => {
    try {
      const { error } = await supabase
        .from('vanilla_batches')
        .insert(batchData);
      if (error) throw error;
    } catch (e: any) {
      console.error("Error saving batch to Supabase:", e.message || e);
      throw e; // Let EstimatorTab handle the error
    }
    await loadBatches();
  };

  // Manual save + navigate to overview (used by Save Batch button)
  const handleSaveBatch = async (batchData: {
    farmer_name: string;
    location_region: string;
    pollination_date: string;
    curing_method: string;
    sweating_duration_days: number;
    sun_drying_duration_days: number;
    conditioning_duration_days: number;
    predicted_grade: string;
    confidence_score: number;
    quantity_kg_wet: number;
    quantity_kg_dry_estimate: number;
  }) => {
    try {
      const { error } = await supabase
        .from('vanilla_batches')
        .insert(batchData);
      if (error) throw error;
    } catch (e: any) {
      console.error("Error saving batch to Supabase:", e.message || e);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Could not save batch to database. Please run the RLS fix SQL in Supabase dashboard first.',
        confirmButtonColor: '#3b2313',
        background: '#fbf7ee',
        color: '#3b2313',
        customClass: {
          popup: 'rounded-xl border-2',
          confirmButton: 'rounded-lg font-bold text-sm px-6 py-2',
        },
      });
      return;
    }
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
  let avgGrade = '-';
  if (batches.length > 0) {
    const gradeACount = batches.filter(b => b.grade === 'Grade A').length;
    const gradeBCount = batches.filter(b => b.grade === 'Grade B').length;
    const lowGradeCount = batches.filter(b => b.grade === 'Low Grade' || b.grade === 'Grade C' || (!b.grade.includes('A') && !b.grade.includes('B'))).length;

    if (gradeACount >= gradeBCount && gradeACount >= lowGradeCount) {
      avgGrade = 'Grade A';
    } else if (gradeBCount >= gradeACount && gradeBCount >= lowGradeCount) {
      avgGrade = 'Grade B';
    } else {
      avgGrade = 'Low Grade';
    }
  }

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
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          timeStr={timeStr}
          lang={lang}
          onToggleLang={handleToggleLang}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
            <EstimatorTab onSaveBatch={handleSaveBatch} onSaveBatchAuto={handleSaveBatchAuto} />
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
