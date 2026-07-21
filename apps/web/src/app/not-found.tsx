import Link from 'next/link';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';

export default function NotFound() {
  return (
    <>
      <PremiumHeader />
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        {/* Decorative number */}
        <div
          style={{
            fontSize: 'clamp(6rem, 20vw, 12rem)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            userSelect: 'none',
            marginBottom: '1.5rem',
          }}
        >
          404
        </div>

        {/* CTSDA Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            backgroundColor: '#0ea5e920',
            border: '1px solid #0ea5e940',
            borderRadius: '999px',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Page Not Found
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '1rem',
            maxWidth: '600px',
          }}
        >
          This page doesn&apos;t exist or has been moved
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: '#64748b',
            marginBottom: '2.5rem',
            maxWidth: '500px',
            lineHeight: 1.7,
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.75rem',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white',
              fontWeight: 700,
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/contact"
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
            Contact Support
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', width: '100%', maxWidth: '500px' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { href: '/services', label: 'Services' },
              { href: '/training', label: 'Training' },
              { href: '/blog', label: 'Blog' },
              { href: '/directory', label: 'Directory' },
              { href: '/portal', label: 'My Portal' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  );
}
