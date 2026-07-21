import { PublicPage } from '../../../components/public-shell';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getPost(slug: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/blog/${slug}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch post');
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found | CTSDA' };
  return {
    title: `${post.title} | CTSDA Blog`,
    description: post.excerpt || `Read ${post.title} on the CTSDA Blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImg ? [post.featuredImg] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) notFound();

  const displayDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(displayDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* Article Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Blog
            </Link>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <time dateTime={displayDate}>{formattedDate}</time>
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#475569', flexShrink: 0 }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                CTSDA Editorial Team
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#475569', flexShrink: 0 }} />
              <span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Article</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div style={{ maxWidth: '820px', margin: '-2rem auto 5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            {/* Featured Image */}
            {post.featuredImg && (
              <div style={{ height: '420px', overflow: 'hidden' }}>
                <img
                  src={post.featuredImg}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Content */}
            <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem)' }}>
              {post.excerpt && (
                <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#334155', borderLeft: '4px solid #10b981', paddingLeft: '1.25rem', marginBottom: '2.5rem', fontStyle: 'italic' }}>
                  {post.excerpt}
                </p>
              )}
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Author / CTA Card */}
          <div style={{ marginTop: '2.5rem', padding: '2rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '1rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
              C
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#064e3b', marginBottom: '0.25rem' }}>CTSDA Editorial Team</div>
              <p style={{ color: '#065f46', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                This article was prepared by the CTSDA's professional standards team. The CTSDA is a private, independent accreditation body dedicated to advancing excellence in driver training and road safety education.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '0.625rem', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to All Articles
            </Link>
          </div>
        </div>
      </main>
    </PublicPage>
  );
}
