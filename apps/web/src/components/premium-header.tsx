'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

const navItems = [
  { href: '/about', label: 'About' },
  {
    label: 'Services & Accreditation',
    children: [
      { href: '/services', label: 'Our Services' },
      { href: '/accreditation-info', label: 'Accreditation Info' },
    ],
  },
  {
    label: 'Directory & Verify',
    children: [
      { href: '/directory', label: 'Directory' },
      { href: '/verify', label: 'Verify Certificate' },
    ],
  },
  { href: '/training', label: 'Training' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function PremiumHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <header
      className={`premium-site-header ${isScrolled ? 'scrolled' : ''}`}
      data-menu-open={isMobileMenuOpen}
    >
      <div className="container premium-header-shell">
        <Link className="brand-mark" href="/" aria-label="CTSDA home" onClick={closeMenu}>
          <img className="brand-logo" src="/images/logo-ctsda.png" alt="" loading="eager" />
          <span className="brand-text">
            <strong>CTSDA</strong>
            <small>Council for Training, Skills &amp; Development America</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="site-nav-desktop" aria-label="Primary navigation">
          {navItems.map((item) => {
            if ('children' in item && item.children) {
              return (
                <div key={item.label} className="nav-dropdown-group">
                  <Link className="nav-dropdown-trigger" href={item.children[0].href}>
                    {item.label}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '0.25rem' }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <div className="nav-dropdown-menu">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} className="nav-dropdown-link">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={(item as any).href} href={(item as any).href}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <Link className="header-action" href="/portal/register">
            Apply Now
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <nav
        className={`mobile-nav-drawer ${isMobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu</span>
          <button
            className="mobile-nav-close"
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-nav-items">
          {navItems.flatMap((item, i) => {
            if ('children' in item && item.children) {
              return [
                <div key={`group-${i}`} className="mobile-nav-group-label">{item.label}</div>,
                ...item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="mobile-nav-link mobile-nav-link--child"
                    onClick={closeMenu}
                  >
                    {child.label}
                  </Link>
                )),
              ];
            }
            return [
              <Link
                key={(item as any).href}
                href={(item as any).href}
                className="mobile-nav-link"
                onClick={closeMenu}
              >
                {item.label}
              </Link>,
            ];
          })}
        </div>

        <div className="mobile-nav-footer">
          <Link
            className="mobile-nav-cta"
            href="/portal/register"
            onClick={closeMenu}
          >
            Apply Now
          </Link>
        </div>
      </nav>
    </header>
  );
}