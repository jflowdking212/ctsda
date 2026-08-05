import Link from 'next/link';
import type { ReactNode } from 'react';

export function PremiumHeader() {
  return (
    <header className="site-header">
      <div className="container flex items-center justify-between gap-6">
        <Link className="brand-mark" href="/" aria-label="CTSDA home">
          <img className="brand-logo" src="/images/logo-ctsda.png" alt="" />
          <span className="brand-text">
            <strong>CTSDA</strong>
            <small>Council For Training Skills & Development America</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/accreditation-info">Accreditation</Link>
          <Link href="/directory">Directory</Link>
          <Link href="/verify">Verify</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="header-action" href="/apply">
          Apply Now
        </Link>
      </div>
    </header>
  );
}

export function PremiumFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link className="brand-mark footer-brand" href="/">
              <img className="brand-logo" src="/images/logo-ctsda.png" alt="CTSDA Logo" />
              <span className="brand-text">
                <strong>CTSDA</strong>
                <small>Global standards in education excellence</small>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-slate-600">
              Independent accreditation services for institutions, trainers, and educational service
              providers committed to quality, transparency, and continuous improvement.
            </p>
          </div>
          
          <div className="footer-column">
            <h2>Explore</h2>
            <Link href="/services">Services</Link>
            <Link href="/directory">Accredited directory</Link>
            <Link href="/verify">Certificate verification</Link>
            <Link href="/portal/login" style={{ color: '#2563eb', fontWeight: 600 }}>Accredited Institution Portal ↗</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
          
          <div className="footer-column">
            <h2>Contact</h2>
            <div className="footer-contact-item">
              <span className="footer-icon-badge">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <span>management@ctsdamerica.com</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-icon-badge">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span>The Green, STE A, Dover, Kent, Delaware, United States</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-icon-badge">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span>Mon - Fri, 9:00 - 17:00</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>&copy; {new Date().getFullYear()} CTSDA. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/portal/login" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
              Institution Portal Login ↗
            </Link>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span>Private, independent international accreditation body.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PremiumPage({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <PremiumHeader />
      {children}
      <PremiumFooter />
    </div>
  );
}
