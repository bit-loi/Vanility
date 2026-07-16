'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email for verification.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center p-4 md:p-6 bg-cream-base font-sans text-primary-ink relative">
      <div className="w-full max-w-md flex justify-start mb-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-primary-ink bg-white font-bold text-xs rounded-lg shadow-[2px_2px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          &larr; Back to Home
        </button>
      </div>
      <div className="relative w-full max-w-md border-2 border-primary-ink bg-card-cream p-8 rounded-2xl shadow-[4px_4px_0_0_#3b2313] md:p-10">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

        <div className="text-center mb-8">
          <img src="/Logo_Vanility.png" className="w-20 h-auto object-contain mx-auto" alt="Logo" />
        </div>

        <div className="flex border-2 border-primary-ink rounded-lg overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-center text-sm font-bold transition-all ${
              !isRegister ? 'bg-primary-ink text-card-cream' : 'bg-white hover:bg-cream-base'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-center text-sm font-bold transition-all ${
              isRegister ? 'bg-primary-ink text-card-cream' : 'bg-white hover:bg-cream-base'
            }`}
          >
            REGISTER
          </button>
        </div>

        {errorMsg && (
          <div className="border-2 border-red-600 bg-red-50 text-red-700 text-xs p-3 rounded-lg font-bold mb-4">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="border-2 border-green-600 bg-green-50 text-green-700 text-xs p-3 rounded-lg font-bold mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none"
              placeholder="name@domain.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase">Password</label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-[10px] font-bold text-accent-gold hover:underline uppercase"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary-ink text-card-cream border-2 border-primary-ink font-bold text-sm rounded-lg active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_0_#3b2313]"
          >
            {isRegister ? 'REGISTER BATCH' : 'SIGN IN TO SYSTEM'}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-b border-primary-ink/20"></div>
          <span className="relative px-3 bg-card-cream text-xs text-primary-ink/50 uppercase font-retro text-[8px]">Or Connect With</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center gap-2 py-2 bg-white text-primary-ink border-2 border-primary-ink font-bold text-sm rounded-lg hover:bg-cream-base transition-all shadow-[2px_2px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google Account
        </button>
      </div>
    </div>
  );
}
