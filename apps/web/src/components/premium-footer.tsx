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
            <small>Council for Training, Skills & Development America</small>
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
        <Link className="header-action" href="/portal/register">
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
              <img className="brand-logo" src="/images/logo-ctsda.png" alt="" />
              <span className="brand-text">
                <strong>CTSDA</strong>
                <small>Global standards in education excellence</small>
              </span>
            </Link>
            <p>
              Independent accreditation services for institutions, trainers, and educational service
              providers committed to quality, transparency, and continuous improvement.
            </p>
          </div>
          
          <div className="footer-column">
            <h2>Explore</h2>
            <Link href="/services">Services</Link>
            <Link href="/directory">Accredited directory</Link>
            <Link href="/verify">Certificate verification</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
          
          <div className="footer-column">
            <h2>Contact</h2>
            <p>📧 management@ctsdamerica.com</p>
            <p>📍 The Green, STE A, Dover, Kent, Delaware, United States</p>
            <p>🕒 Mon - Fri, 9:00 - 17:00</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CTSDA. All rights reserved.</span>
          <span>Private, independent international accreditation body.</span>
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
