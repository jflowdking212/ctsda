'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SetupAccountForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing setup token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/setup-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to setup account');
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content-page narrow" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="content-panel content-form max-w-md mx-auto w-full p-8">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-2xl font-bold text-slate-900">Setup Your Account</h1>
          <p className="text-slate-500 mt-2">Welcome to CTSDA! Please create a password for your account.</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Account Ready!</h3>
            <p className="text-slate-600 mb-6">Your password has been set successfully.</p>
            <p className="text-sm text-slate-500">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block w-full">
              <span className="block text-sm font-semibold text-slate-700 mb-1">New Password *</span>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </label>
            <label className="block w-full">
              <span className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password *</span>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </label>

            {error && <p className="text-red-600 text-sm mt-1 p-2 bg-red-50 rounded border border-red-100">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading || !token}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors mt-2 ${loading || !token ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Setting up...' : 'Save Password & Continue'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={
      <main className="content-page narrow" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading account setup...</p>
      </main>
    }>
      <SetupAccountForm />
    </Suspense>
  );
}
