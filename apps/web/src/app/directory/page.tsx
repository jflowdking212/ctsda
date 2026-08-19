'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicPage } from '../../components/public-shell';

export default function DirectoryPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDirectory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        // 1. Check if public directory is enabled
        const settingsRes = await fetch(`${apiUrl}/settings/public`, { cache: 'no-store' }).catch(() => null);
        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json().catch(() => ({}));
          const enabled = settings.showDirectory !== 'false' && settings.showDirectory !== false;
          if (!enabled) {
            if (isMounted) {
              setIsAllowed(false);
              setLoading(false);
            }
            router.replace('/');
            return;
          }
        }

        if (isMounted) setIsAllowed(true);

        // 2. Fetch accredited institutions
        const res = await fetch(`${apiUrl}/institutions/public-accredited`, { cache: 'no-store' });
        if (res.ok && isMounted) setInstitutions(await res.json());
      } catch (err) {
        console.error('Failed to load directory', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDirectory();
    return () => { isMounted = false; };
  }, [router]);

  const countries = ['All', ...Array.from(new Set(institutions.map(i => i.country).filter(Boolean)))].sort();

  const filtered = institutions.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || i.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

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

  if (isAllowed === false) {
    return (
      <PublicPage>
        <main style={{ backgroundColor: '#f8fafc', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10233f', marginBottom: '0.5rem' }}>Directory Unavailable</h1>
            <p style={{ color: '#5d6a7c', marginBottom: '1.5rem' }}>The public directory is currently private. Redirecting to home...</p>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', fontWeight: 700, textDecoration: 'none' }}>
              Return to Home
            </Link>
          </div>
        </main>
      </PublicPage>
    );
  }

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* Hero Banner */}
        <section className="directory-hero-section">
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
              <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Official Accredited Directory</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '0.75rem',
              lineHeight: 1.15,
              wordBreak: 'break-word',
            }}>
              Find Accredited Institutions
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
              color: '#e2e8f0',
              maxWidth: '620px',
              lineHeight: 1.6,
              fontWeight: 400,
              margin: 0,
            }}>
              Discover verified training providers globally that have met CTSDA's rigorous quality assurance standards and criteria.
            </p>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by institution name or keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.7rem 0.9rem 0.7rem 2.5rem',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#172033',
                }}
              />
            </div>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '0.7rem 1.1rem',
                fontSize: '0.95rem',
                background: '#f8fafc',
                color: '#172033',
                outline: 'none',
                flex: '0 1 180px',
                minWidth: '140px',
                cursor: 'pointer',
              }}
            >
              {countries.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
            </select>
            {(searchTerm || selectedCountry !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCountry('All'); }}
                style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Stats Row */}
        <section style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1rem' }} className="directory-stats-grid">
            {[
              { label: 'Accredited Institutions', value: institutions.length },
              { label: 'Countries Represented', value: countries.length - 1 },
              { label: 'Network Status', value: 'Active' },
            ].map((s, i) => (
              <div key={i} className="directory-stat-item" style={{ borderRight: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg style={{ width: '20px', height: '20px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10233f', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5d6a7c', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem', wordBreak: 'break-word' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Institution Grid */}
        <section style={{ padding: '2rem 1rem 4rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10233f', margin: 0 }}>
                {searchTerm || selectedCountry !== 'All' ? 'Search Results' : 'All Accredited Institutions'}
              </h2>
              <span style={{ fontSize: '0.875rem', color: '#5d6a7c' }}>Showing <strong>{filtered.length}</strong> institution{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#5d6a7c' }}>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>Loading directory…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#5d6a7c' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No institutions found</div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {filtered.map((inst: any) => {
                  const formattedLogo = getLogoUrl(inst.logoUrl);
                  return (
                    <div key={inst.id} style={{
                      background: '#fff',
                      borderRadius: '1rem',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(16,35,63,0.06)',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,35,63,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(16,35,63,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      {/* Card cover */}
                      <div style={{ height: '90px', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0.6rem', right: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <svg style={{ width: '12px', height: '12px', color: '#4ade80' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accredited</span>
                        </div>
                      </div>

                      {/* Logo */}
                      <div style={{ padding: '0 1.25rem', marginTop: '-32px', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '0.75rem', background: '#fff', border: '2px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {formattedLogo ? (
                            <img
                              src={formattedLogo}
                              alt={inst.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.card-logo-fallback');
                                if (fallback) (fallback as HTMLElement).style.display = 'flex';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : null}
                          <span className="card-logo-fallback" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', display: formattedLogo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            {inst.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>

                    {/* Card body */}
                    <div style={{ padding: '0.75rem 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10233f', margin: '0 0 0.4rem', wordBreak: 'break-word' }}>{inst.name}</h3>
                      {inst.country && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#5d6a7c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                          <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {inst.country}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto' }}>
                        <Link
                          href={`/directory/${inst.slug || inst.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          View Profile
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </section>

        <style jsx global>{`
          .directory-hero-section {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: #ffffff;
            padding: 3rem 1rem 3.5rem;
          }
          .directory-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }
          .directory-stat-item {
            padding: 1.25rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          @media (min-width: 768px) {
            .directory-hero-section {
              padding: 4.75rem 1.5rem 4rem;
            }
          }

          @media (max-width: 640px) {
            .directory-stats-grid {
              grid-template-columns: 1fr;
            }
            .directory-stat-item {
              border-right: none !important;
              border-bottom: 1px solid #e2e8f0;
              padding: 1rem 0.5rem;
            }
            .directory-stat-item:last-child {
              border-bottom: none;
            }
          }
        `}</style>
      </main>
    </PublicPage>
  );
}
