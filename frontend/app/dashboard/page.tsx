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
import MatchingTab from '../../components/MatchingTab';
import { Batch } from '../../components/types';
import { 
  toggleBuyerMode, 
  postHeartbeat, 
  getActiveBuyerCount, 
  saveBatchToDb, 
  getBatchesList 
} from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'estimator' | 'calculator' | 'guidance' | 'matching'>('overview');
  const [timeStr, setTimeStr] = useState('13.17.04');
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [profileName, setProfileName] = useState('');
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isBuyerMode, setIsBuyerMode] = useState<boolean>(false);
  const [activeBuyerCount, setActiveBuyerCount] = useState<number>(0);
  const [buyerCriteria, setBuyerCriteria] = useState<any>(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade A');

  const loadBatches = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      
      const data = await getBatchesList(token);
      if (data) {
        const mapped: Batch[] = data.map((item: any, idx: number) => ({
          id: `B${String(data.length - idx).padStart(3, '0')}`,
          dbId: item.id,
          name: item.profiles?.full_name || item.profiles?.company_name || 'Petani',
          region: item.origin || 'Unknown',
          date: new Date(item.created_at).toLocaleDateString(),
          qtyWet: Number((item.quantity_kg / 0.25).toFixed(1)),
          qtyDry: Number(item.quantity_kg),
          grade: item.grade,
          status: item.status === 'export_ready' ? 'Export Ready' : 'Pending'
        }));
        setBatches(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('vanility_lang') as 'en' | 'id';
    if (savedLang) {
      setLang(savedLang);
    }

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
        setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petani');
        
        try {
          const { data: modeState } = await supabase
            .from('buyer_mode_state')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (modeState) {
            setIsBuyerMode(modeState.is_active);
            if (modeState.required_grade) {
              setSelectedGrade(modeState.required_grade);
              setBuyerCriteria({
                required_grade: modeState.required_grade,
                min_quantity_kg: Number(modeState.min_quantity_kg),
                max_quantity_kg: Number(modeState.max_quantity_kg),
                preferred_origin: modeState.preferred_origin,
                industry: modeState.industry
              });
            }
          }
        } catch (err) {
          console.error("Could not fetch buyer state", err);
        }

        await loadBatches();
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  // Supabase Presence Sync
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('buyer-pool', {
      config: { presence: { key: userId } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const activeBuyers = Object.values(state).flat();
      setActiveBuyerCount(activeBuyers.length);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && isBuyerMode && buyerCriteria) {
        await channel.track({
          user_id: userId,
          full_name: profileName,
          ...buyerCriteria
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, isBuyerMode, buyerCriteria, profileName]);

  // 30s Heartbeat Loop
  useEffect(() => {
    if (!isBuyerMode) return;

    const heartbeatTimer = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          await postHeartbeat(token);
        }
      } catch (err) {
        console.error("Failed to post heartbeat:", err);
      }
    }, 30000);

    return () => clearInterval(heartbeatTimer);
  }, [isBuyerMode]);

  // Toggle Mode switch handler
  const handleToggleMode = async () => {
    if (!isBuyerMode) {
      setShowCriteriaModal(true);
    } else {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        
        await toggleBuyerMode(token, false);
        setIsBuyerMode(false);
        setActiveTab('overview');
        
        Swal.fire({
          icon: 'success',
          title: lang === 'en' ? 'Seller Mode Active' : 'Mode Jual Aktif',
          text: lang === 'en' ? 'You switched back to seller mode.' : 'Anda dialihkan kembali ke mode penjual.',
          timer: 2000,
          showConfirmButton: false,
          background: '#fbf7ee',
          color: '#3b2313',
          customClass: { popup: 'rounded-xl border-2' }
        });
      } catch (e: any) {
        console.error(e);
      }
    }
  };

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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const payload = {
        grade: batchData.predicted_grade,
        quantity_kg: batchData.quantity_kg_dry_estimate,
        origin: batchData.location_region,
        harvest_days: batchData.sweating_duration_days + batchData.sun_drying_duration_days,
        conditioning_days: batchData.conditioning_duration_days,
        export_readiness_score: batchData.predicted_grade === 'Grade A' ? 90 : (batchData.predicted_grade === 'Grade B' ? 75 : 40),
        status: 'pending'
      };

      await saveBatchToDb(token, payload);
    } catch (e: any) {
      console.error("Error auto-saving batch to API:", e.message || e);
    }
    await loadBatches();
  };

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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const payload = {
        grade: batchData.predicted_grade,
        quantity_kg: batchData.quantity_kg_dry_estimate,
        origin: batchData.location_region,
        harvest_days: batchData.sweating_duration_days + batchData.sun_drying_duration_days,
        conditioning_days: batchData.conditioning_duration_days,
        export_readiness_score: batchData.predicted_grade === 'Grade A' ? 90 : (batchData.predicted_grade === 'Grade B' ? 75 : 40),
        status: 'export_ready'
      };

      await saveBatchToDb(token, payload);
    } catch (e: any) {
      console.error("Error saving batch to API:", e.message || e);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Could not save batch to database.',
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
        isBuyerMode={isBuyerMode}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          timeStr={timeStr}
          lang={lang}
          onToggleLang={handleToggleLang}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isBuyerMode={isBuyerMode}
          onToggleMode={handleToggleMode}
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
              activeBuyerCount={activeBuyerCount}
              isBuyerMode={isBuyerMode}
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

          {activeTab === 'matching' && (
            <MatchingTab batches={batches} lang={lang} isBuyerMode={isBuyerMode} />
          )}
        </main>
      </div>

      {/* Buyer Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-primary-ink bg-card-cream p-6 rounded-xl shadow-[4px_4px_0_0_#3b2313] relative">
            <h3 className="text-xl font-retro text-accent-gold uppercase tracking-wide mb-4">
              {lang === 'en' ? 'Buyer Match Criteria' : 'Kriteria Pembelian'}
            </h3>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const criteria = {
                  required_grade: formData.get('required_grade') as string,
                  min_quantity_kg: Number(formData.get('min_quantity_kg')),
                  max_quantity_kg: Number(formData.get('max_quantity_kg')),
                  preferred_origin: formData.get('preferred_origin') as string,
                  industry: formData.get('industry') as string,
                };
                
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  const token = session?.access_token;
                  if (!token) return;
                  
                  await toggleBuyerMode(token, true, criteria);
                  setBuyerCriteria(criteria);
                  setIsBuyerMode(true);
                  setShowCriteriaModal(false);
                  setActiveTab('matching');
                  
                  Swal.fire({
                    icon: 'success',
                    title: lang === 'en' ? 'Buyer Mode Active' : 'Mode Pembeli Aktif',
                    text: lang === 'en' ? 'You are now online in the live Buyer Pool.' : 'Anda sekarang online di Kolam Pembeli aktif.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#fbf7ee',
                    color: '#3b2313',
                    customClass: { popup: 'rounded-xl border-2' }
                  });
                } catch (err) {
                  console.error(err);
                  Swal.fire({
                    icon: 'error',
                    title: lang === 'en' ? 'Toggle Failed' : 'Gagal Beralih',
                    text: lang === 'en' ? 'Could not toggle mode. Please try again.' : 'Gagal mengaktifkan mode. Silakan coba lagi.',
                    background: '#fbf7ee',
                    color: '#3b2313',
                    customClass: { popup: 'rounded-xl border-2' }
                  });
                }
              }}
              className="space-y-4 text-xs font-bold text-primary-ink font-sans"
            >
              <div>
                <label className="block text-primary-ink uppercase font-retro text-[8px] tracking-wider mb-1">
                  {lang === 'en' ? 'Required Grade' : 'Mutu Minimal'}
                </label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setGradeDropdownOpen(!gradeDropdownOpen)}
                    className="w-full flex justify-between items-center px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-bold text-xs text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-primary-ink"
                  >
                    <span>{selectedGrade}</span>
                    <svg className={`w-4 h-4 transition-transform ${gradeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {gradeDropdownOpen && (
                    <div className="absolute right-0 left-0 mt-1 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-[99999] overflow-hidden">
                      {['Grade A', 'Grade B', 'Low Grade'].map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            setSelectedGrade(grade);
                            setGradeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-bold transition-colors border-b border-primary-ink/10 last:border-0 block hover:bg-cream-base text-primary-ink ${
                            selectedGrade === grade ? 'bg-primary-ink text-card-cream' : ''
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="hidden" name="required_grade" value={selectedGrade} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary-ink uppercase font-retro text-[8px] tracking-wider mb-1">
                    {lang === 'en' ? 'Min Qty (kg)' : 'Min Kuantitas (kg)'}
                  </label>
                  <input 
                    type="number" 
                    name="min_quantity_kg" 
                    defaultValue={buyerCriteria?.min_quantity_kg || 10} 
                    className="w-full border-2 border-primary-ink rounded-lg p-2 bg-white text-xs font-bold text-primary-ink"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-ink uppercase font-retro text-[8px] tracking-wider mb-1">
                    {lang === 'en' ? 'Max Qty (kg)' : 'Max Kuantitas (kg)'}
                  </label>
                  <input 
                    type="number" 
                    name="max_quantity_kg" 
                    defaultValue={buyerCriteria?.max_quantity_kg || 500} 
                    className="w-full border-2 border-primary-ink rounded-lg p-2 bg-white text-xs font-bold text-primary-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-primary-ink uppercase font-retro text-[8px] tracking-wider mb-1">
                  {lang === 'en' ? 'Preferred Origin' : 'Asal Daerah Pilihan'}
                </label>
                <input 
                  type="text" 
                  name="preferred_origin" 
                  defaultValue={buyerCriteria?.preferred_origin || 'NTT'} 
                  className="w-full border-2 border-primary-ink rounded-lg p-2 bg-white text-xs font-bold text-primary-ink"
                  required
                />
              </div>

              <div>
                <label className="block text-primary-ink uppercase font-retro text-[8px] tracking-wider mb-1">
                  {lang === 'en' ? 'Industry Profile' : 'Profil Industri'}
                </label>
                <input 
                  type="text" 
                  name="industry" 
                  placeholder={lang === 'en' ? 'e.g. Gourmet Curing' : 'misal: Pabrik Ekstrak Vanili'} 
                  defaultValue={buyerCriteria?.industry || 'Gourmet Export'} 
                  className="w-full border-2 border-primary-ink rounded-lg p-2 bg-white text-xs font-bold text-primary-ink"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCriteriaModal(false)}
                  className="flex-1 border-2 border-primary-ink bg-white hover:bg-cream-base rounded-lg py-2 font-retro text-[8px] tracking-wider cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                >
                  {lang === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="flex-1 border-2 border-primary-ink bg-[#3b2313] text-[#fbf7ee] hover:bg-[#4d3221] rounded-lg py-2 font-retro text-[8px] tracking-wider cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                >
                  {lang === 'en' ? 'Activate Buyer Mode' : 'Aktifkan Mode Pembeli'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
