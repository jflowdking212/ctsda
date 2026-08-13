'use client';

import { useEffect, useState } from 'react';

interface Institution {
  id: string;
  name: string;
  logoUrl?: string | null;
  country?: string;
}

export function AccreditedLogosCarousel() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadInstitutions() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/institutions/public-accredited`, {
          cache: 'no-store',
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json().catch(() => null);
          if (isMounted && Array.isArray(data)) {
            setInstitutions(data);
          }
        }
      } catch (err) {
        console.error('Failed to load public accredited institutions:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }
    loadInstitutions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Do not render section if backend returned 0 active accredited institutions
  if (!loaded || institutions.length === 0) {
    return null;
  }

  // Duplicate list multiple times to guarantee filling full screen width
  const repeatCount = institutions.length < 3 ? 6 : institutions.length < 6 ? 4 : 2;
  const carouselItems = Array(repeatCount).fill(institutions).flat();

  function getLogoUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    if (url.startsWith('http://localhost:4000')) {
      return url.replace('http://localhost:4000', apiUrl);
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.replace(/^\/?(uploads\/)?/, '');
    return `${apiUrl}/uploads/${clean}`;
  }

  return (
    <section className="accredited-logos-section" style={{ backgroundColor: '#ffffff', padding: '4rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p className="eyebrow" style={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Global Quality Assurance
        </p>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Accredited Institutions &amp; Partners
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: 0 }}>
          Empowering world-class educational standards across accredited institution partners worldwide
        </p>
      </div>

      {/* INFINITE SCROLL CAROUSEL */}
      <div style={{ display: 'flex', overflow: 'hidden', userSelect: 'none', position: 'relative', width: '100%', justifyContent: 'flex-start' }}>
        {/* Left & Right subtle gradient fade edges */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '80px', background: 'linear-gradient(to right, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '80px', background: 'linear-gradient(to left, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }} />

        <div className="logo-carousel-track">
          {carouselItems.map((item, idx) => {
            const formattedLogo = getLogoUrl(item.logoUrl);
            return (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: '#ffffff',
                  height: '64px',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  flexShrink: 0,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* UNIFORM LOGO FRAME */}
                <div
                  style={{
                    width: '80px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '4px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  {formattedLogo ? (
                    <img
                      src={formattedLogo}
                      alt={item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        const fallbackEl = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                        if (fallbackEl) (fallbackEl as HTMLElement).style.display = 'flex';
                      }}
                      style={{
                        maxHeight: '36px',
                        maxWidth: '72px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : null}
                  <div
                    className="logo-fallback"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      display: formattedLogo ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.name ? item.name.charAt(0).toUpperCase() : 'I'}
                  </div>
                </div>

                {/* Institution Title & Country Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem', lineHeight: 1.2 }}>
                    {item.name}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                    {item.country || 'Accredited Partner'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes scrollLogos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .logo-carousel-track {
          display: flex !important;
          gap: 1.5rem !important;
          width: max-content !important;
          animation: scrollLogos 30s linear infinite !important;
          white-space: nowrap !important;
          align-items: center !important;
          padding: 0.5rem 0 !important;
        }
        .logo-carousel-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}
