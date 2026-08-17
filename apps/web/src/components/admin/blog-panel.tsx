'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from '../confirm-dialog';

const MOCK_POSTS = [
  { id: '1', title: 'New Accreditation Standards for 2024', slug: 'new-standards-2024', excerpt: 'We are updating our evaluation criteria...', isPublished: true, createdAt: '2024-07-15T10:00:00Z' },
  { id: '2', title: 'Why Quality Assurance Matters', slug: 'why-qa-matters', excerpt: 'A deep dive into institutional quality...', isPublished: true, createdAt: '2024-06-20T14:30:00Z' },
  { id: '3', title: 'Upcoming Webinars for Evaluators', slug: 'upcoming-webinars', excerpt: 'Join our expert-led sessions this fall.', isPublished: false, createdAt: '2024-08-01T09:15:00Z' },
];

export function BlogPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [posts, setPosts] = useState<any[]>(MOCK_POSTS);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [current, setCurrent] = useState<any>({});
  const [saving, setSaving] = useState(false);

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
    async function fetchPosts() {
      try {
        const res = await api('/blog');
        const data = await res.json();
        if (data && data.length > 0) setPosts(data);
      } catch (err) {
        // Fallback to mock data
      }
    }
    fetchPosts();
  }, [api, view]);

  const openNew = () => { setCurrent({ isPublished: false }); setView('editor'); };
  const openEdit = (p: any) => { setCurrent(p); setView('editor'); };

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Mock save
    setTimeout(() => {
      if (!current.id) {
        setPosts([{ ...current, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...posts]);
      } else {
        setPosts(posts.map(p => p.id === current.id ? current : p));
      }
      setSaving(false);
      setView('list');
    }, 600);
  }

  async function deletePost(id: string) {
    const post = posts.find(p => p.id === id);
    showConfirm({
      title: 'Delete Blog Post?',
      message: `Are you sure you want to delete "${post?.title || 'this post'}"? This action cannot be undone.`,
      confirmLabel: 'Yes, Delete Post',
      variant: 'danger',
      onConfirm: () => {
        closeConfirm();
        setPosts(posts.filter(p => p.id !== id));
      },
    });
  }

  if (view === 'editor') {
    return (
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>{current.id ? 'Edit Post' : 'New Post'}</h2>
            <p>{current.id ? `Editing: ${current.title}` : 'Create a new article for the public blog.'}</p>
          </div>
          <button className="admin-button" onClick={() => setView('list')}>← Back</button>
        </div>
        <form onSubmit={savePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Title</label>
            <input className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} required value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Content</label>
            <textarea style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '200px' }} required value={current.content || ''} onChange={e => setCurrent({...current, content: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="checkbox" id="isPublished" checked={current.isPublished || false} onChange={e => setCurrent({...current, isPublished: e.target.checked})} />
            <label htmlFor="isPublished" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Publish immediately</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="admin-button primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</button>
            <button className="admin-button" type="button" onClick={() => setView('list')}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Blog Posts</h2>
          <p>Manage and publish articles for the public blog.</p>
        </div>
        <button className="admin-button primary" onClick={openNew}>+ New Post</button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Title</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.excerpt || p.slug}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: p.isPublished ? '#dcfce7' : '#fef3c7', color: p.isPublished ? '#15803d' : '#b45309' }}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="admin-button" onClick={() => openEdit(p)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Edit</button>
                    <button className="admin-button danger" onClick={() => deletePost(p.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: '#ffffff' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
