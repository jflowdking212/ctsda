'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from '../confirm-dialog';

const BLOG_CATEGORIES = [
  'Business And Professional Development',
  'Technology and Digital Skills',
  'Health Safety and Compliance',
  'Personal Growth and Soft Skill',
  'Caregiving, Health and Social Care',
  'Training, Skills and Development',
];


export function BlogPanel({ 
  api,
  onSuccess,
  onError,
}: { 
  api: (path: string, init?: RequestInit) => Promise<Response>;
  onSuccess?: (title: string, message?: string) => void;
  onError?: (title: string, message?: string) => void;
}) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [current, setCurrent] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Custom Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    onConfirm: () => {},
  });

  function notify(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    if (type === 'success' && onSuccess) onSuccess('Success', message);
    if (type === 'error' && onError) onError('Error', message);
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }

  function showConfirm(opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => void;
  }) {
    setConfirmDialog({
      open: true,
      confirmLabel: opts.confirmLabel || 'Confirm',
      variant: opts.variant || 'danger',
      title: opts.title,
      message: opts.message,
      onConfirm: opts.onConfirm,
    });
  }

  function closeConfirm() {
    setConfirmDialog(d => ({ ...d, open: false }));
  }

  useEffect(() => {
    fetchPosts();
  }, [view]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api('/admin/blog');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      }
    } catch (err: any) {
      console.error('Failed to load blog posts', err);
    } finally {
      setLoading(false);
    }
  }

  const openNew = () => {
    setCurrent({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImg: '',
      category: '',
      isPublished: true,
    });
    setView('editor');
  };


  const openEdit = (p: any) => {
    setCurrent({
      ...p,
      category: p.category?.name || p.category || '',
      isPublished: p.isPublished === true || p.isPublished === 'true',
    });
    setView('editor');
  };

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(async (blob) => {
              if (blob) {
                const formData = new FormData();
                formData.append('file', blob, file.name || 'image.jpg');
                try {
                  const res = await api('/admin/upload', { method: 'POST', body: formData });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.url) setCurrent((prev: any) => ({ ...prev, featuredImg: data.url }));
                  } else {
                    notify('Upload failed: Server returned an error', 'error');
                  }
                } catch (err) {
                  console.error(err);
                  notify('Upload error: Failed to upload image', 'error');
                }
              }
            }, 'image/jpeg', 0.85);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: current.title,
      slug: current.slug || current.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      excerpt: current.excerpt,
      content: current.content,
      featuredImg: current.featuredImg || null,
      category: current.category || null,
      isPublished: Boolean(current.isPublished),
    };


    try {
      let res: Response;
      if (!current.id) {
        res = await api('/admin/blog', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        res = await api(`/admin/blog/${current.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save blog post');
      }

      notify(current.id ? 'Blog post updated successfully!' : 'Blog post published successfully!', 'success');
      setView('list');
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      notify(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: string) {
    const post = posts.find(p => p.id === id);
    showConfirm({
      title: 'Delete Blog Post?',
      message: `Are you sure you want to delete "${post?.title || 'this post'}"? This action will permanently remove it from the public blog.`,
      confirmLabel: 'Yes, Delete Post',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api(`/admin/blog/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete blog post');
          setPosts(posts.filter(p => p.id !== id));
          notify('Blog post deleted successfully.', 'success');
        } catch (err: any) {
          notify(`Delete failed: ${err.message}`, 'error');
        }
      },
    });
  }

  async function togglePublish(post: any) {
    const newStatus = !post.isPublished;
    try {
      const res = await api(`/admin/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (res.ok) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, isPublished: newStatus } : p));
        notify(newStatus ? 'Post published to public blog!' : 'Post moved to draft.', 'success');
      }
    } catch (err: any) {
      notify('Failed to update status', 'error');
    }
  }

  if (view === 'editor') {
    return (
      <div className="admin-section" style={{ maxWidth: '950px' }}>
        {toast && (
          <div style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 9999,
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}>
            {toast.message}
          </div>
        )}
        <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{current.id ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{current.id ? `Editing: ${current.title}` : 'Write and publish articles for the CTSDA Knowledge Center.'}</p>
          </div>
          <button className="admin-button" onClick={() => setView('list')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>
            ← Back to List
          </button>
        </div>

        <form onSubmit={savePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* TITLE & SLUG */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Article Title *</label>
              <input
                className="admin-input"
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.95rem' }}
                required
                placeholder="e.g. Navigating International Accreditation Standards in 2026"
                value={current.title || ''}
                onChange={e => {
                  const newTitle = e.target.value;
                  const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  setCurrent({
                    ...current,
                    title: newTitle,
                    slug: current.id ? (current.slug || autoSlug) : autoSlug,
                  });
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>URL Slug</label>
              <input
                className="admin-input"
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem', color: '#64748b' }}
                placeholder="auto-generated-slug"
                value={current.slug || ''}
                onChange={e => setCurrent({ ...current, slug: e.target.value })}
              />
            </div>
          </div>

          {/* EXCERPT */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Short Summary / Excerpt</label>
            <textarea
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '70px', fontSize: '0.9rem' }}
              placeholder="Brief teaser displayed on the blog card and in search engine previews..."
              value={current.excerpt || ''}
              onChange={e => setCurrent({ ...current, excerpt: e.target.value })}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Category</label>
            <select
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem', background: '#fff', color: current.category ? '#1e293b' : '#94a3b8' }}
              value={current.category || ''}
              onChange={e => setCurrent({ ...current, category: e.target.value })}
            >
              <option value="">— Select a category —</option>
              {BLOG_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>


          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Featured Cover Image</label>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Thumbnail preview */}
              <div style={{ width: '160px', height: '100px', borderRadius: '0.5rem', border: '2px dashed #cbd5e1', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {current.featuredImg ? (
                  <img src={current.featuredImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>No image chosen</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    📁 Choose Photo File
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />
                  </label>
                  {current.featuredImg && (
                    <button
                      type="button"
                      onClick={() => setCurrent({ ...current, featuredImg: '' })}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste direct image URL (e.g. /images/blog_road_safety.png or https://...)"
                  value={current.featuredImg || ''}
                  onChange={e => setCurrent({ ...current, featuredImg: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {/* MAIN ARTICLE CONTENT */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Article Body (HTML / Markdown supported) *</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['<h2>', '<p>', '<ul>', '<blockquote>', '<strong>'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const closeTag = tag.replace('<', '</');
                      const template = tag === '<ul>' ? '<ul>\n  <li>Point 1</li>\n  <li>Point 2</li>\n</ul>' : `${tag}Content${closeTag}`;
                      setCurrent({ ...current, content: (current.content || '') + '\n' + template });
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'monospace' }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '300px', fontSize: '0.95rem', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}
              required
              placeholder="Write the full article content here. You can use standard HTML tags like <h2>, <p>, <ul>, <li>, <blockquote>, etc."
              value={current.content || ''}
              onChange={e => setCurrent({ ...current, content: e.target.value })}
            />
          </div>

          {/* PUBLISH TOGGLE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <input
              type="checkbox"
              id="isPublished"
              checked={current.isPublished || false}
              onChange={e => setCurrent({ ...current, isPublished: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
            />
            <label htmlFor="isPublished" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
              Publish immediately (visible to the public at <span style={{ color: '#2563eb' }}>/blog/{current.slug || 'slug'}</span>)
            </label>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setView('list')}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.7rem 1.5rem', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.7rem 1.75rem', borderRadius: '0.375rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : current.id ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-section">
      {toast && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 9999,
          padding: '0.85rem 1.25rem',
          borderRadius: '0.5rem',
          backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontWeight: 500,
          fontSize: '0.9rem',
        }}>
          {toast.message}
        </div>
      )}

      <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Blog Posts & CMS</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage and publish articles to the public CTSDA Knowledge Center (/blog).</p>
        </div>
        <button
          onClick={openNew}
          style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          + New Article
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading articles...</div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📰</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>No Blog Articles Yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem', marginBottom: '1.25rem' }}>Create your first article to share news, standards, and educational insights with the public.</p>
          <button onClick={openNew} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}>
            Write First Article
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Article</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {p.featuredImg ? (
                        <img src={p.featuredImg} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '0.35rem', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '56px', height: '40px', background: '#f1f5f9', borderRadius: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', flexShrink: 0 }}>📰</div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{p.title}</span>
                          {(p.category?.name || p.category) && (
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                              {p.category?.name || p.category}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          <span style={{ color: '#2563eb' }}>/blog/{p.slug}</span>
                          {p.author && <span> • by {p.author.firstName} {p.author.lastName}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => togglePublish(p)}
                      title="Click to toggle status"
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: p.isPublished ? '#dcfce7' : '#fef3c7',
                        color: p.isPublished ? '#15803d' : '#b45309',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {p.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    {new Date(p.publishedAt || p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', color: '#334155', textDecoration: 'none', fontWeight: 600 }}
                      >
                        View ↗
                      </a>
                      <button
                        onClick={() => openEdit(p)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.375rem', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePost(p.id)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.375rem', color: '#b91c1c', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Confirm Dialog Modal */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
