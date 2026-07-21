'use client';

import { useState } from 'react';

export default function VerifyEmailPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      setMessage(response.ok ? 'Email verified. You can now log in.' : 'Invalid or expired token.');
    } catch {
      setMessage('Verification service is not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-page narrow">
      <header className="content-header">
        <p className="eyebrow">Email verification</p>
        <h1>Verify Email</h1>
        <p>Enter the verification token sent to your applicant email address.</p>
      </header>

      <form className="content-panel content-form" onSubmit={handleSubmit}>
        <label>
          Verification token
          <input value={token} onChange={(event) => setToken(event.target.value)} required disabled={loading} />
        </label>
        <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify email'}
        </button>
      </form>
      {message && <p className="status-message">{message}</p>}
    </main>
  );
}
