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
    <main style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', width: '100%' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        backgroundColor: '#00204a',
        color: '#ffffff',
        padding: '4.5rem 1.5rem 6rem',
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
      <div style={{ maxWidth: '1220px', width: '94%', margin: '-3.75rem auto 5rem', position: 'relative', zIndex: 20, boxSizing: 'border-box' }}>

        {/* Row: Search Form (fixed left) + Result (flexible right) */}
        <div style={{
          display: 'flex',
          gap: '1.75rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>

          {/* ── LEFT: Search Card (fixed 340px) ── */}
          <div style={{
            flex: '0 0 30%',
            minWidth: '300px',
            maxWidth: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '0.875rem',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
            padding: '2rem 1.75rem',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box',
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Verify Certificate
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1.75rem', marginTop: 0 }}>
              Please enter the certificate number exactly as it appears on the certificate.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="cert-input"
                style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                Certificate Number
              </label>

              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', lineHeight: 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
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
                    padding: '0.8rem 0.9rem 0.8rem 2.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    fontWeight: 500,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                />
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  backgroundColor: '#00204a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,32,74,0.22)',
                  marginBottom: '1rem',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              <button
                type="button"
                onClick={() => alert('Point your camera at the QR code on the certificate to auto-verify.')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  border: '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                Scan QR Code
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.775rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Your information is secure and will not be shared.
              </div>
            </form>
          </div>

          {/* ── RIGHT: Result Area (grows to fill remaining space) ── */}
          <div style={{ flex: '1 1 400px', minWidth: '300px', boxSizing: 'border-box' }}>

            {/* Empty state hint */}
            {!result && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.875rem',
                border: '1px solid #e2e8f0',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px -8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#2563eb' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <circle cx="10" cy="14" r="2"/><line x1="11.5" y1="15.5" x2="14" y2="18"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
                  Enter a Certificate Number
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  Type the certificate number on the left and click "Verify Certificate" to confirm its authenticity.
                </p>
              </div>
            )}

            {/* Invalid Result */}
            {result && !result.valid && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '0.875rem', border: '1px solid #fecaca', padding: '1.75rem', boxShadow: '0 10px 30px -8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fef2f2', padding: '1.25rem', borderRadius: '0.625rem', border: '1px solid #fca5a5' }}>
                  <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>❌</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>Certificate Verification Failed</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#b91c1c', fontSize: '0.875rem' }}>{result.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Valid Result */}
            {hasValidResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Green Valid Banner */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', padding: '1.15rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 12px rgba(22,101,52,0.06)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 900 }}>✓</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', margin: 0 }}>This Certificate is Valid</h3>
                    <p style={{ margin: '0.15rem 0 0 0', color: '#15803d', fontSize: '0.85rem' }}>{result.message}</p>
                  </div>
                </div>

                {/* Details + Certificate Graphic Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '0.875rem', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 10px 30px -8px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>

                  {/* Left sub-col: Details */}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.1rem', marginTop: 0 }}>Certificate Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { label: 'Certificate Number', value: result.certificateNumber, highlight: true },
                        { label: 'Organization Name', value: result.institution, bold: true },
                        { label: 'Accreditation Standard', value: result.standard },
                        { label: 'Accreditation Date', value: result.dateIssued },
                        ...(result.expirationDate ? [{ label: 'Expiration Date', value: result.expirationDate }] : []),
                      ].map(({ label, value, highlight, bold }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', gap: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                          <span style={{ color: highlight ? '#2563eb' : bold ? '#00204a' : '#334155', fontWeight: highlight ? 700 : bold ? 800 : 600, fontSize: '0.825rem', textAlign: 'right' }}>{value}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.1rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.825rem', fontWeight: 500 }}>Certificate Status</span>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.15rem 0.7rem', borderRadius: '999px', fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase' }}>{result.status}</span>
                      </div>
                    </div>

                    {/* Info box */}
                    <div style={{ backgroundColor: '#eff6ff', borderRadius: '0.5rem', padding: '0.75rem 0.9rem', display: 'flex', gap: '0.65rem', alignItems: 'flex-start', marginTop: '1.25rem' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0, marginTop: '1px' }}>i</div>
                      <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.78rem', lineHeight: 1.5 }}>
                        This verification confirms that the above organization is accredited by the Council for Training Skills and Development America.
                      </p>
                    </div>
                  </div>

                  {/* Right sub-col: Institutional Certificate Mockup */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '0.625rem', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '100%', minHeight: '270px', backgroundColor: '#ffffff', borderRadius: '3px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>

                      {/* Corner Triangles */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '42px', height: '42px', backgroundColor: '#00204a', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                      <div style={{ position: 'absolute', top: 0, right: 0, width: '42px', height: '42px', backgroundColor: '#00204a', clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '42px', height: '42px', backgroundColor: '#00204a', clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '42px', height: '42px', backgroundColor: '#00204a', clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />

                      {/* Gold + Navy Border Lines */}
                      <div style={{ position: 'absolute', top: '9px', bottom: '9px', left: '9px', right: '9px', border: '1px solid #d97706' }} />
                      <div style={{ position: 'absolute', top: '13px', bottom: '13px', left: '13px', right: '13px', border: '2px solid #00204a' }} />

                      {/* Certificate Body */}
                      <div style={{ position: 'relative', zIndex: 5, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', textAlign: 'center' }}>

                        {/* Logo + Name Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <img src="/images/logo-ctsda.png" alt="CTSDA Logo" style={{ height: '28px', objectFit: 'contain' }} />
                          <div style={{ fontSize: '0.46rem', color: '#00204a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.2, textAlign: 'left' }}>
                            COUNCIL FOR TRAINING<br />SKILLS AND DEVELOPMENT AMERICA
                          </div>
                        </div>

                        {/* Title */}
                        <div style={{ margin: '0.6rem 0 0.2rem' }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 900, color: '#00204a', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            CERTIFICATE OF ACCREDITATION
                          </div>
                          <div style={{ fontSize: '0.46rem', color: '#64748b', marginTop: '0.2rem' }}>This is to certify that</div>
                        </div>

                        {/* Org Name */}
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#00204a', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', margin: '0.2rem auto', display: 'inline-block' }}>
                          {result.institution}
                        </div>

                        {/* Body text */}
                        <p style={{ fontSize: '0.46rem', color: '#475569', lineHeight: 1.5, maxWidth: '85%', margin: '0.2rem auto 0.6rem' }}>
                          has met the required standards and is hereby accredited by the Council for Training Skills and Development America.
                        </p>

                        {/* Footer row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.25rem' }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.42rem', color: '#00204a', fontWeight: 800 }}>{result.certificateNumber}</div>
                            <div style={{ fontSize: '0.38rem', color: '#64748b' }}>Certificate Number</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ borderBottom: '1px solid #00204a', width: '70px', display: 'flex', justifyContent: 'center', paddingBottom: '1px' }}>
                              <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '0.8rem', color: '#00204a', lineHeight: 1 }}>John H. W.</span>
                            </div>
                            <div style={{ fontSize: '0.37rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '1px' }}>Director of Accreditation</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.42rem', color: '#00204a', fontWeight: 800 }}>{result.dateIssued}</div>
                            <div style={{ fontSize: '0.38rem', color: '#64748b' }}>Date Issued</div>
                          </div>
                        </div>
                      </div>

                      {/* Gold Seal */}
                      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(217,119,6,0.4)', zIndex: 10 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px dashed #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.28rem', color: '#fff', fontWeight: 'bold' }}>CTSD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
