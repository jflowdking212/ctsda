'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  useEffect(() => {
    // Notify Google Tag / gtag of the successful conversion on this Thank You page
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      try {
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-18417273510',
          event_category: 'registration',
          event_label: 'accreditation_application_submitted',
        });
      } catch (err) {
        console.error('Failed to report conversion event to gtag', err);
      }
    }
  }, []);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top green accent strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          }}
        />

        {/* Success check badge */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            marginBottom: '1.5rem',
            border: '2px solid #a7f3d0',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.15)',
          }}
        >
          ✓
        </div>

        <p
          style={{
            color: '#059669',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            margin: '0 0 0.5rem 0',
          }}
        >
          Registration Complete
        </p>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.35rem)',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 1rem 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Thank You for Applying!
        </h1>

        <p
          style={{
            maxWidth: '580px',
            margin: '0 auto 2rem auto',
            color: '#475569',
            fontSize: '1.05rem',
            lineHeight: 1.6,
          }}
        >
          Your official application for <strong>CTSDA Accreditation</strong> has been successfully received
          and recorded. {email ? (
            <>
              A confirmation summary has been sent to <strong>{email}</strong>.
            </>
          ) : (
            'A confirmation summary has been sent to your registered email address.'
          )}
        </p>

        {/* Next steps timeline box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.875rem',
            padding: '1.75rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📋</span> What Happens Next?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                1
              </span>
              <div>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>Board Readiness Review:</strong>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.45 }}>
                  Our professional evaluation committee will review your institutional profile, curriculum scope, and documentation.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                2
              </span>
              <div>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>Quality Assurance Audit:</strong>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.45 }}>
                  CTSDA assessors evaluate governance, instructional rigor, and verification compliance.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                3
              </span>
              <div>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>Accreditation Decision:</strong>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.45 }}>
                  You will be notified via email of the outcome, next steps for fee clearance, and public registry listing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support enquiry notice */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            💬 <strong>Questions about your application?</strong><br />
            Our administration and support desk is available to assist your institution at any stage of the review:
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', fontWeight: 700 }}>
            ✉️{' '}
            <a href="mailto:management@ctsdamerica.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              management@ctsdamerica.com
            </a>
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '0.625rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'background-color 0.2s',
            }}
          >
            Return to Homepage
          </button>

          <Link
            href="/directory"
            style={{
              padding: '0.875rem 1.75rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 700,
              borderRadius: '0.625rem',
              border: '1px solid #cbd5e1',
              textDecoration: 'none',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Browse Accredited Directory ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ApplyThankYouPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />
      <main
        className="section-inner"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '3.5rem',
          paddingBottom: '5rem',
        }}
      >
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Loading confirmation...</div>}>
          <ThankYouContent />
        </Suspense>
      </main>
      <PremiumFooter />
    </div>
  );
}
