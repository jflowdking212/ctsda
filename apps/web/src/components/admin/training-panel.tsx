'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from '../confirm-dialog';

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

  const TRAINING_CATEGORIES = [
    'Business And Professional Development',
    'Technology and Digital Skills',
    'Health Safety and Compliance',
    'Personal Growth and Soft Skill',
    'Caregiving, Health and Social Care',
    'Training, Skills and Development',
  ];

  const CATEGORY_IMAGES: Record<string, string> = {
    'Business And Professional Development': '/uploads/instructor-training.jpg',
    'Technology and Digital Skills': '/uploads/vehicle-inspection.jpg',
    'Health Safety and Compliance': '/uploads/compliance-training.jpg',
    'Personal Growth and Soft Skill': '/uploads/first-aid.jpg',
    'Caregiving, Health and Social Care': '/uploads/first-aid.jpg',
    'Training, Skills and Development': '/uploads/road-safety.jpg',
  };

  const getValidImageUrl = (url?: string | null, category?: string, title?: string) => {
    let targetUrl = url;
    if (!targetUrl) {
      if (category && CATEGORY_IMAGES[category]) {
        targetUrl = CATEGORY_IMAGES[category];
      } else {
        const lowerCategory = (category || '').toLowerCase();
        const lowerTitle = (title || '').toLowerCase();
        if (lowerCategory.includes('tech') || lowerCategory.includes('digital') || lowerTitle.includes('digital') || lowerTitle.includes('tech')) targetUrl = '/uploads/vehicle-inspection.jpg';
        else if (lowerCategory.includes('business') || lowerCategory.includes('professional') || lowerTitle.includes('business') || lowerTitle.includes('professional')) targetUrl = '/uploads/instructor-training.jpg';
        else if (lowerCategory.includes('health') || lowerCategory.includes('safety') || lowerCategory.includes('compliance') || lowerTitle.includes('safety') || lowerTitle.includes('compliance')) targetUrl = '/uploads/compliance-training.jpg';
        else if (lowerCategory.includes('care') || lowerCategory.includes('social') || lowerTitle.includes('care')) targetUrl = '/uploads/first-aid.jpg';
        else if (lowerCategory.includes('growth') || lowerCategory.includes('soft') || lowerTitle.includes('growth') || lowerTitle.includes('skill')) targetUrl = '/uploads/first-aid.jpg';
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

    const KNOWN_HOSTS = [
      'https://ctsda.acecoterieconsulting.com', 'http://ctsda.acecoterieconsulting.com',
      'https://ctsdamerica.com', 'https://www.ctsdamerica.com', 'http://ctsdamerica.com',
      'http://localhost:4000',
    ];
    for (const host of KNOWN_HOSTS) {
      if (targetUrl.startsWith(host)) { targetUrl = targetUrl.slice(host.length); break; }
    }

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
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

  const openNew = () => { setCurrent({ isPublished: false, category: 'Business And Professional Development', price: 0 }); setView('editor'); };
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
    const mod = modules.find(m => m.id === id);
    showConfirm({
      title: 'Delete Training Module?',
      message: `Are you sure you want to delete "${mod?.title || 'this module'}"? This action cannot be undone.`,
      confirmLabel: 'Yes, Delete Module',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api(`/admin/training/${id}/delete`, { method: 'POST' });
          if (!res.ok) throw new Error('Failed to delete');
          setModules(modules.filter(m => m.id !== id));
          (onSuccess || (() => {}))('Deleted', 'Training module removed.');
        } catch (err) {
          (onError || ((t: string) => alert(t)))('Delete failed', 'Could not remove this module.');
        }
      },
    });
  }

  function handleImageFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
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
                    if (data.url) setCurrent((prev: any) => ({ ...prev, imageUrl: data.url }));
                  } else {
                    (onError || ((t: string) => alert(t)))('Upload failed', 'Server returned an error.');
                  }
                } catch (err) {
                  console.error(err);
                  (onError || ((t: string) => alert(t)))('Upload error', 'Failed to upload image.');
                }
              }
              setUploading(false);
            }, 'image/jpeg', 0.85);
          } else {
            setUploading(false);
          }
        };
        img.onerror = () => setUploading(false);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Title *</label>
              <input className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} required value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} placeholder="e.g. Defensive Driving Fundamentals" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Category</label>
              <select style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.category || ''} onChange={e => setCurrent({...current, category: e.target.value})}>
                {TRAINING_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Description *</label>
            <textarea style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '100px' }} required value={current.description || ''} onChange={e => setCurrent({...current, description: e.target.value})} placeholder="Detailed course description..." />
          </div>

          {/* PICTURE / IMAGE SELECTION & UPLOAD */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              🖼️ Training Cover Picture
            </label>
            
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Image Preview Box */}
              <div style={{ width: '180px', height: '110px', borderRadius: '0.5rem', border: '2px dashed #cbd5e1', background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {current.imageUrl ? (
                  <img src={getValidImageUrl(current.imageUrl, current.category, current.title)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>No image selected (Category default will be used)</span>
                )}
              </div>

              {/* Upload & Options */}
              <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    📁 {uploading ? 'Processing...' : 'Upload Image File'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileSelect} disabled={uploading} />
                  </label>
                  {current.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setCurrent({ ...current, imageUrl: '' })}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                {/* Preset Suggestions */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Or pick a standard preset:</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { label: '💼 Business & Pro', url: '/uploads/instructor-training.jpg' },
                      { label: '💻 Tech & Digital', url: '/uploads/vehicle-inspection.jpg' },
                      { label: '🛡️ Health & Safety', url: '/uploads/compliance-training.jpg' },
                      { label: '🌱 Personal Growth', url: '/uploads/first-aid.jpg' },
                      { label: '🏥 Caregiving', url: '/uploads/first-aid.jpg' },
                      { label: '🎯 Training & Skills', url: '/uploads/road-safety.jpg' },
                    ].map(preset => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setCurrent({ ...current, imageUrl: preset.url })}
                        style={{
                          background: current.imageUrl === preset.url ? '#eff6ff' : '#ffffff',
                          border: current.imageUrl === preset.url ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          color: current.imageUrl === preset.url ? '#1d4ed8' : '#334155',
                          borderRadius: '0.3rem',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Option */}
                <div>
                  <input
                    type="text"
                    placeholder="Or enter custom image URL (https://...)"
                    value={current.imageUrl?.startsWith('data:') ? '' : (current.imageUrl || '')}
                    onChange={e => setCurrent({ ...current, imageUrl: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.8rem', background: '#ffffff' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Resource / PDF URL</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.resourceUrl || ''} onChange={e => setCurrent({...current, resourceUrl: e.target.value})} placeholder="https://" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Video URL (YouTube/Vimeo)</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.videoUrl || ''} onChange={e => setCurrent({...current, videoUrl: e.target.value})} placeholder="https://" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Duration</label>
              <input type="text" className="admin-input" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={current.durationMinutes || current.duration || ''} onChange={e => setCurrent({...current, duration: e.target.value})} placeholder="e.g. 45 mins" />
            </div>
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
