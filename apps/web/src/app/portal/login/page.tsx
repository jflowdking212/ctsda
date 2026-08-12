'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';

const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [totp, setTotp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, totpCode: totp || undefined }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Invalid email or password. Please check your credentials.');
        return;
      }

      if (data.requiresTotp) {
        setRequiresTotp(true);
        return;
      }

      if (data.accessToken) {
        window.localStorage.setItem(PORTAL_SESSION_KEY, data.accessToken);
      }
      window.location.href = '/portal/applications';
    } catch {
      setError('The portal is not reachable right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PremiumHeader />

      <main className="flex-1 flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-6 shadow-lg shadow-black/20 flex items-center justify-center">
                  <img src="/images/logo-ctsda.png" alt="CTSDA Logo" className="w-full h-full object-contain" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-3 backdrop-blur-sm">
                  <Shield size={12} /> SECURE PORTAL
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Member Sign In</h1>
                <p className="text-slate-300 text-sm">Access your institutional dashboard and official credentials.</p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="p-8 pb-10">
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Official Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="name@institution.org"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="••••••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {requiresTotp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      2FA Authenticator Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={totp}
                      onChange={(e) => setTotp(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="6-digit code"
                      className="w-full px-4 py-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all font-mono text-center tracking-widest text-lg font-bold"
                    />
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {requiresTotp ? 'Verifying Code...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
                <Link href="/apply" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Not accredited yet? Apply for Accreditation ↗
                </Link>
                <p className="text-xs font-medium text-slate-500">
                  Need technical support? Contact <a href="mailto:management@ctsdamerica.com" className="text-slate-700 hover:text-blue-600 underline transition-colors">management@ctsdamerica.com</a>
                </p>
              </div>

            </form>
          </div>
        </motion.div>
      </main>

      <PremiumFooter />
    </div>
  );
}
