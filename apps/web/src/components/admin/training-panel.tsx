'use client';

import React, { useState, useEffect } from 'react';

const S = {
  panel: { padding: '2rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  primaryBtn: { padding: '0.6rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
  secondaryBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const, color: '#334155' },
  input: { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', resize: 'vertical' as const, minHeight: 160, fontFamily: 'inherit', boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' } as React.CSSProperties,
  fieldset: { border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' } as React.CSSProperties,
};

type TrainingItem = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  videoUrl?: string;
  resourceUrl?: string;
  duration?: string;
  price?: number | string;
  isPublished: boolean;
  createdAt?: string;
};

const CATEGORIES = ['General', 'Road Safety', 'Vehicle Inspection', 'Instructor Training', 'Compliance', 'First Aid', 'Advanced Driving'];

export function TrainingPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [current, setCurrent] = useState<TrainingItem>({ title: '', isPublished: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (view === 'list') loadItems(); }, [view]);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await api('/training');
      setItems(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const method = current.id ? 'PUT' : 'POST';
      const path = current.id ? `/admin/training/${current.id}` : '/admin/training';
      await api(path, { method, body: JSON.stringify(current) });
      setView('list');
    } catch (err: any) {
      setError(err?.message || 'Failed to save training item.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this training item?')) return;
    await api(`/admin/training/${id}`, { method: 'DELETE' });
    await loadItems();
  }

  const openNew = () => { setCurrent({ title: '', isPublished: false }); setView('editor'); };
  const openEdit = (item: TrainingItem) => { setCurrent(item); setView('editor'); };

  if (view === 'editor') {
    return (
      <div style={S.panel}>
        <div style={S.header}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              {current.id ? 'Edit Training' : 'New Training'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {current.id ? `Editing: ${current.title}` : 'Add a new training module or resource.'}
            </p>
          </div>
          <button style={S.secondaryBtn} onClick={() => setView('list')}>← Back to Training</button>
        </div>

        {error && (
          <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={saveItem} style={S.fieldset}>
          <div>
            <label style={S.label}>Training Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              style={S.input}
              type="text"
              required
              placeholder="e.g. Road Safety Fundamentals"
              value={current.title}
              onChange={e => setCurrent({ ...current, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={S.label}>Category</label>
              <select
                style={S.select}
                value={current.category || ''}
                onChange={e => setCurrent({ ...current, category: e.target.value })}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Duration (e.g. 2h 30m)</label>
              <input
                style={S.input}
                type="text"
                placeholder="e.g. 1h 45m"
                value={current.duration || ''}
                onChange={e => setCurrent({ ...current, duration: e.target.value })}
              />
            </div>
            <div>
              <label style={S.label}>Price (USD)</label>
              <input
                style={S.input}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 0.00 for free"
                value={current.price !== undefined ? current.price : 0}
                onChange={e => setCurrent({ ...current, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label style={S.label}>Description</label>
            <textarea
              style={S.textarea}
              placeholder="Describe what learners will gain from this training module..."
              value={current.description || ''}
              onChange={e => setCurrent({ ...current, description: e.target.value })}
            />
          </div>

          <div>
            <label style={S.label}>Video URL</label>
            <input
              style={S.input}
              type="url"
              placeholder="https://youtube.com/watch?v=... or hosted video URL"
              value={current.videoUrl || ''}
              onChange={e => setCurrent({ ...current, videoUrl: e.target.value })}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>Paste a YouTube, Vimeo, or direct MP4 URL.</p>
          </div>

          <div>
            <label style={S.label}>Resource / Download URL</label>
            <input
              style={S.input}
              type="url"
              placeholder="https://example.com/handbook.pdf"
              value={current.resourceUrl || ''}
              onChange={e => setCurrent({ ...current, resourceUrl: e.target.value })}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>Optional PDF, slide deck, or other downloadable resource.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <input
              id="training-publish"
              type="checkbox"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
              checked={current.isPublished}
              onChange={e => setCurrent({ ...current, isPublished: e.target.checked })}
            />
            <div>
              <label htmlFor="training-publish" style={{ fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Publish to public training page</label>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>When checked, this module will be visible to all site visitors.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : current.id ? 'Update Training' : 'Add Training'}
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Training Resources</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage training modules, videos, and downloadable resources.</p>
        </div>
        <button style={S.primaryBtn} onClick={openNew}>+ New Training</button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>Loading training resources...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No training modules yet.</p>
          <p style={{ fontSize: '0.875rem' }}>Click <strong style={{ color: '#7c3aed' }}>+ New Training</strong> to add your first module.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Title</th>
                <th style={S.th}>Category</th>
                <th style={S.th}>Duration</th>
                <th style={S.th}>Price</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{item.title}</div>
                    {item.description && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{item.description.slice(0, 70)}...</div>}
                  </td>
                  <td style={S.td}>
                    {item.category ? (
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                        {item.category}
                      </span>
                    ) : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={{ ...S.td, color: '#64748b', fontSize: '0.875rem' }}>{item.duration || '—'}</td>
                  <td style={{ ...S.td, color: '#64748b', fontSize: '0.875rem' }}>
                    {item.price && Number(item.price) > 0 ? `$${Number(item.price).toFixed(2)}` : 'Free'}
                  </td>
                  <td style={S.td}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: item.isPublished ? '#dcfce7' : '#fef3c7', color: item.isPublished ? '#16a34a' : '#92400e' }}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(item)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteItem(item.id!)} style={{ padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
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
    </div>
  );
}
