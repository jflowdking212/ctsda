'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PublicPage } from '../../../components/public-shell';

export default function InstitutionPage() {
  const { slug } = useParams();
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDirectory, setShowDirectory] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const [instRes, settingsRes] = await Promise.all([
          fetch(`${apiUrl}/institutions/public-accredited/${slug}`, { cache: 'no-store' }),
          fetch(`${apiUrl}/settings/public`, { cache: 'no-store' }).catch(() => null),
        ]);
        setInstitution(instRes.ok ? await instRes.json() : null);
        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json().catch(() => ({}));
          if (settings.showDirectory === 'false' || settings.showDirectory === false) {
            setShowDirectory(false);
          }
        }
      } catch { setInstitution(null); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#5d6a7c' }}>
          <div style={{ fontSize: '1rem', fontWeight: 500 }}>Loading institution profile…</div>
        </div>
      </main>
    </PublicPage>
  );

  if (!institution) return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div>
          <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10233f', marginBottom: '0.5rem' }}>Institution Not Found</h1>
          <p style={{ color: '#5d6a7c', marginBottom: '1.5rem' }}>The institution you are looking for does not exist or is no longer accredited.</p>
          <Link href="/directory" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Directory
          </Link>
        </div>
      </main>
    </PublicPage>
  );

  const latestAcc = institution.accreditations?.[0];
  const isExpired = latestAcc?.expiresAt ? new Date(latestAcc.expiresAt) <= new Date() : false;
  const isSuspended = latestAcc?.status === 'suspended' || latestAcc?.status === 'revoked';
  const isActive = latestAcc?.status === 'active' && !isExpired;

  const validUntil = latestAcc?.expiresAt
    ? new Date(latestAcc.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const approvedApp = institution.applications?.[0];
  const programs = approvedApp?.offeredCertificates || [];
  const trainingAreas = approvedApp?.trainingAreas?.map((ta: any) => ta.trainingArea?.name).filter(Boolean) || [];
  const fallbackDesc = `${institution.name} is an officially accredited ${institution.institutionType || 'training'} provider based in ${institution.country || 'the United States'}, recognized for high standards in education, skill verification, and workforce development by the Council For Training Skills & Development America (CTSDA).`;

  function getLogoUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    const _rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const apiUrl = (typeof window !== 'undefined' && _rawApi === 'http://localhost:4000') ? '/api' : _rawApi.replace(/\/$/, '');
    if (url.startsWith('http://localhost:4000')) {
      return url.replace('http://localhost:4000', apiUrl);
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.replace(/^\/?(uploads\/)?/, '');
    return `${apiUrl}/uploads/${clean}`;
  }

  const formattedLogo = getLogoUrl(institution.logoUrl);

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* Hero Banner */}
        <section className="profile-hero-section">
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <Link href={showDirectory ? "/directory" : "/"} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: '#bfdbfe', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
              marginBottom: '1rem',
            }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {showDirectory ? 'All Institutions' : 'Home'}
            </Link>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', marginBottom: '0.4rem' }}>
              {isActive ? 'Accredited Institution' : isExpired ? 'Expired Accreditation' : 'Suspended Institution'}
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.75rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, wordBreak: 'break-word' }}>
              {institution.name}
            </h1>
          </div>
        </section>

        {/* Institution Card Container */}
        <section style={{ padding: '0 1rem' }}>
          <div style={{ maxWidth: '1140px', margin: '-2rem auto 0', position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(16,35,63,0.10)', overflow: 'hidden' }}>

              {/* Header Card Body */}
              <div className="profile-card-header">
                {/* Logo */}
                <div className="profile-logo-box">
                  {formattedLogo ? (
                    <img
                      src={formattedLogo}
                      alt={institution.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.profile-logo-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : null}
                  <span className="profile-logo-fallback" style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', display: formattedLogo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {institution.name?.charAt(0)}
                  </span>
                </div>

                {/* Name & meta */}
                <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', fontWeight: 800, color: '#10233f', margin: 0, wordBreak: 'break-word' }}>
                      {institution.name}
                    </h2>
                    {isActive ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        ACCREDITED
                      </span>
                    ) : isExpired ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#b45309', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        EXPIRED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fee2e2', color: '#dc2626', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        SUSPENDED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontSize: '0.85rem', color: '#5d6a7c', fontWeight: 500, marginBottom: '0.75rem' }}>
                    {institution.country && <span>📍 {institution.country}</span>}
                    {institution.institutionType && <span>🏛 {institution.institutionType}</span>}
                    {institution.yearEstablished && <span>📅 Est. {institution.yearEstablished}</span>}
                  </div>

                  {trainingAreas.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {trainingAreas.map((a: string, i: number) => (
                        <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="profile-share-btn"
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {copied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              {/* Accreditation status banner */}
              {isActive ? (
                <div className="profile-banner-container" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', background: '#16a34a', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.9rem' }}>Officially Accredited by CTSDA</div>
                      <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        This institution meets all requirements of the Council For Training Skills & Development America. Valid until <strong>{validUntil}</strong>.
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>● Active</span>
                </div>
              ) : isExpired ? (
                <div className="profile-banner-container" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', background: '#d97706', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>Accreditation Expired</div>
                      <div style={{ fontSize: '0.82rem', color: '#b45309', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        This institution's CTSDA accreditation expired on <strong>{validUntil}</strong>. Please contact CTSDA or the institution for renewal status.
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#d97706', color: '#fff', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>● Expired</span>
                </div>
              ) : (
                <div className="profile-banner-container" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', background: '#dc2626', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>Accreditation Suspended / Inactive</div>
                      <div style={{ fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        This institution is currently not active in the CTSDA accredited directory.
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#dc2626', color: '#fff', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>● Inactive</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body Content Grid */}
        <section style={{ padding: '1.5rem 1rem 4rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div className="profile-layout-grid">

              {/* Left main column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

                {/* About */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(16,35,63,0.04)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '18px', height: '18px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    About the Institution
                  </h3>
                  <p style={{ color: '#5d6a7c', lineHeight: 1.7, margin: 0, wordBreak: 'break-word', fontSize: '0.95rem' }}>
                    {institution.description?.trim() || fallbackDesc}
                  </p>
                </div>

                {/* Programs */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(16,35,63,0.04)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '18px', height: '18px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" /></svg>
                    Programs & Certificates Offered
                  </h3>
                  {programs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {programs.map((p: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#10233f', fontWeight: 500, wordBreak: 'break-word' }}>
                          <svg style={{ width: '14px', height: '14px', color: '#16a34a', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No programs listed publicly.</p>
                  )}
                </div>

                {/* Training Areas */}
                {trainingAreas.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(16,35,63,0.04)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg style={{ width: '18px', height: '18px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      Areas of Training
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {trainingAreas.map((a: string, i: number) => (
                        <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

                {/* Quick Info */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(16,35,63,0.04)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', marginBottom: '0.75rem' }}>Quick Info</h3>
                  {[
                    { label: 'Founded', value: institution.yearEstablished || '—' },
                    { label: 'Type', value: institution.institutionType || '—' },
                    { label: 'Reg. Number', value: institution.registrationNumber || '—' },
                    { label: 'Country', value: institution.country || '—' },
                    ...(programs.length > 0 ? [{ label: 'Programs', value: programs.length }] : []),
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#5d6a7c', fontWeight: 500, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10233f', textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(16,35,63,0.04)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', marginBottom: '0.75rem' }}>Contact Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {institution.email && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5d6a7c', minWidth: '55px', paddingTop: '2px', flexShrink: 0 }}>EMAIL</span>
                        <a href={`mailto:${institution.email}`} style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, wordBreak: 'break-all' }}>{institution.email}</a>
                      </div>
                    )}
                    {institution.website && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5d6a7c', minWidth: '55px', paddingTop: '2px', flexShrink: 0 }}>WEBSITE</span>
                        <a href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, wordBreak: 'break-all' }}>{institution.website.replace(/^https?:\/\//, '')}</a>
                      </div>
                    )}
                    {institution.phone && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5d6a7c', minWidth: '55px', paddingTop: '2px', flexShrink: 0 }}>PHONE</span>
                        <span style={{ fontSize: '0.875rem', color: '#10233f', fontWeight: 500, wordBreak: 'break-word' }}>{institution.phone}</span>
                      </div>
                    )}
                    {institution.address && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5d6a7c', minWidth: '55px', paddingTop: '2px', flexShrink: 0 }}>ADDRESS</span>
                        <span style={{ fontSize: '0.875rem', color: '#10233f', fontWeight: 500, wordBreak: 'break-word' }}>{institution.address}{institution.country ? `, ${institution.country}` : ''}</span>
                      </div>
                    )}
                    {(institution.facebookUrl || institution.instagramUrl || institution.linkedinUrl || institution.twitterUrl) && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5d6a7c', minWidth: '55px', paddingTop: '2px', flexShrink: 0 }}>SOCIAL</span>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {institution.facebookUrl && (
                            <a href={institution.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Facebook</a>
                          )}
                          {institution.instagramUrl && (
                            <a href={institution.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#db2777', fontWeight: 600, textDecoration: 'none' }}>Instagram</a>
                          )}
                          {institution.linkedinUrl && (
                            <a href={institution.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>LinkedIn</a>
                          )}
                          {institution.twitterUrl && (
                            <a href={institution.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>X (Twitter)</a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificate Verification CTA */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '1rem', padding: '1.5rem', color: '#fff', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem' }}>
                    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', marginBottom: '0.4rem' }}>Certificate Verification</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>Verify a Certificate</h4>
                  <p style={{ fontSize: '0.82rem', color: '#bfdbfe', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                    Authenticate certificates issued by this institution through CTSDA's official verification portal.
                  </p>
                  <Link href="/verify-certificate" style={{ display: 'block', background: '#fff', color: '#1e3a8a', borderRadius: '0.5rem', padding: '0.65rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                    Verify Now →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .profile-hero-section {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: #ffffff;
            padding: 3rem 1rem 4.5rem;
          }
          .profile-card-header {
            padding: 1.5rem;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1.25rem;
            align-items: flex-start;
            border-bottom: 1px solid #f1f5f9;
          }
          .profile-logo-box {
            width: 80px;
            height: 80px;
            border-radius: 0.875rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .profile-share-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 0.6rem;
            padding: 0.6rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #5d6a7c;
            background: #fff;
            cursor: pointer;
            flex-shrink: 0;
          }
          .profile-banner-container {
            margin: 1rem 1.25rem 1.25rem;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 0.875rem;
            padding: 1rem 1.25rem;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 1rem;
            justify-content: space-between;
          }
          .profile-layout-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            align-items: start;
          }

          @media (min-width: 768px) {
            .profile-hero-section {
              padding: 3.5rem 1.5rem 5rem;
            }
            .profile-card-header {
              padding: 2rem 2rem 1.5rem;
            }
            .profile-banner-container {
              margin: 1.5rem 2rem;
            }
            .profile-layout-grid {
              grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
            }
          }

          @media (max-width: 640px) {
            .profile-card-header {
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 1.25rem 1rem;
            }
            .profile-logo-box {
              width: 90px;
              height: 90px;
              margin: 0 auto;
            }
            .profile-card-header > div {
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .profile-card-header h2 {
              text-align: center;
              width: 100%;
              font-size: 1.75rem !important;
            }
            .profile-share-btn {
              width: 100%;
              margin-top: 1rem;
            }
            .profile-share-btn {
              width: 100%;
              margin-top: 0.5rem;
            }
            .profile-banner-container {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}</style>
      </main>
    </PublicPage>
  );
}
