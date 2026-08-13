'use client';

import React, { useState, useEffect } from 'react';

const MOCK_MODULES = [
  { id: '1', title: 'Introduction to Quality Assurance', description: 'Basics of QA for institutions.', type: 'video', isPublished: true, createdAt: '2024-07-15T10:00:00Z' },
  { id: '2', title: 'Evaluator Guidelines 2024', description: 'Updated guidelines for this year.', type: 'document', isPublished: true, createdAt: '2024-06-20T14:30:00Z' },
  { id: '3', title: 'Advanced Assessment Techniques', description: 'For experienced evaluators.', type: 'video', isPublished: false, createdAt: '2024-08-01T09:15:00Z' },
];

export function TrainingPanel({
  api,
  onSuccess,
  onError,
}: {
  api: (path: string, init?: RequestInit) => Promise<Response>;
  onSuccess?: (title: string, message?: string) => void;
  onError?: (title: string, message?: string) => void;
}) {
  const [modules, setModules] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [current, setCurrent] = useState<Partial<any>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CATEGORY_IMAGES: Record<string, string> = {
    'Safety': '/uploads/road-safety.jpg',
    'Road Safety': '/uploads/road-safety.jpg',
    'Professional Development': '/uploads/instructor-training.jpg',
    'Instructor Training': '/uploads/instructor-training.jpg',
    'Compliance': '/uploads/compliance-training.jpg',
    'Compliance & Regulations': '/uploads/compliance-training.jpg',
    'Vehicle Inspection': '/uploads/vehicle-inspection.jpg',
    'First Aid': '/uploads/first-aid.jpg',
    'Advanced Driving': '/uploads/advanced-driving.jpg',
  };

  const getValidImageUrl = (url?: string | null, category?: string, title?: string) => {
    let targetUrl = url;
    if (!targetUrl) {
      if (category && CATEGORY_IMAGES[category]) {
        targetUrl = CATEGORY_IMAGES[category];
      } else {
        const lowerCategory = (category || '').toLowerCase();
        const lowerTitle = (title || '').toLowerCase();
        if (lowerCategory.includes('safety') || lowerTitle.includes('safety') || lowerTitle.includes('road')) targetUrl = '/uploads/road-safety.jpg';
        else if (lowerCategory.includes('professional') || lowerCategory.includes('instructor') || lowerTitle.includes('instructor')) targetUrl = '/uploads/instructor-training.jpg';
        else if (lowerCategory.includes('compliance') || lowerTitle.includes('compliance') || lowerTitle.includes('hazmat') || lowerTitle.includes('hazardous')) targetUrl = '/uploads/compliance-training.jpg';
        else if (lowerCategory.includes('inspection') || lowerTitle.includes('inspection') || lowerTitle.includes('vehicle')) targetUrl = '/uploads/vehicle-inspection.jpg';
        else if (lowerCategory.includes('first aid') || lowerTitle.includes('aid') || lowerTitle.includes('first')) targetUrl = '/uploads/first-aid.jpg';
        else if (lowerCategory.includes('driving') || lowerTitle.includes('defensive') || lowerTitle.includes('advanced') || lowerTitle.includes('driving')) targetUrl = '/uploads/advanced-driving.jpg';
        else targetUrl = '/uploads/road-safety.jpg';
      }
    }
    
    const getApiBase = () => {
      if (typeof window !== 'undefined' && window.location.origin) {
        return `${window.location.origin}/api`;
      }
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
      return '/api';
    };

    const apiBase = getApiBase().replace(/\/$/, '');

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      if (targetUrl.includes('localhost:4000')) {
        return targetUrl.replace('http://localhost:4000', apiBase);
      }
      return targetUrl;
    }

    const cleanPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    return `${apiBase}${cleanPath}`;
  };

  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await api('/admin/training');
        const data = await res.json();
        if (data && Array.isArray(data)) setModules(data);
      } catch (err) {
        console.error('Failed to load training modules', err);
      }
    }
    fetchModules();
  }, [api, view]);

  const openNew = () => { setCurrent({ isPublished: false, category: 'Road Safety', price: 0 }); setView('editor'); };
  const openEdit = (m: any) => { setCurrent(m); setView('editor'); };

  async function saveModule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      title: current.title,
      description: current.description,
      category: current.category,
      imageUrl: current.imageUrl,
      videoUrl: current.videoUrl,
      resourceUrl: current.resourceUrl,
      duration: (current.durationMinutes || current.duration || '').toString(),
      price: Number(current.price) || 0,
      isPublished: current.isPublished || false
    };
    
    try {
      if (!current.id) {
        const res = await api('/admin/training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to create');
        }
        const saved = await res.json();
        setModules([saved, ...modules]);
      } else {
        const res = await api(`/admin/training/${current.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to update');
        }
        const saved = await res.json();
        setModules(modules.map(m => m.id === current.id ? saved : m));
      }
      setView('list');
      (onSuccess || (() => {}))('Saved!', current.id ? 'Training module updated.' : 'Training module created.');
    } catch (err: any) {
      console.error(err);
      (onError || ((t: string) => alert(t)))('Error saving training module', err.message || 'Please check all fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(id: string) {
    if (!confirm('Delete this training module?')) return;
    try {
      const res = await api(`/admin/training/${id}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete');
      setModules(modules.filter(m => m.id !== id));
      (onSuccess || (() => {}))('Deleted', 'Training module removed.');
    } catch (err) {
      (onError || ((t: string) => alert(t)))('Delete failed', 'Could not remove this module.');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api('/admin/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCurrent({ ...current, imageUrl: data.url });
    } catch (err) {
      console.error(err);
      (onError || ((t: string) => alert(t)))('Upload failed', 'Could not upload the image. Try again.');
    } finally {
      setUploading(false);
    }
  }

  if (view === 'editor') {
    return (
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>{current.id ? 'Edit Module' : 'New Module'}</h2>
            <p>{current.id ? `Editing: ${current.title}` : 'Create a new training resource.'}</p>
          </div>
          <button className="admin-button" onClick={() => setView('list')}>← Back</button>
        </div>
        <form onSubmit={saveModule} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Title</label>
              <input className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} required value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Category</label>
              <select style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.category || ''} onChange={e => setCurrent({...current, category: e.target.value})}>
                <option value="Road Safety">Road Safety</option>
                <option value="Instructor Training">Instructor Training</option>
                <option value="Compliance">Compliance</option>
                <option value="Vehicle Inspection">Vehicle Inspection</option>
                <option value="First Aid">First Aid</option>
                <option value="Advanced Driving">Advanced Driving</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Description</label>
            <textarea style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '100px' }} required value={current.description || ''} onChange={e => setCurrent({...current, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="url" className="admin-input" style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.imageUrl || ''} onChange={e => setCurrent({...current, imageUrl: e.target.value})} placeholder="https://" />
                <label className="admin-button" style={{ cursor: 'pointer', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {uploading ? '...' : 'Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              {current.imageUrl && (
                <img src={getValidImageUrl(current.imageUrl) || ''} alt="Preview" style={{ marginTop: '0.5rem', height: '100px', objectFit: 'cover', borderRadius: '0.375rem' }} />
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Resource URL</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.resourceUrl || ''} onChange={e => setCurrent({...current, resourceUrl: e.target.value})} placeholder="https://" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Video URL</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.videoUrl || ''} onChange={e => setCurrent({...current, videoUrl: e.target.value})} placeholder="https://" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Duration</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.durationMinutes || current.duration || ''} onChange={e => setCurrent({...current, duration: e.target.value})} placeholder="e.g. 45 mins" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Price ($)</label>
              <input type="number" step="0.01" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} required value={current.price || 0} onChange={e => setCurrent({...current, price: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="checkbox" id="isPublished" checked={current.isPublished || false} onChange={e => setCurrent({...current, isPublished: e.target.checked})} />
            <label htmlFor="isPublished" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Publish immediately</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="admin-button primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Module'}</button>
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
          <h2>Training Modules</h2>
          <p>Manage training modules and resources for applicants.</p>
        </div>
        <button className="admin-button primary" onClick={openNew}>+ New Module</button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Module</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={getValidImageUrl(m.imageUrl, m.category, m.title)} alt={m.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.375rem' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{m.description}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>{m.category}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>${Number(m.price || 0).toFixed(2)}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: m.isPublished ? '#dcfce7' : '#fef3c7', color: m.isPublished ? '#15803d' : '#b45309' }}>
                    {m.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="admin-button" onClick={() => openEdit(m)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Edit</button>
                    <button className="admin-button danger" onClick={() => deleteModule(m.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: '#ffffff' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
