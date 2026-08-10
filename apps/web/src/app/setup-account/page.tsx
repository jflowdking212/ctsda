'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';

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
        router.push('/portal/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: 'radial-gradient(ellipse at top, rgba(37,99,235,0.06), transparent 70%)' }}>
        <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
          
          <div style={{ backgroundColor: '#0f172a', padding: '2rem 1.5rem', textAlign: 'center', color: '#ffffff', position: 'relative' }}>
            <img src="/images/logo-ctsda.png" alt="CTSDA Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#60a5fa', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
              ACCOUNT SETUP
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Create Your Password</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem', marginBottom: 0, lineHeight: 1.4 }}>
              Set a secure password to access your CTSDA portal.
            </p>
          </div>

          {success ? (
            <div style={{ padding: '2.5rem 1.75rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.75rem', fontWeight: 800 }}>✓</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Account Ready!</h3>
              <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Your password has been set successfully.</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading || !token}
                  placeholder="At least 8 characters"
                  style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '100%', transition: 'all 0.15s' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading || !token}
                  placeholder="Repeat new password"
                  style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '100%', transition: 'all 0.15s' }}
                />
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || !token}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  backgroundColor: (loading || !token) ? '#94a3b8' : '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease-in-out',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  marginTop: '0.25rem',
                }}
              >
                {loading ? 'Setting up...' : 'Save Password & Continue'}
              </button>
            </form>
          )}
        </div>
      </main>
      
      <PremiumFooter />
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b' }}>Loading account setup...</p>
      </main>
    }>
      <SetupAccountForm />
    </Suspense>
  );
}
