'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

const profileTranslations = {
  en: {
    profileSettings: 'Profile Settings',
    backToDashboard: 'Back to Dashboard',
    displayName: 'Display Name',
    location: 'Location / Region',
    userType: 'User Type',
    individual: 'Individual Farmer',
    koperasi: 'Cooperative / Koperasi',
    authInfo: 'Authentication Info',
    emailAddress: 'Email Address',
    provider: 'Login Provider',
    saveBtn: 'Save Profile',
    savingBtn: 'Saving...',
    successMsg: 'Profile updated successfully!',
  },
  id: {
    profileSettings: 'Pengaturan Profil',
    backToDashboard: 'Kembali ke Dasbor',
    displayName: 'Nama Tampilan',
    location: 'Lokasi / Wilayah',
    userType: 'Tipe Pengguna',
    individual: 'Petani Mandiri',
    koperasi: 'Koperasi / Kelompok Tani',
    authInfo: 'Informasi Otentikasi',
    emailAddress: 'Alamat Email',
    provider: 'Penyedia Login',
    saveBtn: 'Simpan Profil',
    savingBtn: 'Menyimpan...',
    successMsg: 'Profil berhasil diperbarui!',
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'id'>('en');

  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileRegion, setProfileRegion] = useState('');
  const [userType, setUserType] = useState('individual');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState('');

  useEffect(() => {
    // Read persisted language
    const savedLang = localStorage.getItem('vanility_lang') as 'en' | 'id';
    if (savedLang) {
      setLang(savedLang);
    }

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setEmail(user.email || '');
        setProvider(user.app_metadata?.provider || 'email');
        setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        
        try {
          const { data } = await supabase
            .from('users')
            .select('location_region, user_type')
            .eq('id', user.id)
            .single();
          if (data) {
            setProfileRegion(data.location_region || '');
            setUserType(data.user_type || 'individual');
          }
        } catch (e) {
          // Fallback if record does not exist
        }
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalStatus('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active user session');

      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: profileName }
      });
      if (authErr) throw authErr;

      const { error: dbErr } = await supabase.from('users').upsert({
        id: user.id,
        name: profileName,
        location_region: profileRegion,
        user_type: userType
      });
      if (dbErr) throw dbErr;

      setModalStatus(t.successMsg);
    } catch (err: any) {
      setModalStatus(err.message || 'Failed to save profile changes');
    } finally {
      setModalLoading(false);
    }
  };

  const t = profileTranslations[lang];

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-cream-base text-primary-ink">
        <div className="font-retro text-[8px] tracking-[0.2em] text-accent-gold uppercase animate-pulse">
          Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-cream-base font-sans text-primary-ink flex flex-col justify-between">
      <header className="border-b-2 border-primary-ink px-6 py-4 flex justify-between items-center bg-card-cream">
        <div className="flex items-center">
          <img src="/Logo_Vanility.png" className="w-10 h-auto object-contain" alt="Logo" />
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border-2 border-primary-ink bg-white font-bold text-xs rounded-lg shadow-[2px_2px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all"
        >
          {t.backToDashboard}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        <div className="relative w-full border-2 border-primary-ink bg-card-cream p-8 rounded-2xl shadow-[4px_4px_0_0_#3b2313] md:p-10">
          <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-text-dark uppercase">{t.profileSettings}</h2>
            <p className="text-xs text-accent-gold font-retro tracking-widest mt-1">GH7.0 Config</p>
          </div>

          {modalStatus && (
            <div className={`border-2 text-xs p-3 rounded-lg font-bold mb-6 ${
              modalStatus.includes('success') || modalStatus.includes('berhasil')
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-red-600 bg-red-50 text-red-700'
            }`}>
              {modalStatus}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">{t.displayName}</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none"
                placeholder="e.g. Jason Loi"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">{t.location}</label>
              <input
                type="text"
                value={profileRegion}
                onChange={(e) => setProfileRegion(e.target.value)}
                className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none"
                placeholder="e.g. Manggarai Barat, NTT"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold uppercase mb-1">{t.userType}</label>
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="w-full flex justify-between items-center px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none font-bold text-xs text-left shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <span>{userType === 'individual' ? t.individual : t.koperasi}</span>
                <svg className={`w-4 h-4 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSelectOpen && (
                <div className="absolute left-0 right-0 mt-1.5 border-2 border-primary-ink bg-white rounded-lg shadow-[3px_3px_0_0_#3b2313] z-10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setUserType('individual');
                      setIsSelectOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-bold transition-colors border-b border-primary-ink/10 ${
                      userType === 'individual' ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                    }`}
                  >
                    {t.individual}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserType('koperasi');
                      setIsSelectOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-bold transition-colors ${
                      userType === 'koperasi' ? 'bg-primary-ink text-card-cream' : 'hover:bg-cream-base text-primary-ink'
                    }`}
                  >
                    {t.koperasi}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-primary-ink/20 pt-4 mt-6">
              <h4 className="text-xs font-retro text-accent-gold uppercase mb-2">{t.authInfo}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="font-semibold text-primary-ink/60">{t.emailAddress}:</div>
                <div className="font-bold text-right text-text-dark truncate">{email}</div>
                
                <div className="font-semibold text-primary-ink/60">{t.provider}:</div>
                <div className="font-bold text-right text-text-dark uppercase">{provider}</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={modalLoading}
              className="w-full py-2.5 bg-primary-ink text-card-cream border-2 border-primary-ink font-bold text-sm rounded-lg active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_0_#3b2313] disabled:opacity-50"
            >
              {modalLoading ? t.savingBtn : t.saveBtn}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t-2 border-primary-ink px-6 py-4 text-center bg-card-cream text-xs text-primary-ink/60 font-retro text-[8px] uppercase tracking-wider">
        Garuda Hacks 7.0 Event Submission
      </footer>
    </div>
  );
}
