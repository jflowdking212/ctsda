'use client';

import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImg?: string;
  publishedAt?: string;
  createdAt: string;
  category?: { name: string; slug?: string } | string | null;
}

export function BlogCard({ post }: { post: BlogPost }) {
  const categoryName = typeof post.category === 'object' && post.category !== null 
    ? post.category.name 
    : (post.category || 'Article');

  function fixImgUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const KNOWN_HOSTS = [
      'https://ctsda.acecoterieconsulting.com', 'http://ctsda.acecoterieconsulting.com',
      'https://ctsdamerica.com', 'https://www.ctsdamerica.com', 'http://ctsdamerica.com',
      'http://localhost:4000',
    ];
    for (const host of KNOWN_HOSTS) {
      if (url.startsWith(host)) { url = url.slice(host.length); break; }
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.replace(/^\/?api\/uploads\//, '').replace(/^\/?uploads\//, '');
    return `/api/uploads/${clean}`;
  }

  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
        border: '1px solid rgba(226,232,240,0.8)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)';
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          height: '220px',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
        }}
      >
        {post.featuredImg ? (
          <img
            src={fixImgUrl(post.featuredImg)}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseOver={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)')}
            onMouseOut={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#1e40af',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          {categoryName}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Date row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#64748b',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <time dateTime={post.publishedAt || post.createdAt}>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.4 }}>
          <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
            {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt}
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <Link
            href={`/blog/${post.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0ea5e9',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            Read Full Article
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
