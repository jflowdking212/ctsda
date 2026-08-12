'use client';

import React, { useState } from 'react';

type VerificationResult = {
  valid?: boolean;
  message?: string;
  recipientName?: string;
  courseProgram?: string;
  institution?: string;
  certificateNumber?: string;
  grade?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
};

export function StudentVerificationWidget() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Please enter a certificate number or verification token.');
      setResult(null);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/verify/${encodeURIComponent(cleanToken)}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setResult({
          valid: false,
          message: data.message || 'Certificate number could not be found or verified.',
        });
      } else {
        setResult({
          valid: Boolean(data.valid),
          message: data.message || 'This certificate is authentic and was issued by the Council for Training Skills and Development America.',
          recipientName: data.recipientName || data.institution || 'Graduate / Recipient',
          courseProgram: data.courseProgram || 'Professional Training Program',
          institution: data.institution || 'CTSDA Accredited Partner',
          certificateNumber: data.certificateNumber || cleanToken,
          grade: data.grade,
          issueDate: data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Official Issue Date',
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
          status: data.status || (data.valid ? 'active' : 'invalid'),
        });
      }
    } catch {
      setResult({
        valid: false,
        message: 'Unable to connect to verification server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginBottom: '3.5rem',
        padding: '3rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.35rem 1rem',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
            border: '1px solid #bfdbfe',
          }}
        >
          🎓 Graduate & Student Verification
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Verify Student & Course Certificates
        </h2>
        <p
          style={{
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Enter a student certificate number or verification code below to verify course completion, student identity, and official accreditation status.
        </p>

        {/* Verification Search Form */}
        <form
          onSubmit={handleVerify}
          style={{
            display: 'flex',
            gap: '0.75rem',
            maxWidth: '600px',
            margin: '0 auto 1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. STU-2026-0001 or Certificate Code..."
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                fontSize: '0.95rem',
                borderRadius: '0.75rem',
                border: error ? '2px solid #ef4444' : '1px solid #cbd5e1',
                outline: 'none',
                backgroundColor: '#f8fafc',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.875rem 1.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              whiteSpace: 'nowrap',
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
        </form>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            {error}
          </p>
        )}

        {/* Failed Verification Result */}
        {result && !result.valid && (
          <div
            style={{
              maxWidth: '680px',
              margin: '2rem auto 0',
              textAlign: 'left',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>❌</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#991b1b' }}>
                  Certificate Verification Failed
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: '0.25rem 0 0 0' }}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Valid Certificate Display (Matching /verify design) */}
        {result && result.valid && (
          <div
            style={{
              marginTop: '2.5rem',
              textAlign: 'left',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
              padding: '2rem',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* Success Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#f0fdf4', padding: '1.25rem 1.75rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#4ade80', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: '0 0 0.2rem 0' }}>Valid & Authentic Certificate</h3>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>{result.message}</p>
              </div>
            </div>

            {/* Container for Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
              {/* Left Column: Details */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  Certificate Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Certificate Number</span>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>{result.certificateNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Accredited Institution</span>
                    <span style={{ color: '#00204a', fontWeight: 700, fontSize: '0.875rem', textAlign: 'right' }}>{result.institution}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Recipient Name</span>
                    <span style={{ color: '#00204a', fontWeight: 800, fontSize: '0.9rem' }}>{result.recipientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Course / Program</span>
                    <span style={{ color: '#00204a', fontWeight: 700, fontSize: '0.875rem', textAlign: 'right', maxWidth: '60%' }}>{result.courseProgram}</span>
                  </div>
                  {result.grade && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Grade / Honors</span>
                      <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.875rem' }}>{result.grade}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Date Issued</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{result.issueDate}</span>
                  </div>
                  {result.expiryDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Expiration Date</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{result.expiryDate}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>Certificate Status</span>
                    <span style={{ color: '#166534', fontWeight: 800, fontSize: '0.75rem', backgroundColor: '#dcfce7', padding: '0.2rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase' }}>{result.status}</span>
                  </div>
                </div>
              </div>

              {/* Right Column removed as requested - visual certificate mockup card is inappropriate here as each institution issues its own */}
            </div>

            {/* Info Banner */}
            <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem 1.5rem', borderRadius: '0.5rem', display: 'flex', gap: '0.875rem', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>i</span>
              </div>
              <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem' }}>
                This verification confirms that the certificate above is valid and was issued by the Council for Training Skills and Development America.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setResult(null); setToken(''); }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🔄 Verify Another Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
