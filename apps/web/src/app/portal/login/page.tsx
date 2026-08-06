'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: 'radial-gradient(ellipse at top, rgba(37,99,235,0.06), transparent 70%)' }}>
        <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
          
          {/* Card Top Brand Banner */}
          <div style={{ backgroundColor: '#0f172a', padding: '2rem 1.5rem', textAlign: 'center', color: '#ffffff', position: 'relative' }}>
            <img src="/images/logo-ctsda.png" alt="CTSDA Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 0.75rem auto', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#60a5fa', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
              CTSDA PORTAL ACCESS
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Applicant &amp; Member Sign In</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem', marginBottom: 0, lineHeight: 1.4 }}>
              Sign in to manage accreditation applications, view payment status, and access verified digital credentials.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Official Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="name@institution.org"
                style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '100%', transition: 'all 0.15s' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Account Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••••••"
                style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '100%', transition: 'all 0.15s' }}
              />
            </div>

            {requiresTotp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Two-Factor Authentication (TOTP Code) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="6-digit authenticator code"
                  style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #2563eb', fontSize: '0.9rem', outline: 'none', width: '100%', backgroundColor: '#eff6ff' }}
                />
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                backgroundColor: loading ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease-in-out',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                marginTop: '0.25rem',
              }}
            >
              {loading ? (requiresTotp ? 'Verifying TOTP Code...' : 'Signing In...') : 'Sign In to Portal'}
            </button>

            <div style={{ marginTop: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <Link href="/apply" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                Not accredited yet? Apply for Accreditation ↗
              </Link>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Need technical support? Contact <a href="mailto:management@ctsdamerica.com" style={{ color: '#475569', textDecoration: 'underline' }}>management@ctsdamerica.com</a>
              </span>
            </div>
          </form>

        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
