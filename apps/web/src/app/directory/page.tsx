'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#f0f4f8',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2d6e 100%)',
    padding: '80px 24px 60px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '100px',
    padding: '6px 16px',
    marginBottom: '24px',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 800,
    lineHeight: 1.1,
    margin: '0 0 20px',
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: '18px',
    lineHeight: 1.6,
    margin: '0 auto 40px',
    maxWidth: '560px',
  },
  searchWrapper: {
    maxWidth: '540px',
    margin: '0 auto',
    position: 'relative' as const,
  },
  searchInput: {
    width: '100%',
    padding: '16px 24px 16px 56px',
    fontSize: '16px',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '20px',
    pointerEvents: 'none' as const,
  },
  main: {
    flex: 1,
    padding: '48px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
    flexShrink: 0,
  },
  statLabel: { color: '#64748b', fontSize: '13px', margin: 0 },
  statValue: { color: '#0f172a', fontSize: '20px', fontWeight: 700, margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8eef5',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  cardTop: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
    padding: '24px 24px 48px',
    position: 'relative' as const,
    height: '80px',
  },
  cardLogoWrapper: {
    position: 'absolute' as const,
    bottom: '-40px',
    left: '24px',
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: '#ffffff',
    border: '3px solid #ffffff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain' as const, padding: '6px' },
  logoFallback: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#1d4ed8',
    background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: '52px 24px 20px',
    flex: 1,
  },
  cardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '100px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    marginBottom: '10px',
  },
  cardName: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 8px',
    lineHeight: 1.3,
  },
  cardCountry: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#64748b',
    fontSize: '13px',
    margin: 0,
  },
  cardFooter: {
    padding: '14px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewProfile: {
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px',
    gap: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '80px 24px',
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px dashed #cbd5e1',
  },
};

export default function DirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDirectory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/institutions/public-accredited`);
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error('Failed to load directory', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDirectory();
  }, []);

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .dir-card { animation: fadeUp 0.4s ease both; }
        .dir-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; }
        .search-input::placeholder { color: rgba(255,255,255,0.45); }
        .search-input:focus { border-color: rgba(255,255,255,0.4) !important; background: rgba(255,255,255,0.15) !important; }
      `}</style>

      <PremiumHeader />

      {/* Hero Section */}
      <div style={S.hero}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={S.heroBadge}>
            <span>✦</span> Official CTSDA Accredited Directory
          </div>
          <h1 style={S.heroTitle}>Accredited Institutions<br />Directory</h1>
          <p style={S.heroSubtitle}>
            Discover verified training providers and institutions that meet CTSDA's rigorous international quality standards.
          </p>
          <div style={S.searchWrapper}>
            <span style={S.searchIcon}>🔍</span>
            <input
              className="search-input"
              style={S.searchInput}
              type="text"
              placeholder="Search by institution name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main style={S.main}>
        {/* Stats Row */}
        {!loading && (
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <div style={S.statIcon}>🏛️</div>
              <div>
                <p style={S.statLabel}>Total Accredited</p>
                <p style={S.statValue}>{institutions.length}</p>
              </div>
            </div>
            <div style={S.statCard}>
              <div style={{ ...S.statIcon, background: 'linear-gradient(135deg, #059669, #10b981)' }}>🌍</div>
              <div>
                <p style={S.statLabel}>Countries Represented</p>
                <p style={S.statValue}>{new Set(institutions.map(i => i.country).filter(Boolean)).size}</p>
              </div>
            </div>
            {searchTerm && (
              <div style={S.statCard}>
                <div style={{ ...S.statIcon, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>🔎</div>
                <div>
                  <p style={S.statLabel}>Search Results</p>
                  <p style={S.statValue}>{filteredInstitutions.length}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={S.loadingWrapper}>
            <div style={S.spinner} />
            <p style={{ color: '#64748b', fontSize: '15px' }}>Loading accredited institutions...</p>
          </div>
        ) : filteredInstitutions.length > 0 ? (
          <div style={S.grid}>
            {filteredInstitutions.map((inst, idx) => (
              <Link
                key={inst.id}
                href={`/directory/${inst.slug || inst.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="dir-card"
                  style={{
                    ...S.card,
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  <div style={S.cardTop}>
                    <div style={S.cardLogoWrapper}>
                      {inst.logoUrl ? (
                        <img src={inst.logoUrl} alt={`${inst.name} logo`} style={S.logoImg} />
                      ) : (
                        <div style={S.logoFallback}>
                          {inst.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={S.cardBody}>
                    <div style={S.cardBadge}>
                      ✓ Accredited
                    </div>
                    <p style={S.cardName}>{inst.name}</p>
                    {inst.country && (
                      <p style={S.cardCountry}>
                        📍 {inst.country}
                      </p>
                    )}
                  </div>
                  <div style={S.cardFooter}>
                    <span style={S.viewProfile}>View Full Profile →</span>
                    <span style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      border: '1px solid #bae6fd',
                    }}>CTSDA Member</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={S.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: '#0f172a', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>No institutions found</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px' }}>
              No results for "{searchTerm}". Try a different search term.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '10px 24px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      <PremiumFooter />
    </div>
  );
}
