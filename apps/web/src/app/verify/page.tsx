'use client';

import { useState } from 'react';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/verify/${token}`);
    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Verify a Certificate</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter certificate token"
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: 4 }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Verify</button>
      </form>

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white' }}>
          <p><strong>Status:</strong> {result.valid ? 'Valid' : 'Invalid'}</p>
          <p><strong>Message:</strong> {result.message}</p>
          {result.institution && <p><strong>Institution:</strong> {result.institution}</p>}
          {result.certificateNumber && <p><strong>Certificate Number:</strong> {result.certificateNumber}</p>}
        </div>
      )}
    </div>
  );
}