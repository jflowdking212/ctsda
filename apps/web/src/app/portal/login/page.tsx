'use client';

import { useState } from 'react';

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
        setError(data.message || 'Login failed');
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
      setError('The portal is not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-page narrow">
      <header className="content-header">
        <p className="eyebrow">Applicant access</p>
        <h1>Applicant Login</h1>
        <p>Sign in to manage applications, payment status, and supporting documents.</p>
      </header>

      <form className="content-panel content-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        </label>
        {requiresTotp && (
          <label>
            TOTP Code
            <input type="text" value={totp} onChange={(e) => setTotp(e.target.value)} required disabled={loading} />
          </label>
        )}
        {error && <p className="status-message error">{error}</p>}
        <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading}>
          {loading ? (requiresTotp ? 'Verifying...' : 'Signing in...') : 'Login'}
        </button>
        <a className="text-link" href="/apply">Apply for accreditation</a>
      </form>
    </main>
  );
}
