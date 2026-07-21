'use client';

import React, { useState, useEffect } from 'react';

const S = {
  panel: { padding: '2rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  primaryBtn: { padding: '0.6rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#0f766e', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
  secondaryBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const, color: '#334155' },
  input: { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', resize: 'vertical' as const, minHeight: 300, fontFamily: 'inherit', boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' } as React.CSSProperties,
  fieldset: { border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' } as React.CSSProperties,
};

export function BlogPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [current, setCurrent] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (view === 'list') loadPosts(); }, [view]);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await api('/blog');
      setPosts(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const method = current.id ? 'PUT' : 'POST';
      const path = current.id ? `/admin/blog/${current.id}` : '/admin/blog';
      await api(path, { method, body: JSON.stringify(current) });
      setView('list');
    } catch (err: any) {
      setError(err?.message || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  }

  const openNew = () => { setCurrent({ isPublished: false }); setView('editor'); };
  const openEdit = (p: any) => { setCurrent(p); setView('editor'); };

  if (view === 'editor') {
    return (
      <div style={S.panel}>
        <div style={S.header}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              {current.id ? 'Edit Post' : 'New Post'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {current.id ? `Editing: ${current.title}` : 'Create a new article for the public blog.'}
            </p>
          </div>
          <button style={S.secondaryBtn} onClick={() => setView('list')}>← Back to Posts</button>
        </div>

        {error && (
          <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={savePost} style={S.fieldset}>
          <div>
            <label style={S.label}>Post Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              style={S.input}
              type="text"
              required
              placeholder="Enter article title..."
              value={current.title || ''}
              onChange={e => setCurrent({ ...current, title: e.target.value })}
            />
          </div>

          <div>
            <label style={S.label}>Slug <span style={{ color: '#94a3b8', fontWeight: 400 }}>(auto-generated if blank)</span></label>
            <input
              style={S.input}
              type="text"
              placeholder="e.g. my-article-slug"
              value={current.slug || ''}
              onChange={e => setCurrent({ ...current, slug: e.target.value })}
            />
          </div>

          <div>
            <label style={S.label}>Excerpt / Summary</label>
            <input
              style={S.input}
              type="text"
              placeholder="Short summary shown on blog listing page..."
              value={current.excerpt || ''}
              onChange={e => setCurrent({ ...current, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label style={S.label}>Content (HTML) <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea
              style={S.textarea}
              required
              placeholder="Write your article content here. You can use HTML tags for formatting."
              value={current.content || ''}
              onChange={e => setCurrent({ ...current, content: e.target.value })}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>Tip: Wrap paragraphs in &lt;p&gt; tags. Use &lt;h2&gt;, &lt;h3&gt; for headings, &lt;ul&gt;/&lt;li&gt; for lists.</p>
          </div>

          <div>
            <label style={S.label}>Featured Image URL</label>
            <input
              style={S.input}
              type="url"
              placeholder="https://example.com/image.jpg"
              value={current.featuredImg || ''}
              onChange={e => setCurrent({ ...current, featuredImg: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <input
              id="publish-toggle"
              type="checkbox"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
              checked={current.isPublished || false}
              onChange={e => setCurrent({ ...current, isPublished: e.target.checked })}
            />
            <div>
              <label htmlFor="publish-toggle" style={{ fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Publish immediately</label>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>When checked, this post will be visible to the public.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : current.id ? 'Update Post' : 'Publish Post'}
            </button>
            <button type="button" onClick={() => setView('list')} style={S.secondaryBtn}>Discard</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Blog Posts</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage and publish articles for the public blog.</p>
        </div>
        <button style={S.primaryBtn} onClick={openNew}>+ New Post</button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No posts yet.</p>
          <p style={{ fontSize: '0.875rem' }}>Click <strong style={{ color: '#0f766e' }}>+ New Post</strong> to create your first article.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Title</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Created</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{p.title}</div>
                    {p.excerpt && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{p.excerpt.slice(0, 80)}...</div>}
                  </td>
                  <td style={S.td}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: p.isPublished ? '#dcfce7' : '#fef3c7', color: p.isPublished ? '#16a34a' : '#92400e' }}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ ...S.td, color: '#64748b', fontSize: '0.875rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
