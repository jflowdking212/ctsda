'use client';

import { useState } from 'react';

type VerificationResult = {
  valid?: boolean;
  message?: string;
  institution?: string;
  certificateNumber?: string;
};

const INVALID_CERTIFICATE_RESULT: VerificationResult = {
  valid: false,
  message: 'Certificate token is wrong or could not be verified.',
};

export function CertificateVerifier({
  initialToken = '',
}: {
  initialToken?: string;
  compact?: boolean;
}) {
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanToken = token.trim();

    setResult(null);
    setError('');

    if (!cleanToken) {
      setError('Please enter a certificate number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/verify/${encodeURIComponent(cleanToken)}`,
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResult({
          valid: false,
          message: data.message || INVALID_CERTIFICATE_RESULT.message,
        });
        return;
      }

      setResult({
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'Certificate is valid and active.' : INVALID_CERTIFICATE_RESULT.message),
        institution: data.institution,
        certificateNumber: data.certificateNumber || cleanToken,
      });
    } catch {
      setResult(INVALID_CERTIFICATE_RESULT);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            htmlFor="certificate-number-input"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '0.5rem',
            }}
          >
            Certificate Number
          </label>
          <input
            id="certificate-number-input"
            value={token}
            onChange={(event) => setToken(event.target.value.toUpperCase())}
            placeholder="e.g., CTSDA-125346-AB"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.875rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.875rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            backgroundColor: result.valid ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${result.valid ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Status:</span>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: result.valid ? '#22c55e' : '#ef4444',
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              {result.valid ? 'Valid & Active' : 'Invalid / Expired'}
            </span>
          </div>

          {result.message && (
            <p style={{ fontSize: '0.875rem', color: result.valid ? '#166534' : '#991b1b', marginBottom: '0.5rem' }}>
              {result.message}
            </p>
          )}

          {result.institution && (
            <div style={{ fontSize: '0.875rem', color: '#1e293b', marginTop: '0.5rem' }}>
              <strong>Institution:</strong> {result.institution}
            </div>
          )}

          {result.certificateNumber && (
            <div style={{ fontSize: '0.875rem', color: '#1e293b', marginTop: '0.25rem' }}>
              <strong>Certificate No:</strong> {result.certificateNumber}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
