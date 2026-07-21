'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const ADMIN_SESSION_KEY = 'ctsda_admin_session';
const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export function PortalHeader() {
  const [loggingOut, setLoggingOut] = useState(false);
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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const auth = useAuth();

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  async function logout() {
    setLoggingOut(true);
    const headers = auth.getAuthHeaders();
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } finally {
      auth.logout();
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = '/portal/login';
    }
  }

  return (
    <header className="portal-header" data-menu-open={isMobileMenuOpen}>
      <div className="portal-header-shell">
        <Link className="portal-brand" href="/" onClick={closeMenu}>
          CTSDA Portal
        </Link>

        {/* Desktop Nav */}
        <nav className="portal-nav" aria-label="Applicant portal">
          <Link href="/portal/applications">My Applications</Link>
          <Link href="/portal/training">My Training</Link>
          <button
            className={loggingOut ? 'portal-nav-button is-loading' : 'portal-nav-button'}
            type="button"
            onClick={logout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </nav>

        <div className="portal-header-actions">
          <button
            className="portal-mobile-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close portal menu' : 'Open portal menu'}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`portal-nav-overlay ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <nav
        className={`portal-nav-drawer ${isMobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Portal navigation"
      >
        <div className="portal-drawer-header">
          <span className="portal-drawer-title">Portal Menu</span>
          <button
            className="portal-drawer-close"
            type="button"
            onClick={closeMenu}
            aria-label="Close portal menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="portal-drawer-nav">
          <Link className="portal-drawer-link" href="/portal/applications" onClick={closeMenu}>
            My Applications
          </Link>
          <Link className="portal-drawer-link" href="/portal/training" onClick={closeMenu}>
            My Training
          </Link>
        </nav>
        <div className="portal-drawer-items">
          <button
            className={`portal-drawer-link portal-drawer-logout ${loggingOut ? 'is-loading' : ''}`}
            type="button"
            onClick={logout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </nav>
    </header>
  );
}