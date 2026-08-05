'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/training', label: 'Training' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function PremiumHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="premium-site-header" style={{ position: 'relative', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container premium-header-shell">
        <Link className="brand-mark" href="/" aria-label="CTSDA home">
          <img className="brand-logo" src="/images/logo-ctsda.png" alt="CTSDA Logo" loading="eager" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} />
          <span className="brand-text">
            <strong>CTSDA</strong>
            <small>Council For Training Skills &amp; Development America</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="site-nav-desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ color: '#334155', fontWeight: 600 }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/portal/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', padding: '0.5rem 0.85rem', border: '1px solid #bfdbfe', borderRadius: '0.5rem', backgroundColor: '#eff6ff', textDecoration: 'none' }}>
            Portal Login
          </Link>

          <Link className="header-action" href="/apply" style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700 }}>
            Apply Now
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#ffffff',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
            <Link
              href="/portal/login"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
            >
              Member Portal Login ↗
            </Link>
            <Link
              href="/apply"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                textAlign: 'center',
                padding: '0.85rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
