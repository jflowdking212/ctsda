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
  compact = false,
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
      setError('Enter a certificate token to verify.');
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
        message: data.message || (data.valid ? 'Certificate verified.' : INVALID_CERTIFICATE_RESULT.message),
        institution: data.institution,
        certificateNumber: data.certificateNumber,
      });
    } catch {
      setResult(INVALID_CERTIFICATE_RESULT);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? 'certificate-verifier compact' : 'certificate-verifier'}>
      {compact ? (
        <form className="home-verify-form" onSubmit={handleSubmit}>
          <label htmlFor="home-certificate-token">Certificate token</label>
          <div className="home-verify-controls">
            <input
              id="home-certificate-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter certificate token"
              disabled={loading}
            />
            <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      ) : (
        <form className="content-panel content-form" onSubmit={handleSubmit}>
          <label htmlFor="certificate-token">
            Certificate token
            <input
              id="certificate-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter certificate token"
              disabled={loading}
            />
          </label>
          <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify certificate'}
          </button>
        </form>
      )}

      {error && <p className="status-message error">{error}</p>}

      {result && (
        <section className={compact ? 'verification-result' : 'content-panel'}>
          <h2>Verification result</h2>
          <p>
            <strong>Status:</strong> {result.valid ? 'Valid' : 'Invalid'}
          </p>
          {result.message && (
            <p>
              <strong>Message:</strong> {result.message}
            </p>
          )}
          {result.institution && (
            <p>
              <strong>Institution:</strong> {result.institution}
            </p>
          )}
          {result.certificateNumber && (
            <p>
              <strong>Certificate Number:</strong> {result.certificateNumber}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
