'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PORTAL_SESSION_KEY = 'ctsda_portal_session';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type PortalSection = 'overview' | 'credentials' | 'billing' | 'registration' | 'training';

export type PortalNavItem = {
  href: string;
  section: PortalSection;
  label: string;
};

const portalNav: PortalNavItem[] = [
  { href: '/portal/applications', section: 'overview', label: 'Overview' },
  { href: '/portal/credentials', section: 'credentials', label: 'Official Verification' },
  { href: '/portal/billing', section: 'billing', label: 'Billing & Invoices' },
  { href: '/portal/registration', section: 'registration', label: 'Registration Info' },
  { href: '/portal/training', section: 'training', label: 'Training Resources' },
];

const sectionMeta: Record<PortalSection, { title: string; eyebrow: string; description: string }> = {
  overview: {
    title: 'Accreditation Overview',
    eyebrow: 'Applicant Dashboard',
    description: 'Monitor your institutional accreditation status and renewal validity.',
  },
  credentials: {
    title: 'Official Verification & Credentials',
    eyebrow: 'Digital Certificates',
    description: 'Access your active accreditation certificates and verification links.',
  },
  billing: {
    title: 'Billing & Invoices',
    eyebrow: 'Financial Records',
    description: 'Review your past payments, download invoices, and manage renewals.',
  },
  registration: {
    title: 'Registration Info',
    eyebrow: 'Institution Details',
    description: 'Manage the primary details and contact information for your institution.',
  },
  training: {
    title: 'Training Resources',
    eyebrow: 'Knowledge Base',
    description: 'Access course materials, orientation videos, and downloadable resources.',
  },
};

