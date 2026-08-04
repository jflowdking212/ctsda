'use client';

import { useEffect, useState } from 'react';

interface Institution {
  id: string;
  name: string;
  logoUrl?: string | null;
  country?: string;
  format?: 'round' | 'square' | 'rectangle';
}

// Custom SVG Data URIs representing Round, Square, and Rectangle Logo Formats
const DEMO_LOGOS = {
  // Square Formats
  blissSquare: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%232563eb"/><path d="M30 70 V30 L50 45 L70 30 V70" fill="none" stroke="%23ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="22" r="6" fill="%23fbbf24"/></svg>`,
  euroSquare: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="%234f46e5"/><path d="M28 28 H72 V38 H42 V45 H68 V55 H42 V62 H72 V72 H28 Z" fill="%23ffffff"/><circle cx="75" cy="25" r="5" fill="%23fbbf24"/></svg>`,
  tokyoSquare: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230f172a"/><circle cx="50" cy="50" r="32" fill="%23dc2626"/><path d="M35 36 H65 V43 H54 V66 H46 V43 H35 Z" fill="%23ffffff"/></svg>`,

  // Round (Circle) Formats
  globalRound: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230f172a" stroke="%2338bdf8" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="none" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="4 2"/><path d="M30 50 H70 M50 20 V80 M35 32 Q50 50 35 68 M65 32 Q50 50 65 68" stroke="%2338bdf8" stroke-width="3" fill="none"/></svg>`,
  pacificRound: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230284c7"/><path d="M50 15 L62 40 L90 40 L67 55 L76 82 L50 65 L24 82 L33 55 L10 40 L38 40 Z" fill="%23e0f2fe"/><circle cx="50" cy="50" r="22" fill="%230369a1"/><text x="50" y="55" font-family="system-ui, sans-serif" font-weight="900" font-size="15" fill="%23ffffff" text-anchor="middle">PSC</text></svg>`,
  oxfordRound: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%231e3a8a" stroke="%23d97706" stroke-width="4"/><rect x="30" y="32" width="40" height="36" rx="4" fill="%23ffffff" stroke="%23d97706" stroke-width="2"/><line x1="50" y1="32" x2="50" y2="68" stroke="%23d97706" stroke-width="2"/><line x1="36" y1="44" x2="44" y2="44" stroke="%231e3a8a" stroke-width="2"/><line x1="56" y1="44" x2="64" y2="44" stroke="%231e3a8a" stroke-width="2"/><polygon points="50,14 56,24 44,24" fill="%23d97706"/></svg>`,

  // Rectangle Formats
  apexRectangle: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 55"><rect width="180" height="55" rx="8" fill="%23047857"/><path d="M18 41 L32 14 L46 41 L37 41 L32 29 L27 41 Z" fill="%2334d399"/><text x="56" y="33" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="%23ffffff" letter-spacing="1">APEX</text><text x="56" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="8" fill="%23a7f3d0" letter-spacing="1.5">ENGINEERING</text></svg>`,
  stanfordRectangle: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 55"><rect width="200" height="55" rx="8" fill="%238c1515"/><path d="M22 41 L32 14 L42 41 Z" fill="%23ffffff"/><text x="52" y="32" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="%23ffffff">STANFORD</text><text x="52" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="7.5" fill="%23fca5a5" letter-spacing="1.5">EXECUTIVE PARTNER</text></svg>`,
};

const DEFAULT_ACCREDITED_LIST: Institution[] = [
  { id: '1', name: 'The Bliss Tech Academy', country: 'Nigeria', logoUrl: DEMO_LOGOS.blissSquare, format: 'square' },
  { id: '2', name: 'Global Training Institute', country: 'United States', logoUrl: DEMO_LOGOS.globalRound, format: 'round' },
  { id: '3', name: 'Apex Engineering Center', country: 'United Kingdom', logoUrl: DEMO_LOGOS.apexRectangle, format: 'rectangle' },
  { id: '4', name: 'Pacific Skills College', country: 'Canada', logoUrl: DEMO_LOGOS.pacificRound, format: 'round' },
  { id: '5', name: 'EuroVocational Institute', country: 'Germany', logoUrl: DEMO_LOGOS.euroSquare, format: 'square' },
  { id: '6', name: 'Stanford Executive Partner', country: 'United States', logoUrl: DEMO_LOGOS.stanfordRectangle, format: 'rectangle' },
  { id: '7', name: 'Oxford Standards Academy', country: 'United Kingdom', logoUrl: DEMO_LOGOS.oxfordRound, format: 'round' },
  { id: '8', name: 'Tokyo Tech Institute', country: 'Japan', logoUrl: DEMO_LOGOS.tokyoSquare, format: 'square' },
];

export function AccreditedLogosCarousel() {
  const [institutions, setInstitutions] = useState<Institution[]>(DEFAULT_ACCREDITED_LIST);

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
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item: any, idx: number) => ({
              ...item,
              logoUrl: item.logoUrl || DEFAULT_ACCREDITED_LIST[idx % DEFAULT_ACCREDITED_LIST.length].logoUrl,
            }));
            setInstitutions(mapped);
          }
        }
      } catch {
        // Silently preserve default logos if network or backend API is unreachable
      }
    }
    loadInstitutions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate list for a seamless, continuous infinite carousel
  const carouselItems = [...institutions, ...institutions];

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
      <div style={{ display: 'flex', overflow: 'hidden', userSelect: 'none', position: 'relative', width: '100%' }}>
        {/* Left & Right subtle gradient fade edges */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '80px', background: 'linear-gradient(to right, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '80px', background: 'linear-gradient(to left, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            animation: 'scrollLogos 30s linear infinite',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            padding: '0.5rem 0',
          }}
        >
          {carouselItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#ffffff',
                height: '64px', // STRICT UNIFORM HEIGHT
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                flexShrink: 0,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* STRICT UNIFORM LOGO FRAME (Equal bounding box for round, square & rectangle) */}
              <div
                style={{
                  width: '80px', // Uniform container width
                  height: '44px', // Uniform container height
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
                {item.logoUrl ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    style={{
                      maxHeight: '36px',
                      maxWidth: '72px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: item.format === 'round' ? '50%' : '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Institution Title & Country Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem', lineHeight: 1.2 }}>
                  {item.name}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                  {item.country || 'Global Partner'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLogos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

