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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            padding: '6rem 2rem 5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle dot pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 1rem',
                background: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: '1.5rem',
              }}
            >
              RESOURCES & UPDATES
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                marginBottom: '1.5rem',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              The <span style={{ color: '#38bdf8' }}>CTSDA</span> Blog
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Expert insights, industry news, and comprehensive guides dedicated to advancing professional driver
              training and road safety standards.
            </p>
          </div>
        </section>

        {/* Grid */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '-3rem auto 0',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 20,
          }}
        >
          {posts.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '4rem',
                borderRadius: '1rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📝</span>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.5rem' }}>
                No articles published yet
              </h2>
              <p style={{ color: '#64748b' }}>Check back soon for the latest insights from our experts.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
