'use client';

import { useState } from 'react';

export default function VerifyEmailPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    setMessage(response.ok ? 'Email verified. You can now log in.' : 'Invalid or expired token.');
  }

  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Verify Email</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Verification token" required style={{ padding: '0.5rem' }} />
        <button type="submit" style={{ padding: '0.5rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Verify</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
