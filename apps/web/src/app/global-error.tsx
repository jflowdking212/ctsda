'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service if configured
    console.error('[CTSDA Error Boundary]', error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '3rem 1.5rem',
            maxWidth: '540px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef444420, #ef444440)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1.5rem',
            }}
          >
            ⚠️
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.9rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '999px',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Application Error
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1rem',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            An unexpected error occurred. Our team has been notified. Please try again — if the problem persists, contact our support team.
          </p>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '0.625rem',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                width: '100%',
                textAlign: 'left',
                marginBottom: '1.5rem',
                wordBreak: 'break-all',
              }}
            >
              <strong style={{ color: '#f87171' }}>Error:</strong> {error.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: 'white',
                fontWeight: 700,
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.75rem',
                backgroundColor: 'white',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '0.95rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              Go Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
