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
          message: data.message,
          recipientName: data.recipientName || data.institution || 'Graduate / Recipient',
          courseProgram: data.courseProgram || 'Professional Training Program',
          institution: data.institution || 'CTSDA Accredited Partner',
          certificateNumber: data.certificateNumber || cleanToken,
          grade: data.grade,
          issueDate: data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
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
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
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

        {/* Verification Form */}
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
                transition: 'border-color 0.2s',
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
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                </svg>
                Verifying...
              </>
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

        {/* Result Output Card */}
        {result && (
          <div
            style={{
              maxWidth: '680px',
              margin: '2rem auto 0',
              textAlign: 'left',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: result.valid ? '1px solid #bbf7d0' : '1px solid #fecaca',
              backgroundColor: result.valid ? '#f0fdf4' : '#fef2f2',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Result Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: result.valid ? '#166534' : '#991b1b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{result.valid ? '✅' : '❌'}</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {result.valid ? 'Authentic & Verified Certificate' : 'Certificate Verification Failed'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: result.valid ? '#bbf7d0' : '#fecaca', margin: '0.15rem 0 0 0' }}>
                    {result.message}
                  </p>
                </div>
              </div>

              {result.status && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    backgroundColor: result.valid ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    letterSpacing: '0.05em',
                  }}
                >
                  {result.status}
                </span>
              )}
            </div>

            {/* Result Details Grid */}
            {result.valid && (
              <div style={{ padding: '1.75rem 1.5rem', backgroundColor: '#ffffff' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Student Name (Recipient)
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                      {result.recipientName}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Course / Program
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                      {result.courseProgram}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Institution
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>
                      {result.institution}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                      Certificate Number
                    </span>
                    <code style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 800, backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {result.certificateNumber}
                    </code>
                  </div>

                  {result.grade && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                        Grade / Distinction
                      </span>
                      <span style={{ fontSize: '0.95rem', color: '#16a34a', fontWeight: 700 }}>
                        {result.grade}
                      </span>
                    </div>
                  )}

                  {result.issueDate && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                        Date Issued
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                        {result.issueDate}
                      </span>
                    </div>
                  )}

                  {result.expiryDate && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                        Expiry Date
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                        {result.expiryDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
