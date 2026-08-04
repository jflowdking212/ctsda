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

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setInstitutions(data);
          }
        }
      } catch (err) {
        console.error('Failed to load accredited logos:', err);
      }
    }
    loadInstitutions();
  }, []);

  // Default fallback logos if none exist yet
  const displayList = institutions.length > 0 ? institutions : [
    { id: '1', name: 'Global Training Institute', country: 'United States' },
    { id: '2', name: 'Jay Bliss Tech Academy', country: 'Nigeria' },
    { id: '3', name: 'Apex Engineering Center', country: 'United Kingdom' },
    { id: '4', name: 'Pacific Skills College', country: 'Canada' },
    { id: '5', name: 'EuroVocational Institute', country: 'Germany' },
  ];

  // Duplicate for seamless infinite loop
  const carouselItems = [...displayList, ...displayList];

  return (
    <section className="accredited-logos-section" style={{ backgroundColor: '#ffffff', padding: '3.5rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="eyebrow" style={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Trusted Worldwide
        </p>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Accredited Institutions & Partners
        </h2>
      </div>

      {/* INFINITE SCROLL CONTAINER */}
      <div style={{ display: 'flex', overflow: 'hidden', userSelect: 'none', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            gap: '2.5rem',
            animation: 'scrollLogos 25s linear infinite',
            whiteSpace: 'nowrap',
            alignItems: 'center',
          }}
        >
          {carouselItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                flexShrink: 0,
              }}
            >
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {item.name.charAt(0)}
                </div>
              )}
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{item.name}</span>
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
