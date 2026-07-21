import { PublicPage } from '../../components/public-shell';
import Link from 'next/link';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';
import { TrainingRegisterBtn } from '../../components/training-register-btn';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />
      <main style={{ flex: 1 }}>
        <div style={{ backgroundColor: '#0f172a', padding: '6rem 2rem 4rem', textAlign: 'center', color: 'white', backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Professional <span style={{ color: '#38bdf8' }}>Training</span> Center
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Elevate your skills with industry-leading modules designed for professional drivers and instructors.
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                {items.map((item: any) => {
                  const c = CATEGORY_COLORS[item.category] || DEFAULT_COLOR;
                  const isFree = !item.price || Number(item.price) === 0;
                  
                  return (
                    <article key={item.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: isFree ? '#10b981' : '#0f172a', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          {isFree ? 'Free' : `$${Number(item.price).toFixed(2)}`}
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'linear-gradient(90deg, #10b981, #0ea5e9)' }} />
                      
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.5rem' }}>
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

                        <TrainingRegisterBtn trainingId={item.id} price={item.price || 0} title={item.title} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
}
