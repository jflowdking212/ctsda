import { PublicPage } from '../../components/public-shell';
import { BlogCard } from '../../components/blog-card';

export const metadata = {
  title: 'Blog & Insights | CTSDA',
  description: 'Latest news, updates, and professional articles from the CTSDA on driver training standards.',
};

async function getPosts() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/blog`, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getSettings() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/settings/public`, { next: { revalidate: 30 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    getPosts(),
    getSettings(),
  ]);

  const heroSubtitle = settings.blogHeroSubtitle || 'Discover articles, research papers, and policy announcements from international accreditation leaders.';

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Hero Section - Contact Hero Gradient */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '5rem 2rem 4.25rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
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
              }}
            >
              Latest News & Insights
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              CTSDA Knowledge Center
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#cbd5e1',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem 0' }}>
          {posts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📰</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                No posts published yet
              </h2>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                Check back soon for the latest news, regulatory updates, and educational insights from CTSDA.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '2rem',
              }}
            >
              {posts.map((post: any) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </PublicPage>
  );
}
