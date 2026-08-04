import Link from 'next/link';
import type { ReactNode } from 'react';
import { PremiumHeader } from './premium-header';

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/directory', label: 'Directory' },
  { href: '/training', label: 'Training' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function PublicHeader() {
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-action" href="/portal/register">
          Apply Now
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
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
        
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CTSDA. All rights reserved.</span>
          <span>Private, independent international accreditation body.</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <PremiumHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="page-hero" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff', padding: '4.75rem 0 3.5rem' }}>
      <div className="container-narrow">
        <p className="eyebrow" style={{ color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{eyebrow}</p>
        <h1 style={{ color: '#ffffff', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15, marginTop: '0.5rem', marginBottom: '1.25rem' }}>{title}</h1>
        <div className="page-hero-copy" style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.7 }}>{children}</div>
      </div>
    </section>
  );
}