export function PortalDashboard({ section = 'overview' }: { section?: PortalSection }) {
  const [profile, setProfile] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentSection = sectionMeta[section];

  useEffect(() => {
    async function load() {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const storedUser = window.localStorage.getItem(`${PORTAL_SESSION_KEY}_user`);
      if (storedUser) {
        try { 
          setProfile(JSON.parse(storedUser)); 
        } catch (e) { 
          setMessage(''); 
        }
      } else {
        // Not logged in -> maybe redirect to login
      }
      setCheckingSession(false);

      if (storedSession) {
        try {
          const res = await fetch(`${API_BASE}/applications/me`, {
            credentials: 'include',
            headers: {
              ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
            },
          });
          if (res.ok) {
            const data = await res.json();
            setApps(Array.isArray(data) ? data : []);
          } else if (res.status === 401) {
            // Invalid session
            window.localStorage.removeItem(PORTAL_SESSION_KEY);
            window.location.href = '/portal/login';
          }
        } catch (error) {
          console.error("Failed to fetch applications:", error);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function logout() {
    window.localStorage.removeItem(PORTAL_SESSION_KEY);
    window.localStorage.removeItem(`${PORTAL_SESSION_KEY}_user`);
    window.location.href = '/portal/login';
  }

  // --- Helper Functions from original page ---
  async function submitApplication(applicationId: string) {
    setMessage('');
    setPayingId(applicationId);
    try {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const response = await fetch(`${API_BASE}/applications/${applicationId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
        body: JSON.stringify({}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || 'Unable to submit application');
      }
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      setMessage(result.message || 'Application submitted successfully.');
      
      // Reload applications
      const res = await fetch(`${API_BASE}/applications/me`, {
        credentials: 'include',
        headers: {
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
      });
      if (res.ok) setApps(await res.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit application');
    } finally {
      setPayingId(null);
    }
  }

  async function startCheckout(applicationId: string) {
    setMessage('');
    setPayingId(applicationId);
    try {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const response = await fetch(`${API_BASE}/payments/create-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
        body: JSON.stringify({ applicationId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || 'Unable to start checkout');
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setMessage(result.message || 'Payment is already complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start checkout');
    } finally {
      setPayingId(null);
    }
  }

  function formatDate(d?: string) {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  }

  function getDaysRemaining(expiryDateStr?: string) {
    if (!expiryDateStr) return null;
    try {
      const expiry = new Date(expiryDateStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((expiry - now) / (1000 * 3600 * 24));
      return diffDays;
    } catch {
      return null;
    }
  }

  if (checkingSession) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#f0f4f8' }}>
      {/* GLOBAL TOPBAR HEADER */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        flexShrink: 0, 
        zIndex: 100, 
        height: '70px', 
        padding: '0 1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/portal/applications" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <img src="/images/logo-ctsda.png" alt="CTSDA" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }} className="admin-header-title">
              <strong style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a192f', lineHeight: 1, margin: '0 0 2px 0' }}>CTSDA</strong>
              <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, lineHeight: 1 }}>Applicant Portal</small>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <a
            className="button primary"
            href="/portal/applications/new"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Apply for New Accreditation
          </a>

          {/* PROFILE MENU */}
          {profile && (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                className="admin-avatar-trigger"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                style={{
                  background: '#e2e8f0',
                  color: '#0f172a',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0
                }}
                title="Profile menu"
              >
                {profile.firstName?.charAt(0) || 'U'}{profile.lastName?.charAt(0) || ''}
              </button>
            </div>
          )}

          <button className="admin-sidebar-toggle" style={{ margin: 0 }} type="button" onClick={() => setIsMobileNavOpen((prev) => !prev)} aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileNavOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTAINER WITH SIDEBAR & CONTENT */}
      <main className="admin-shell" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className={`admin-sidebar ${isMobileNavOpen ? 'is-open' : ''}`} style={{ 
          overflowY: 'auto',
          zIndex: 90
        }}>
          <nav className={`admin-sidebar-nav ${isMobileNavOpen ? 'is-open' : ''}`}>
            {portalNav.map((item) => {
              const iconPaths: Record<PortalSection, string> = {
                overview: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                credentials: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                billing: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z',
                registration: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h9m-9 0V9a2 2 0 012-2h2a2 2 0 012 2v12',
                training: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
              };

              return (
                <div key={item.section} style={{ display: 'flex', flexDirection: 'column' }}>
                  <Link
                    className={item.section === section ? 'active' : undefined}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[item.section]} />
                      </svg>
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </aside>

        {isMobileNavOpen && <div className="admin-sidebar-overlay is-open" onClick={() => setIsMobileNavOpen(false)} aria-hidden="true" />}

        <section className="admin-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          {/* Page Content Header */}
          <header className="admin-topbar" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', textAlign: 'left', width: '100%' }}>
            <div className="admin-topbar-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', flex: 1 }}>
              <p className="admin-kicker" style={{ margin: '0 0 0.5rem 0', alignSelf: 'flex-start' }}>{currentSection.eyebrow}</p>
              <h1 style={{ textAlign: 'left', margin: '0 0 0.25rem 0', alignSelf: 'flex-start' }}>{currentSection.title}</h1>
              <p style={{ textAlign: 'left', margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, alignSelf: 'flex-start' }}>{currentSection.description}</p>
            </div>
          </header>

          <div className="admin-main-inner" style={{ padding: '2rem', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
            {message && <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{message}</div>}

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
                Loading your records...
              </div>
            ) : apps.length === 0 && section !== 'training' ? (
              <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <svg style={{ width: '48px', height: '48px', color: '#94a3b8', marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>No Accreditation Records Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You haven't submitted an institutional accreditation application yet.</p>
                <a href="/portal/applications/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                  Start Accreditation Application →
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {apps.map((app) => {
                  const isApproved = app.status === 'approved';
                  const acc = app.accreditations?.[0];
                  const cert = acc?.certificates?.[0];
                  const daysRemaining = getDaysRemaining(cert?.expiryDate || acc?.expiresAt);

                  return (
                    <div
                      key={app.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                        overflow: 'hidden',
                        display: section === 'training' ? 'none' : 'block'
                      }}
                    >
                      {/* Application Header Bar */}
                      <div
                        style={{
                          padding: '1.25rem 1.75rem',
                          backgroundColor: isApproved ? '#f0fdf4' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {app.institution?.logoUrl ? (
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={app.institution.logoUrl.startsWith('http') ? app.institution.logoUrl : `${API_BASE}/accreditations/logo-file?key=${encodeURIComponent(app.institution.logoUrl)}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {app.institution?.name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                              {app.institution?.name || 'Institution Application'}
                            </h2>
                            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                              {app.institution?.registrationNumber ? `Company Reg No: ${app.institution.registrationNumber} • ` : ''}{app.institution?.country || 'Global Partner'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {isApproved ? (
                            <span style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              ACCREDITATION ACTIVE
                            </span>
                          ) : (
                            <span style={{ backgroundColor: app.status === 'under_review' ? '#f59e0b' : '#3b82f6', color: '#ffffff', padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              Status: {app.status.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body Content Based on Section */}
                      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {(section === 'overview' || section === 'credentials') && isApproved && (
                          <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 15l-2 5l-2 -2l-2 2l1.5 -5.5"/><circle cx="12" cy="9" r="6"/></svg>
                                Official Verification &amp; Certificate Credentials
                              </h4>
                              {daysRemaining !== null && (
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: daysRemaining < 60 ? '#d97706' : '#16a34a', backgroundColor: daysRemaining < 60 ? '#fef3c7' : '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                                  {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Accreditation Expired'}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                                  Accreditation Code
                                </span>
                                <strong style={{ fontSize: '0.975rem', color: '#0f172a', fontFamily: 'monospace' }}>
                                  {acc?.accreditationCode || 'CTSDA-2026-ACTIVE'}
                                </strong>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                                  Certificate Number
                                </span>
                                <strong style={{ fontSize: '0.975rem', color: '#0f172a', fontFamily: 'monospace' }}>
                                  {cert?.certificateNumber || 'CERT-ACTIVE'}
                                </strong>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                                  Activation / Issue Date
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                                  {formatDate(cert?.issueDate || acc?.issuedAt || app.reviewedAt)}
                                </span>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                                  Expiration Date
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 700 }}>
                                  {formatDate(cert?.expiryDate || acc?.expiresAt)}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                              {cert?.verificationToken && (
                                <a
                                  href={`/verify?token=${cert.verificationToken}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '0.625rem 1.25rem',
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                  Verify Digital Certificate
                                </a>
                              )}

                              {cert?.verificationToken && (
                                <a
                                  href={`/verify-certificate?certNumber=${cert.certificateNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '0.625rem 1.25rem',
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  Download Certificate (PDF / QR)
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => startCheckout(app.id)}
                                style={{
                                  padding: '0.625rem 1.25rem',
                                  backgroundColor: '#ffffff',
                                  color: '#1e40af',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginLeft: 'auto',
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                                Renew Accreditation
                              </button>
                            </div>
                          </div>
                        )}

                        {(section === 'overview' || section === 'billing') && (
                          <div>
                            <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.975rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                              Billing &amp; Invoice History
                            </h4>

                            {app.invoices && app.invoices.length > 0 ? (
                              <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                      <th style={{ padding: '0.75rem 1rem' }}>Invoice ID</th>
                                      <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                                      <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {app.invoices.map((inv: any) => (
                                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                                          {inv.id.substring(0, 18)}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                                          {inv.description || 'CTSDA Institutional Accreditation Fee'}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                                          ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {inv.currency?.toUpperCase() || 'USD'}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                          {formatDate(inv.paidAt || inv.createdAt)}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                          <span style={{ backgroundColor: inv.status === 'paid' ? '#dcfce7' : '#fef3c7', color: inv.status === 'paid' ? '#166534' : '#92400e', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                            {inv.status}
                                          </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                          {inv.status !== 'paid' ? (
                                            <button
                                              type="button"
                                              onClick={() => startCheckout(app.id)}
                                              disabled={payingId === app.id}
                                              style={{ padding: '0.4rem 0.85rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                              {payingId === app.id ? 'Processing...' : 'Pay Invoice'}
                                            </button>
                                          ) : (
                                            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8125rem' }}>✓ Paid Receipt</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.875rem', color: '#64748b' }}>
                                No separate invoice transactions recorded yet.
                              </div>
                            )}
                          </div>
                        )}

                        {section === 'registration' && (
                          <div>
                            <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.975rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                              Institution Details
                            </h4>
                            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Name</span>
                                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{app.institution?.name}</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Registration No.</span>
                                <span style={{ color: '#334155', fontSize: '1rem' }}>{app.institution?.registrationNumber || 'N/A'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Email</span>
                                <span style={{ color: '#334155', fontSize: '1rem' }}>{app.institution?.email || 'N/A'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Country</span>
                                <span style={{ color: '#334155', fontSize: '1rem' }}>{app.institution?.country || 'N/A'}</span>
                              </div>
                              {app.institution?.address && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Address</span>
                                  <span style={{ color: '#334155', fontSize: '1rem' }}>{app.institution?.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* UNAPPROVED / PENDING ACTION BUTTONS */}
                        {!isApproved && section === 'overview' && (
                          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                            {app.status === 'draft' && (
                              <button
                                type="button"
                                className={payingId === app.id ? 'button primary is-loading' : 'button primary'}
                                onClick={() => submitApplication(app.id)}
                                disabled={payingId === app.id}
                                style={{ padding: '0.65rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                {payingId === app.id ? 'Submitting...' : 'Submit Application →'}
                              </button>
                            )}
                            {(app.status === 'payment_pending' || (app.invoices && app.invoices.some((i: any) => i.status !== 'paid'))) && (
                              <button
                                type="button"
                                className={payingId === app.id ? 'button primary is-loading' : 'button primary'}
                                onClick={() => startCheckout(app.id)}
                                disabled={payingId === app.id}
                                style={{ padding: '0.65rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                              >
                                {payingId === app.id ? 'Starting Checkout...' : 'Complete Payment →'}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {!isApproved && section === 'credentials' && (
                           <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.875rem', color: '#64748b' }}>
                            Your credentials will appear here once your application has been approved and accreditation is issued.
                           </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {section === 'training' && (
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>There are currently no training resources available. Once enrolled in a mandatory training session, you will see materials here.</p>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* PROFILE DROPDOWN */}
      {isProfileOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            onClick={() => setIsProfileOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'transparent' }}
          />
          <div style={{
            position: 'fixed',
            top: (() => {
              if (profileRef.current) {
                const rect = profileRef.current.getBoundingClientRect();
                return rect.bottom + 8;
              }
              return 78;
            })(),
            right: (() => {
              if (profileRef.current) {
                const rect = profileRef.current.getBoundingClientRect();
                return window.innerWidth - rect.right;
              }
              return 24;
            })(),
            width: '240px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem', fontWeight: 600 }}>{profile.firstName} {profile.lastName}</strong>
              <small style={{ color: '#64748b', fontSize: '0.8rem' }}>{profile.email}</small>
            </div>
            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={() => { setIsProfileOpen(false); logout(); }}
                style={{ padding: '0.625rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, borderRadius: '6px' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                Logout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
