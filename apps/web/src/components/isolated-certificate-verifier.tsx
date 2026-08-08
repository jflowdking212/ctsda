'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type VerificationResult = {
  valid?: boolean;
  message?: string;
  institution?: string;
  certificateNumber?: string;
  recipientName?: string;
  courseProgram?: string;
  dateIssued?: string;
  expirationDate?: string;
  status?: string;
  standard?: string;
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
        setResult({
          valid: false,
          message: data.message || 'Certificate number is invalid or could not be verified.',
        });
        return;
      }

      setResult({
        valid: Boolean(data.valid),
        message: data.message || 'This certificate is authentic and issued by the Council for Training Skills and Development America.',
        institution: data.institution || data.recipientName || 'ABC Training Institute',
        certificateNumber: data.certificateNumber || cleanToken,
        recipientName: data.recipientName || data.institution || 'ABC Training Institute',
        courseProgram: data.courseProgram || 'CTSD Quality Standards for Training Providers',
        standard: data.courseProgram || 'CTSD Quality Standards for Training Providers',
        dateIssued: (data.issueDate || data.dateIssued) 
          ? new Date(data.issueDate || data.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
          : 'May 15, 2024',
        expirationDate: (data.expiryDate || data.expirationDate) 
          ? new Date(data.expiryDate || data.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
          : undefined,
        status: data.status || 'Active',
      });
    } catch {
      setResult({
        valid: false,
        message: 'Certificate number is invalid or could not be verified.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', width: '100%' }}>
      {/* Dark Navy Hero Section */}
      <section
        style={{
          backgroundColor: '#00204a',
          color: '#ffffff',
          padding: '4.5rem 2rem 6.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '850px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            Verify Accreditation Certificate
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6, textAlign: 'center' }}>
            Enter the certificate number below to verify the authenticity of an accreditation certificate issued by the Council for Training Skills and Development America.
          </p>
        </div>

        {/* Decorative Watermark Document Icon Left */}
        <div style={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)', opacity: 0.08, pointerEvents: 'none' }}>
          <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="12" cy="14" r="3" />
            <path d="M12 11v6" />
          </svg>
        </div>

        {/* Decorative CTSD Watermark Shield Right */}
        <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', opacity: 0.08, pointerEvents: 'none' }}>
          <svg width="240" height="240" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M50 5 L95 20 V55 C95 85 50 115 50 115 C50 115 5 85 5 55 V20 Z" />
            <text x="50" y="65" textAnchor="middle" fontSize="22" fontWeight="bold" fill="currentColor" stroke="none">CTSD</text>
          </svg>
        </div>
      </section>

      {/* Main Content Area (Two Columns Layout) */}
      <div style={{ maxWidth: '1240px', width: '94%', margin: '-4rem auto 0', position: 'relative', zIndex: 20, boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: result && result.valid ? '340px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Search Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
              padding: '2.25rem 2rem',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              Verify Certificate
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Please enter the certificate number exactly as it appears on the certificate.
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <label
                htmlFor="main-cert-input"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}
              >
                Certificate Number
              </label>

              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }}>
                  👤
                </span>
                <input
                  id="main-cert-input"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="e.g. CTSD-ACC-2024-00125"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '0.625rem',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  backgroundColor: '#00204a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 32, 74, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                {loading ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Verify Certificate
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: '#cbd5e1' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
                <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>OR</span>
                <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              </div>

              <button
                type="button"
                onClick={() => alert('Point your device camera at the QR code on the physical certificate to auto-verify.')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '0.625rem',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.75rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Scan QR Code
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem' }}>
                <span>🔒</span> Your information is secure and will not be shared.
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Verification Result Area */}
          {result && result.valid && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Green Success Banner */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '1rem',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  boxShadow: '0 4px 12px rgba(22, 101, 52, 0.05)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                    This Certificate is Valid
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#15803d', fontSize: '0.875rem' }}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Result Grid: Left Details + Right Graphic Certificate Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {/* Certificate Details List */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                    Certificate Details
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Certificate Number</span>
                      <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>{result.certificateNumber}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Organization Name</span>
                      <span style={{ color: '#00204a', fontWeight: 800, fontSize: '0.875rem', textAlign: 'right' }}>{result.institution}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Accreditation Standard</span>
                      <span style={{ color: '#334155', fontWeight: 700, fontSize: '0.85rem', textAlign: 'right', maxWidth: '55%' }}>{result.standard}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Accreditation Date</span>
                      <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.85rem' }}>{result.dateIssued}</span>
                    </div>

                    {result.expirationDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Expiration Date</span>
                        <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.85rem' }}>{result.expirationDate}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Certificate Status</span>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {result.status}
                      </span>
                    </div>
                  </div>

                  {/* Info Alert Box */}
                  <div style={{ backgroundColor: '#eff6ff', borderRadius: '0.5rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                      i
                    </div>
                    <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.8125rem', lineHeight: 1.45 }}>
                      This verification confirms that the above organization is accredited by the Council for Training Skills and Development America.
                    </p>
                  </div>
                </div>

                {/* Right Sub-column: Institutional Certificate Mockup Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #f1f5f9' }}>
                  <div
                    style={{
                      width: '100%',
                      minHeight: '280px',
                      backgroundColor: '#ffffff',
                      border: '4px solid #ffffff',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Dark Navy Corner Accents */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '45px', height: '45px', backgroundColor: '#00204a', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '45px', height: '45px', backgroundColor: '#00204a', clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '45px', height: '45px', backgroundColor: '#00204a', clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '45px', height: '45px', backgroundColor: '#00204a', clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />

                    {/* Gold & Navy Inner Border Lines */}
                    <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '10px', right: '10px', border: '1px solid #d97706' }} />
                    <div style={{ position: 'absolute', top: '14px', bottom: '14px', left: '14px', right: '14px', border: '2px solid #00204a' }} />

                    {/* Certificate Content Body */}
                    <div style={{ textAlign: 'center', padding: '1.25rem', zIndex: 5, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <img src="/images/logo-ctsda.png" alt="CTSDA Logo" style={{ height: '30px', objectFit: 'contain' }} />
                        <div style={{ fontSize: '0.475rem', color: '#00204a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800, textAlign: 'left', lineHeight: 1.25 }}>
                          COUNCIL FOR TRAINING<br />SKILLS AND DEVELOPMENT AMERICA
                        </div>
                      </div>

                      <div style={{ margin: '0.5rem 0' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#00204a', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.2rem 0' }}>
                          CERTIFICATE OF ACCREDITATION
                        </h4>
                        <div style={{ fontSize: '0.475rem', color: '#64748b' }}>This is to certify that</div>
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#00204a', margin: '0.25rem 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', display: 'inline-block' }}>
                        {result.institution}
                      </div>

                      <div style={{ fontSize: '0.475rem', color: '#475569', maxWidth: '85%', margin: '0.2rem auto', lineHeight: 1.4 }}>
                        has met the required standards and is hereby accredited by the Council for Training Skills and Development America.
                      </div>

                      {/* Footer Signatures & Certificate Details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.75rem', padding: '0 0.5rem' }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.425rem', color: '#00204a', fontWeight: 800 }}>{result.certificateNumber}</div>
                          <div style={{ fontSize: '0.375rem', color: '#64748b' }}>Certificate Number</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ borderBottom: '1px solid #00204a', width: '75px', marginBottom: '0.15rem', display: 'flex', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '0.85rem', color: '#00204a', lineHeight: 1 }}>John H. W.</span>
                          </div>
                          <div style={{ fontSize: '0.375rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Director of Accreditation</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.425rem', color: '#00204a', fontWeight: 800 }}>{result.dateIssued}</div>
                          <div style={{ fontSize: '0.375rem', color: '#64748b' }}>Date Issued</div>
                        </div>
                      </div>
                    </div>

                    {/* Gold Stamp Seal Badge */}
                    <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)', zIndex: 10 }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px dashed #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.3rem', color: '#ffffff', fontWeight: 'bold' }}>CTSD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invalid Result State */}
          {result && !result.valid && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #fecaca',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fef2f2', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #fca5a5' }}>
                <span style={{ fontSize: '1.75rem' }}>❌</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>Certificate Verification Failed</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#b91c1c', fontSize: '0.875rem' }}>{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FEATURE CARDS GRID (4 Columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.5rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Official Verification</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Real-time verification from our secure database.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Secure & Reliable</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your verification is protected with industry-standard security.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Trusted Accreditation</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Issued by the Council for Training Skills and Development America.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Globally Recognized</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Our accreditation is recognized worldwide.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
