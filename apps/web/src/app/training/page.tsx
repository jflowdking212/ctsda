import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';
import { TrainingRegisterBtn } from '../../components/training-register-btn';
import { StudentVerificationWidget } from '../../components/student-verification-widget';
import Link from 'next/link';

export const metadata = {
  title: 'Training | CTSDA',
  description: 'Browse free training modules, videos, and resources from the CTSDA to improve road safety and driver training standards.',
};

async function getTraining() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/training`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Business And Professional Development': { bg: '#dbeafe', text: '#1e40af' },
  'Technology and Digital Skills': { bg: '#e0e7ff', text: '#3730a3' },
  'Health Safety and Compliance': { bg: '#fee2e2', text: '#991b1b' },
  'Personal Growth and Soft Skill': { bg: '#fef3c7', text: '#92400e' },
  'Caregiving, Health and Social Care': { bg: '#fce7f3', text: '#9d174d' },
  'Training, Skills and Development': { bg: '#d1fae5', text: '#065f46' },
};

const DEFAULT_COLOR = { bg: '#f1f5f9', text: '#475569' };

async function getSettings() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/settings/public`, { cache: 'no-store' });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Business And Professional Development': '/uploads/instructor-training.jpg',
  'Technology and Digital Skills': '/uploads/vehicle-inspection.jpg',
  'Health Safety and Compliance': '/uploads/compliance-training.jpg',
  'Personal Growth and Soft Skill': '/uploads/first-aid.jpg',
  'Caregiving, Health and Social Care': '/uploads/first-aid.jpg',
  'Training, Skills and Development': '/uploads/road-safety.jpg',
};

function getValidImageUrl(url?: string | null, category?: string, title?: string): string {
  // Server-safe: NEXT_PUBLIC_API_URL is available both server and client.
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  let targetUrl = url;

  // If the DB record has a real URL (from the admin upload), use it after sanitizing localhost
  if (targetUrl) {
    // Strip any known CTSDA domain prefix so images work on any domain
    const KNOWN_HOSTS = [
      'https://ctsda.acecoterieconsulting.com', 'http://ctsda.acecoterieconsulting.com',
      'https://ctsdamerica.com', 'https://www.ctsdamerica.com', 'http://ctsdamerica.com',
      'http://localhost:4000',
    ];
    for (const host of KNOWN_HOSTS) {
      if (targetUrl.startsWith(host)) { targetUrl = targetUrl.slice(host.length); break; }
    }
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) return targetUrl;
    // Relative path — strip /api/uploads/ or /uploads/ prefix and rebuild cleanly
    const clean = targetUrl.replace(/^\/?api\/uploads\//, '').replace(/^\/?uploads\//, '');
    return `/api/uploads/${clean}`;
  }

  // No imageUrl in DB — pick a category/title-based fallback
  let fallbackPath: string;
  const lowerCategory = (category || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  if (CATEGORY_IMAGES[category || '']) {
    fallbackPath = CATEGORY_IMAGES[category || ''];
  } else if (lowerCategory.includes('tech') || lowerCategory.includes('digital') || lowerTitle.includes('digital') || lowerTitle.includes('tech')) {
    fallbackPath = '/uploads/vehicle-inspection.jpg';
  } else if (lowerCategory.includes('business') || lowerCategory.includes('professional') || lowerTitle.includes('business') || lowerTitle.includes('professional')) {
    fallbackPath = '/uploads/instructor-training.jpg';
  } else if (lowerCategory.includes('health') || lowerCategory.includes('safety') || lowerCategory.includes('compliance') || lowerTitle.includes('safety') || lowerTitle.includes('compliance')) {
    fallbackPath = '/uploads/compliance-training.jpg';
  } else if (lowerCategory.includes('care') || lowerCategory.includes('social') || lowerTitle.includes('care')) {
    fallbackPath = '/uploads/first-aid.jpg';
  } else if (lowerCategory.includes('growth') || lowerCategory.includes('soft') || lowerTitle.includes('growth') || lowerTitle.includes('skill')) {
    fallbackPath = '/uploads/first-aid.jpg';
  } else {
    fallbackPath = '/uploads/road-safety.jpg';
  }

  return `${apiBase}${fallbackPath}`;
}

export default async function TrainingPage({ searchParams }: { searchParams?: any }) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const selectedCategory = resolvedParams.category;

  const [allItems, settings] = await Promise.all([
    getTraining(),
    getSettings(),
  ]);

  const heroSubtitle = settings.trainingHeroSubtitle || 'Elevate your skills with industry-leading modules designed for professional drivers and instructors.';
  const categories = [...new Set(allItems.map((i: any) => i.category).filter(Boolean))];

  const items = selectedCategory 
    ? allItems.filter((i: any) => i.category === selectedCategory)
    : allItems;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />
      <main style={{ flex: 1 }}>
        {/* Hero Section - Contact Hero Gradient & Perfect Center Alignment */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            padding: '5rem 2rem 4.25rem',
            textAlign: 'center',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fbbf24',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
              }}
            >
              CTSDA Academy
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                textAlign: 'center',
                margin: '0 auto 1rem',
                width: '100%',
              }}
            >
              Professional Training Center
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#cbd5e1',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.6,
                textAlign: 'center',
              }}
            >
              {heroSubtitle}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 1rem', boxSizing: 'border-box' }}>
          {/* Student Verification Widget on top of courses */}
          <StudentVerificationWidget />

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
              <h2 style={{ color: '#334155', marginBottom: '0.5rem' }}>Training modules coming soon</h2>
              <p>Check back shortly for our full library of training resources.</p>
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
                  <Link href="/training" style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: !selectedCategory ? '#2563eb' : DEFAULT_COLOR.bg, color: !selectedCategory ? 'white' : DEFAULT_COLOR.text, textDecoration: 'none' }}>
                    All Categories
                  </Link>
                  {categories.map((cat: any) => {
                    const c = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
                    const isSelected = selectedCategory === cat;
                    return (
                      <Link href={`/training?category=${encodeURIComponent(cat)}`} key={cat} style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: isSelected ? '#2563eb' : c.bg, color: isSelected ? 'white' : c.text, textDecoration: 'none' }}>
                        {cat}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
                {items.map((item: any) => {
                  const catStyle = CATEGORY_COLORS[item.category] || DEFAULT_COLOR;
                  return (
                    <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#e2e8f0' }}>
                        <img src={getValidImageUrl(item.imageUrl, item.category, item.title)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          {item.category && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: catStyle.bg, color: catStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {item.category}
                            </span>
                          )}
                          {item.durationMinutes && (
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                              ⏱️ {item.durationMinutes} mins
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                          {item.title}
                        </h3>

                        {item.description && (
                          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                            {item.description}
                          </p>
                        )}

                        <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                          <TrainingRegisterBtn trainingId={item.id} price={item.price || 'Free'} title={item.title} />
                        </div>
                      </div>
                    </div>
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
