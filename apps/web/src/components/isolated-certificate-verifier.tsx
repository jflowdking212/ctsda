'use client';

import { useState } from 'react';
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
  certificateImageUrl?: string;
};

const INVALID_CERTIFICATE_RESULT: VerificationResult = {
  valid: false,
  message: 'Certificate token is wrong or could not be verified.',
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
          message: data.message || INVALID_CERTIFICATE_RESULT.message,
        });
        return;
      }

      setResult({
        valid: Boolean(data.valid),
        message: data.message || (data.valid ? 'This certificate is authentic and was issued by the Council for Training Skills and Development America.' : INVALID_CERTIFICATE_RESULT.message),
        institution: data.institution,
        certificateNumber: data.certificateNumber || cleanToken,
        recipientName: data.recipientName || 'John Doe',
        courseProgram: data.courseProgram || 'Certified Project Management Professional',
        dateIssued: data.dateIssued || 'May 15, 2024',
        expirationDate: data.expirationDate || 'May 14, 2027',
        status: data.status || 'Active',
      });
    } catch {
      setResult(INVALID_CERTIFICATE_RESULT);
    } finally {
      setLoading(false);
    }
  }

  const hasResult = result && result.valid;

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '6rem', width: '100%' }}>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: '#021a42',
          color: '#ffffff',
          padding: '5rem 2rem 10rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>
          {hasResult && (
            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#93c5fd', textAlign: 'center' }}>
              <Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</Link> &gt; Verify Certificate
            </div>
          )}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 2.8rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            {hasResult ? 'Certificate Verification Result' : 'Verify Your Certificate'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6, textAlign: 'center' }}>
            {hasResult 
              ? 'Your certificate has been successfully verified in the official CTSDA database.' 
              : 'Enter your certificate number to verify its authenticity and confirm it was issued by the Council for Training Skills and Development America.'}
          </p>
        </div>

        {/* Watermark shield */}
        <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', opacity: 0.08, pointerEvents: 'none' }}>
           <svg width="350" height="350" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M50 5 L95 20 V55 C95 85 50 115 50 115 C50 115 5 85 5 55 V20 Z" />
              <path d="M50 5 L50 115" strokeDasharray="4 4" />
              <text x="50" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor" stroke="none">CTSD</text>
              <g transform="translate(50, 25)">
                <path d="M-20 0 L-15 10 L-25 3 L-15 3 L-25 10 Z" fill="currentColor" stroke="none"/>
                <path d="M0 -5 L5 5 L-5 -2 L5 -2 L-5 5 Z" fill="currentColor" stroke="none"/>
                <path d="M20 0 L25 10 L15 3 L25 3 L15 10 Z" fill="currentColor" stroke="none"/>
              </g>
           </svg>
        </div>
      </section>

      {/* Content Area */}
      <div style={{ maxWidth: '1200px', width: '92%', margin: '-7rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 20 }}>
        
        {!hasResult ? (
          /* Search State */
          <>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
                padding: '3.5rem 3rem',
                maxWidth: '900px',
                width: '100%',
                margin: '0 auto 4rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '68px', height: '68px', backgroundColor: '#334b6b', color: 'white',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '8px solid #eff6ff',
                boxShadow: '0 4px 12px rgba(51, 75, 107, 0.15)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <circle cx="10" cy="13" r="2"></circle>
                  <line x1="11.5" y1="14.5" x2="14" y2="17"></line>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Certificate Verification
              </h2>
              <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                Enter the certificate number exactly as it appears on your official CTSDA document.
              </p>

              <form onSubmit={handleSubmit} style={{ textAlign: 'left', maxWidth: '750px', margin: '0 auto' }}>
                <label
                  htmlFor="certificate-number-input"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Certificate Number
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    id="certificate-number-input"
                    value={token}
                    onChange={(event) => setToken(event.target.value.toUpperCase())}
                    placeholder="E.G. CTSD-2024-123456"
                    disabled={loading}
                    style={{
                      flex: '1 1 300px',
                      padding: '1rem 1.25rem',
                      fontSize: '1.05rem',
                      borderRadius: '0.625rem',
                      border: '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      borderRadius: '0.625rem',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flex: '0 0 auto',
                    }}
                    onMouseOver={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseOut={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    {loading ? 'Verifying...' : 'Verify Certificate'}
                  </button>
                </div>
              </form>

              {error && <div style={{ marginTop: '1.25rem', color: '#dc2626', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}
              {result && !result.valid && (
                <div style={{ marginTop: '1.25rem', color: '#b91c1c', fontSize: '0.925rem', padding: '1rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.625rem', fontWeight: 500 }}>
                  {result.message}
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Your information is secure and will not be shared.
              </div>
            </div>

            {/* How It Works Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '900px', margin: '0 auto 4rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How It Works</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Step 1</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '220px', lineHeight: 1.5 }}>Enter your certificate number in the field above.</p>
                </div>
                
                <div style={{ color: '#cbd5e1', alignSelf: 'center', display: 'flex' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Step 2</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '220px', lineHeight: 1.5 }}>Our system will verify the certificate in our secure database.</p>
                </div>

                <div style={{ color: '#cbd5e1', alignSelf: 'center', display: 'flex' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Step 3</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '220px', lineHeight: 1.5 }}>Instantly view your verification result and certificate details.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Results State */
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
              padding: '2.5rem',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* Success Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#f0fdf4', padding: '1.5rem 2rem', borderRadius: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#4ade80', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', margin: '0 0 0.25rem 0' }}>Valid Certificate</h2>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>{result.message}</p>
              </div>
            </div>

            {/* Grid for Details and Image (Stacks on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
              {/* Left Column: Details */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  Certificate Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Certificate Number</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{result.certificateNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Accredited Institution</span>
                    <span style={{ color: '#00204a', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>{result.institution || 'The Bliss Tech Academy'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Recipient Name</span>
                    <span style={{ color: '#00204a', fontWeight: 700, fontSize: '0.9rem' }}>{result.recipientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Course / Program</span>
                    <span style={{ color: '#00204a', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{result.courseProgram}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Date Issued</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{result.dateIssued}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Expiration Date</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{result.expirationDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Certificate Status</span>
                    <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#dcfce7', padding: '0.2rem 0.75rem', borderRadius: '1rem' }}>{result.status}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Image */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '100%', minHeight: '320px', backgroundColor: '#ffffff', border: '4px solid #f8fafc', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Certificate Border Details */}
                    <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '10px', right: '10px', border: '1px solid #cbd5e1' }}></div>
                    <div style={{ position: 'absolute', top: '14px', bottom: '14px', left: '14px', right: '14px', border: '2px solid #00204a' }}></div>
                    
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '60px', backgroundColor: '#00204a', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60px', height: '60px', backgroundColor: '#00204a', clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }}></div>

                    {/* Top-Left QR Code Box */}
                    <div style={{ position: 'absolute', top: '22px', left: '22px', width: '42px', height: '42px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                        {/* QR Outer Position Detection Patterns */}
                        <rect x="2" y="2" width="6" height="6" fill="#00204a" />
                        <rect x="16" y="2" width="6" height="6" fill="#00204a" />
                        <rect x="2" y="16" width="6" height="6" fill="#00204a" />
                        {/* Inner white cutouts */}
                        <rect x="3.5" y="3.5" width="3" height="3" fill="#ffffff" />
                        <rect x="17.5" y="3.5" width="3" height="3" fill="#ffffff" />
                        <rect x="3.5" y="17.5" width="3" height="3" fill="#ffffff" />
                        {/* Inner dark center squares */}
                        <rect x="4.5" y="4.5" width="1" height="1" fill="#00204a" />
                        <rect x="18.5" y="4.5" width="1" height="1" fill="#00204a" />
                        <rect x="4.5" y="18.5" width="1" height="1" fill="#00204a" />
                        {/* QR Data Matrix Dots */}
                        <rect x="10" y="2" width="2" height="2" fill="#00204a" />
                        <rect x="10" y="6" width="2" height="2" fill="#00204a" />
                        <rect x="2" y="10" width="2" height="2" fill="#00204a" />
                        <rect x="6" y="10" width="2" height="2" fill="#00204a" />
                        <rect x="10" y="10" width="4" height="4" fill="#00204a" />
                        <rect x="16" y="10" width="2" height="2" fill="#00204a" />
                        <rect x="20" y="10" width="2" height="2" fill="#00204a" />
                        <rect x="10" y="16" width="2" height="2" fill="#00204a" />
                        <rect x="14" y="16" width="4" height="2" fill="#00204a" />
                        <rect x="20" y="16" width="2" height="4" fill="#00204a" />
                        <rect x="10" y="20" width="2" height="2" fill="#00204a" />
                        <rect x="14" y="20" width="2" height="2" fill="#00204a" />
                      </svg>
                    </div>

                    {/* Certificate Content */}
                    <div style={{ textAlign: 'center', padding: '1.5rem', zIndex: 5, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                           <img src="/images/logo-ctsda.png" alt="CTSDA Logo" style={{ height: '35px', objectFit: 'contain' }} />
                           <div style={{ fontSize: '0.55rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 800, textAlign: 'left', lineHeight: 1.2 }}>
                             Council For Training Skills &<br/>Development America
                           </div>
                        </div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginBottom: '0.5rem' }}>This is to certify that</div>
                        
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', display: 'inline-block' }}>{result.recipientName}</div>
                        
                        <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>has successfully completed the training program:</div>
                        
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0f172a', padding: '0 1rem' }}>{result.courseProgram}</div>
                        </div>
                        
                        <div style={{ fontSize: '0.55rem', color: '#64748b', marginBottom: '1rem' }}>and is hereby awarded this certificate.</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', padding: '0 0.5rem' }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.45rem', color: '#64748b', fontWeight: 600 }}>Certificate No: <span style={{ color: '#0f172a' }}>{result.certificateNumber}</span></div>
                            <div style={{ fontSize: '0.45rem', color: '#64748b', fontWeight: 600 }}>Issued on: <span style={{ color: '#0f172a' }}>{result.dateIssued}</span></div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ borderBottom: '1px solid #0f172a', width: '90px', marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '1rem', color: '#1e293b', lineHeight: 1 }}>James H.</span>
                            </div>
                            <div style={{ fontSize: '0.45rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Director of Training</div>
                          </div>
                        </div>
                    </div>
                    
                    {/* Gold Seal */}
                    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>
                       <div style={{ width: '25px', height: '25px', borderRadius: '50%', border: '1px dashed #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.35rem', color: '#fff', fontWeight: 'bold' }}>CTSD</span>
                       </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem 2rem', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>i</span>
              </div>
              <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.95rem' }}>
                This verification confirms that the certificate above is valid and was issued by the Council for Training Skills and Development America.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => { setResult(null); setToken(''); }}
                style={{
                  padding: '0.75rem 1.5rem', backgroundColor: '#f1f5f9', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                Verify Another Certificate
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '0.75rem 1.5rem', backgroundColor: '#00204a', color: '#ffffff',
                  border: '1px solid #00204a', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#001533'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00204a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download / Print
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
