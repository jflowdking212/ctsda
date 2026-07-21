import { PublicPage } from '../../components/public-shell';
import Link from 'next/link';

export const metadata = {
  title: 'Training | CTSDA',
  description: 'Browse free training modules, videos, and resources from the CTSDA to improve road safety and driver training standards.',
};

async function getTraining() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/training`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Road Safety': { bg: '#fee2e2', text: '#991b1b' },
  'Instructor Training': { bg: '#dbeafe', text: '#1e40af' },
  'Compliance': { bg: '#ede9fe', text: '#5b21b6' },
  'Vehicle Inspection': { bg: '#fef3c7', text: '#92400e' },
  'First Aid': { bg: '#fce7f3', text: '#9d174d' },
  'Advanced Driving': { bg: '#d1fae5', text: '#065f46' },
};

const DEFAULT_COLOR = { bg: '#f1f5f9', text: '#475569' };

export default async function TrainingPage() {
  const items = await getTraining();

  const categories = [...new Set(items.map((i: any) => i.category).filter(Boolean))];

  return (
    <PublicPage>
      <main>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0a192f 0%, #0f3460 100%)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', marginBottom: '1rem', fontWeight: 600 }}>
            CTSDA Training Centre
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.1 }}>
            Training Resources
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Explore our library of free training modules, instructional videos, and downloadable resources to support professional driver training.
          </p>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
              <h2 style={{ color: '#334155', marginBottom: '0.5rem' }}>Training modules coming soon</h2>
              <p>Check back shortly for our full library of training resources.</p>
            </div>
          ) : (
            <>
              {/* Category chips */}
              {categories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
                  {categories.map((cat: any) => {
                    const c = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
                    return (
                      <span key={cat} style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
                        {cat}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                {items.map((item: any) => {
                  const c = CATEGORY_COLORS[item.category] || DEFAULT_COLOR;
                  return (
                    <article key={item.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      {/* Top bar */}
                      <div style={{ height: '5px', background: 'linear-gradient(90deg, #10b981, #0ea5e9)' }} />
                      
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          {item.category && (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
                              {item.category}
                            </span>
                          )}
                          {item.duration && (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>⏱ {item.duration}</span>
                          )}
                        </div>

                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{item.title}</h2>
                        
                        {item.description && (
                          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                            {item.description.length > 120 ? item.description.slice(0, 120) + '...' : item.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                          {item.videoUrl && (
                            <a
                              href={item.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                            >
                              ▶ Watch Video
                            </a>
                          )}
                          {item.resourceUrl && (
                            <a
                              href={item.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                            >
                              ↓ Download
                            </a>
                          )}
                          {!item.videoUrl && !item.resourceUrl && (
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Resources coming soon</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </PublicPage>
  );
}
