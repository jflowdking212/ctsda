'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../confirm-dialog';

export type StudentCertificate = {
  id: string;
  studentName: string;
  studentEmail?: string;
  institutionName: string;
  courseProgram: string;
  certificateNumber: string;
  verificationToken: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  grade?: string;
  qrCodeUrl?: string;
  createdAt: string;
};

type PanelProps = {
  api?: (path: string, options?: RequestInit) => Promise<Response>;
};

export default function StudentVerificationPanel({ api }: PanelProps) {
  const fetchApi = api || (async (path: string, options: RequestInit = {}) => {
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('ctsda_admin_session') || '' : '';
    const headers = new Headers(options.headers || {});
    if (sessionId) headers.set('x-session-id', sessionId);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'include' });
  });
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Custom Confirm Dialog State
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

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCert, setEditingCert] = useState<StudentCertificate | null>(null);
  const initialForm = {
    studentName: '',
    studentEmail: '',
    institutionName: '',
    courseProgram: '',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    doesNotExpire: false,
    grade: '',
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [certRes, instRes] = await Promise.all([
        fetchApi('/students/all'),
        fetchApi('/institutions'),
      ]);

      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(Array.isArray(certData) ? certData : []);
      }
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstitutions(Array.isArray(instData) ? instData : []);
      }
    } catch {
      setError('Failed to load student certificates data.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetchApi('/students/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to issue student certificate');
      }

      setMessage(`Student certificate issued successfully for "${data.studentName}"!`);
      setShowModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error issuing student certificate.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(cert: StudentCertificate) {
    const action = cert.status === 'active' ? 'suspend' : 'reactivate';
    try {
      const res = await fetchApi(`/students/${cert.id}/${action}`, { method: 'POST' });
      if (res.ok) {
        setMessage(`Student Certificate status updated to ${action}ed.`);
        await loadData();
      }
    } catch {
      setError('Failed to update certificate status.');
    }
  }

  const [newExpiryDate, setNewExpiryDate] = useState('');

  async function handleUpdateExpiry(clear = false) {
    if (!editingCert) return;
    const expiresAt = clear ? '' : newExpiryDate;
    try {
      const res = await fetchApi(`/students/${editingCert.id}/update-expiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt }),
      });
      if (res.ok) {
        setMessage(`Expiry status updated for ${editingCert.studentName}.`);
        setEditingCert(null);
        await loadData();
      }
    } catch {
      setError('Failed to update expiry date.');
    }
  }

  async function handleDelete(cert: StudentCertificate) {
    showConfirm({
      title: 'Delete Student Certificate?',
      message: `Are you sure you want to permanently delete the student certificate for "${cert.studentName}" (${cert.certificateNumber})? This action cannot be undone.`,
      confirmLabel: 'Yes, Delete Certificate',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await fetchApi(`/students/${cert.id}/delete`, { method: 'POST' });
          if (res.ok) {
            setMessage(`Student Certificate deleted.`);
            await loadData();
          } else {
            setError('Failed to delete certificate.');
          }
        } catch {
          setError('Failed to delete certificate.');
        }
      },
    });
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseProgram.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCerts = certificates.length;
  const activeCerts = certificates.filter(c => c.status === 'active').length;
  const suspendedCerts = certificates.filter(c => c.status === 'suspended').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {message && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.875rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Student Certificates</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalCerts}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Certificates</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>{activeCerts}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspended Certificates</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{suspendedCerts}</div>
        </div>
      </div>

      {/* Search & Filter Controls with Issue Certificate Action */}
      <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by student name, certificate number, course, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '240px', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Issue Student Certificate
        </button>
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading student certificates...</div>
        ) : filteredCertificates.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No student certificates found matching filter.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Student Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Course Program</th>
                <th style={{ padding: '0.85rem 1rem' }}>Institution</th>
                <th style={{ padding: '0.85rem 1rem' }}>Certificate Number</th>
                <th style={{ padding: '0.85rem 1rem' }}>Issue / Expiry Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{cert.studentName}</div>
                    {cert.studentEmail && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cert.studentEmail}</div>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                    {cert.courseProgram}
                    {cert.grade && <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563eb' }}>Grade: {cert.grade}</span>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                    {cert.institutionName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {cert.certificateNumber}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <div>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                    {cert.expiryDate && <div>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</div>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      backgroundColor: cert.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: cert.status === 'active' ? '#166534' : '#92400e',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {cert.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <a
                        href={`/verify?token=${cert.verificationToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Verify
                      </a>
                      <button
                        type="button"
                        onClick={() => { setEditingCert(cert); setNewExpiryDate(cert.expiryDate ? cert.expiryDate.split('T')[0] : ''); }}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit Expiry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cert)}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: cert.status === 'active' ? '#fef3c7' : '#dcfce7', color: cert.status === 'active' ? '#92400e' : '#166534', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {cert.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cert)}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ISSUE STUDENT CERTIFICATE MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Issue Student Verification Certificate</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Student Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="e.g. Alexander Vance"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Student Email (Optional)
                </label>
                <input
                  type="email"
                  value={form.studentEmail}
                  onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                  placeholder="e.g. student@example.com"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Institution Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.institutionName}
                    onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                    placeholder="e.g. Apex Global Institute"
                    list="accredited-institutions-list"
                    style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                  <datalist id="accredited-institutions-list">
                    {institutions.map(inst => <option key={inst.id} value={inst.name} />)}
                  </datalist>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Grade / Honors (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    placeholder="e.g. Pass with Distinction"
                    style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Course / Training Program Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.courseProgram}
                  onChange={(e) => setForm({ ...form, courseProgram: e.target.value })}
                  placeholder="e.g. Executive Certified Project Management Professional (PMP)"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Certificate Number (Optional - Auto-generated if left blank)
                </label>
                <input
                  type="text"
                  value={form.certificateNumber}
                  onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
                  placeholder="e.g. CTSDA-STU-2026-9842 (Auto-generated if blank)"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    disabled={form.doesNotExpire}
                    value={form.doesNotExpire ? '' : form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', opacity: form.doesNotExpire ? 0.5 : 1 }}
                  />
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.doesNotExpire}
                    onChange={(e) => setForm({ ...form, doesNotExpire: e.target.checked })}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    This certificate does not expire (Lifetime Validity)
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer' }}
                >
                  {submitting ? 'Issuing...' : 'Issue Student Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXPIRY MODAL */}
      {editingCert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Edit Certificate Expiry</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>Updating expiry date for {editingCert.studentName}.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => handleUpdateExpiry(true)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
              >
                ♾️ Set as Lifetime (Does Not Expire)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingCert(null)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => handleUpdateExpiry(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Save Expiry</button>
            </div>
          </div>
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
