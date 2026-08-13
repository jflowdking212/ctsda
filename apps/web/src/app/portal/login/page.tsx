'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicPage } from '../../../components/public-shell';

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
        window.localStorage.setItem('ctsda_portal_session', data.accessToken);
      }
      window.location.href = '/portal/applications';
    } catch {
      setError('The portal is not reachable right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

        {/* Hero Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '4.75rem 1.5rem 5rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
              <svg style={{ width: '14px', height: '14px', color: '#93c5fd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Secure Portal</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.15 }}>
              Institution Portal Login
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
              Access your accreditation dashboard, credentials, and official documents.
            </p>
          </div>
        </section>

        {/* Login Card */}
        <section style={{ padding: '3rem 1.5rem 5rem' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{
              background: '#fff',
              borderRadius: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 32px rgba(16,35,63,0.10)',
              padding: '2.5rem',
            }}>
              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img src="/images/logo-ctsda.png" alt="CTSDA" style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 0.75rem' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10233f', margin: '0 0 0.25rem' }}>
                  {requiresTotp ? 'Two-Factor Authentication' : 'Member Sign In'}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#5d6a7c', margin: 0 }}>
                  {requiresTotp
                    ? 'Enter the 6-digit code from your authenticator app.'
                    : 'Sign in to your accredited institution account.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.6rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {!requiresTotp ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#10233f', marginBottom: '0.4rem' }}>
                        Official Email Address <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="your@institution.com"
                        style={{
                          width: '100%',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '0.6rem',
                          padding: '0.75rem 0.9rem',
                          fontSize: '0.95rem',
                          color: '#10233f',
                          background: '#f8fafc',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#2563eb')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#10233f', marginBottom: '0.4rem' }}>
                        Account Password <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••••"
                        style={{
                          width: '100%',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '0.6rem',
                          padding: '0.75rem 0.9rem',
                          fontSize: '0.95rem',
                          color: '#10233f',
                          background: '#f8fafc',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#2563eb')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#10233f', marginBottom: '0.4rem' }}>
                      Authentication Code <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={totp}
                      onChange={e => setTotp(e.target.value)}
                      required
                      placeholder="000000"
                      maxLength={6}
                      style={{
                        width: '100%',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '0.6rem',
                        padding: '0.75rem 0.9rem',
                        fontSize: '1.25rem',
                        letterSpacing: '0.3em',
                        textAlign: 'center',
                        color: '#10233f',
                        background: '#f8fafc',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2563eb')}
                      onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.6rem',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <svg style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In to Portal
                      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.875rem', color: '#5d6a7c', margin: 0 }}>
                  Not yet accredited?{' '}
                  <Link href="/apply" style={{ color: '#2563eb', fontWeight: 600 }}>
                    Apply for Accreditation ↗
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#5d6a7c', fontSize: '0.82rem' }}>
              <svg style={{ width: '16px', height: '16px', color: '#2563eb', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secured portal for accredited institutions only
            </div>
          </div>
        </section>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </PublicPage>
  );
}
