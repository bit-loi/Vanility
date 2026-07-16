'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email) {
      setErrorMsg('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMsg('A password reset link has been sent to your email address.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-screen w-screen flex flex-col justify-center items-center p-6 min-h-screen bg-cream-base font-sans text-primary-ink relative">
      <button
        onClick={() => router.push('/login')}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 border-2 border-primary-ink bg-white font-bold text-xs rounded-lg shadow-[2px_2px_0_0_#3b2313] hover:bg-cream-base active:translate-y-0.5 active:shadow-none transition-all"
      >
        &larr; Back to Login
      </button>

      <div className="relative w-full max-w-md border-2 border-primary-ink bg-card-cream p-8 rounded-2xl shadow-[4px_4px_0_0_#3b2313] md:p-10">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>

        <div className="text-center mb-6">
          <img src="/Logo_Vanility.png" className="w-16 h-auto object-contain mx-auto mb-3" alt="Logo" />
          <h2 className="text-xl font-black text-text-dark uppercase">Reset Password</h2>
          <p className="text-xs text-accent-gold font-retro tracking-widest mt-1">Request Reset Link</p>
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

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-primary-ink rounded-lg bg-white focus:outline-none"
              placeholder="yourname@domain.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-ink text-card-cream border-2 border-primary-ink font-bold text-sm rounded-lg active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_0_#3b2313] disabled:opacity-50"
          >
            {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
          </button>
        </form>
      </div>
    </div>
  );
}
