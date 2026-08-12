'use client';

import React, { useState } from 'react';

type VerificationResult = {
  valid?: boolean;
  message?: string;
  institution?: string;
  certificateNumber?: string;
  standard?: string;
  dateIssued?: string;
  expirationDate?: string;
  status?: string;
};

export function IsolatedCertificateVerifier({
  initialToken = '',
}: {
  initialToken?: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event?: React.FormEvent) {
    if (event) event.preventDefault();
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
        setResult({ valid: false, message: data.message || 'Certificate number is invalid or could not be verified.' });
        return;
      }

      setResult({
        valid: Boolean(data.valid),
        message: data.message || 'This certificate is authentic and issued by the Council for Training Skills and Development America.',
        institution: data.institution || data.recipientName || 'ABC Training Institute',
        certificateNumber: data.certificateNumber || cleanToken,
        standard: data.courseProgram || 'CTSD Quality Standards for Training Providers',
        dateIssued: (data.issueDate || data.dateIssued)
          ? new Date(data.issueDate || data.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : undefined,
        expirationDate: (data.expiryDate || data.expirationDate)
          ? new Date(data.expiryDate || data.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : undefined,
        status: data.status || 'Active',
      });
    } catch {
      setResult({ valid: false, message: 'Certificate number is invalid or could not be verified.' });
    } finally {
      setLoading(false);
    }
  }

  const hasValidResult = result?.valid === true;

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', paddingBottom: '5rem' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        backgroundColor: '#00204a',
        color: '#ffffff',
        padding: '4.5rem 1.5rem 6.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Watermark icons */}
        <div style={{ position: 'absolute', top: '50%', left: '4%', transform: 'translateY(-50%)', opacity: 0.07, pointerEvents: 'none' }}>
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="12" cy="14" r="3" />
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '50%', right: '4%', transform: 'translateY(-50%)', opacity: 0.07, pointerEvents: 'none' }}>
          <svg width="220" height="220" viewBox="0 0 100 120" fill="none" stroke="white" strokeWidth="2">
            <path d="M50 5 L95 20 V55 C95 85 50 115 50 115 C50 115 5 85 5 55 V20 Z" />
            <text x="50" y="68" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" stroke="none">CTSD</text>
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 800, marginBottom: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Verify Accreditation Certificate
          </h1>
          <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
            Enter the certificate number below to verify the authenticity of an accreditation certificate issued by the Council for Training Skills and Development America.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div style={{ maxWidth: '1220px', width: '94%', margin: '-4rem auto 0', position: 'relative', zIndex: 20, boxSizing: 'border-box' }}>

        {!hasValidResult ? (
          /* INITIAL SEARCH STATE: Centered Search Card */
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
                padding: '2.5rem 3rem',
                border: '1px solid #e2e8f0',
                boxSizing: 'border-box',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                Verify Certificate
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '2rem', marginTop: 0 }}>
                Please enter the certificate number exactly as it appears on the certificate to confirm its authenticity.
              </p>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="cert-input"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  Certificate Number
                </label>

                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', lineHeight: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input
                    id="cert-input"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. CTSD-ACC-2024-00125"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.75rem',
                      fontSize: '0.95rem',
                      borderRadius: '0.625rem',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      fontWeight: 600,
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {error && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>
                    {error}
                  </p>
                )}

                {result && !result.valid && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.625rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>❌</span>
                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.875rem', fontWeight: 600 }}>{result.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.25rem',
                    backgroundColor: '#00204a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0,32,74,0.25)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Point your camera at the QR code on the certificate to auto-verify.')}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1.25rem',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderRadius: '0.625rem',
                    border: '1.5px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Scan QR Code
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Your information is secure and will not be shared.
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* VERIFIED STATE: Search Card is hidden completely! Render full-width Valid Certificate Result */
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Green Valid Banner */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 12px rgba(22,101,52,0.06)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', fontWeight: 900 }}>✓</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', margin: 0 }}>This Certificate is Valid</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#15803d', fontSize: '0.875rem' }}>{result.message}</p>
                </div>
              </div>

              {/* Details + Certificate Graphic Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '0.875rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 10px 30px -8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Left sub-col: Details */}
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', marginTop: 0 }}>Certificate Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[
                      { label: 'Certificate Number', value: result.certificateNumber, highlight: true },
                      { label: 'Organization Name', value: result.institution, bold: true },
                      { label: 'Accreditation Standard', value: result.standard },
                      { label: 'Accreditation Date', value: result.dateIssued },
                      ...(result.expirationDate ? [{ label: 'Expiration Date', value: result.expirationDate }] : []),
                    ].map(({ label, value, highlight, bold }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                        <span style={{ color: highlight ? '#2563eb' : bold ? '#00204a' : '#334155', fontWeight: highlight ? 700 : bold ? 800 : 600, fontSize: '0.85rem', textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.1rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Certificate Status</span>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{result.status}</span>
                    </div>
                  </div>

                  {/* Info box */}
                  <div style={{ backgroundColor: '#eff6ff', borderRadius: '0.5rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '1.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0, marginTop: '1px' }}>i</div>
                    <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                      This verification confirms that the above organization is accredited by the Council for Training Skills and Development America.
                    </p>
                  </div>
                </div>

                {/* Right sub-col removed: visual certificate mockup card is inappropriate here as each institution issues its own */}
              </div>

              {/* Action Buttons for Reset and Print */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setResult(null); setToken(''); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  🔄 Verify Another Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM FEATURE CARDS ────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '3.5rem' }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Official Verification', text: 'Real-time verification from our secure database.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Secure & Reliable', text: 'Your verification is protected with industry-standard security.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: 'Trusted Accreditation', text: 'Issued by the Council for Training Skills and Development America.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: 'Globally Recognized', text: 'Our accreditation is recognized worldwide.' },
          ].map(({ icon, title, text }) => (
            <div key={title} style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                {icon}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem 0' }}>{title}</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
