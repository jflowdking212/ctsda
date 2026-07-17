'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [totp, setTotp] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, totpCode: totp || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    if (data.requiresTotp) {
      setRequiresTotp(true);
      return;
    }

    window.location.href = '/portal/applications';
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Applicant Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </label>
        {requiresTotp && (
          <label>
            TOTP Code
            <input type="text" value={totp} onChange={(e) => setTotp(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
        )}
        {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Login</button>
        <a href="/portal/register" style={{ textAlign: 'center', color: '#1a365d' }}>Create applicant account</a>
      </form>
    </div>
  );
}
