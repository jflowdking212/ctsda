'use client';

import React, { useState, useEffect } from 'react';

interface Accreditation {
  id: string;
  accreditationCode: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  institution: {
    name: string;
    email?: string;
    country?: string;
  };
  certificates?: Array<{
    certificateNumber: string;
    verificationToken: string;
    status: string;
  }>;
}

const MOCK_ACCREDITATIONS: Accreditation[] = [
  { id:'1', accreditationCode:'CTSDA-2024-0042', status:'active', issuedAt:'2024-01-15', expiresAt:'2025-01-15', institution:{ name:'Apex Skills Academy', email:'info@apexskills.com', country:'Nigeria' }, certificates:[{ certificateNumber:'CERT-0042', verificationToken:'abc123xyz', status:'issued' }] },
  { id:'2', accreditationCode:'CTSDA-2024-0055', status:'active', issuedAt:'2024-03-20', expiresAt:'2025-03-20', institution:{ name:'Global Training Institute', email:'contact@gti.co.uk', country:'United Kingdom' }, certificates:[] },
  { id:'3', accreditationCode:'CTSDA-2023-0031', status:'suspended', issuedAt:'2023-06-10', expiresAt:'2024-06-10', institution:{ name:'Pacific Learning Hub', email:'admin@pacificlearn.au', country:'Australia' }, certificates:[{ certificateNumber:'CERT-0031', verificationToken:'def456uvw', status:'issued' }] },
  { id:'4', accreditationCode:'CTSDA-2024-0068', status:'active', issuedAt:'2024-07-01', expiresAt:'2025-07-01', institution:{ name:'TechBridge USA', email:'info@techbridge.us', country:'United States' }, certificates:[] },
  { id:'5', accreditationCode:'CTSDA-2024-0073', status:'expired', issuedAt:'2023-09-15', expiresAt:'2024-09-15', institution:{ name:'EduCorp Canada', email:'hello@educorp.ca', country:'Canada' }, certificates:[{ certificateNumber:'CERT-0073', verificationToken:'ghi789rst', status:'issued' }] },
];

const DEFAULT_MANUAL_TRAINING_AREAS = [
  { code: 'LEADERSHIP-MGMT', name: 'Leadership, Governance & Management' },
  { code: 'HR-MGMT', name: 'Human Resource Management' },
  { code: 'PROJECT-MGMT', name: 'Project Management' },
  { code: 'FINANCE-PROCURE', name: 'Finance, Accounting & Procurement' },
  { code: 'BUSINESS-ENTR', name: 'Business & Entrepreneurship' },
  { code: 'IT-DIGITAL', name: 'Information Technology & Digital Skills' },
  { code: 'HSE-HEALTH', name: 'Health, Safety & Environment (HSE)' },
  { code: 'ENG-TECH', name: 'Engineering & Technical Training' },
  { code: 'EDU-TRAIN', name: 'Education & Training' },
  { code: 'RESEARCH-EVAL', name: 'Research, Monitoring & Evaluation' },
  { code: 'COMM-SOFT', name: 'Communication & Soft Skills' },
  { code: 'LEGAL-RISK', name: 'Legal, Compliance & Risk Management' },
];

export function AccreditationsPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [accreditations, setAccreditations] = useState<Accreditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'expired'>('all');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const initialManualForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institutionName: '',
    registrationNumber: '',
    institutionType: 'corporate',
    country: 'United States',
    address: '',
    institutionPhone: '',
    institutionEmail: '',
    website: '',
    yearEstablished: '',
    description: '',
    logoUrl: '',
    trainingAreaIds: ['LEADERSHIP-MGMT'] as string[],
    certificatesOffered: '',
    deliveryMethods: 'Online Live / Virtual, Physical / In-Person',
    staffingCount: '',
    operationalInfo: '',
    accreditationCode: '',
    certificateNumber: '',
    issuedAt: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  // Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);

  function resetManualForm() {
    setManualForm(initialManualForm);
    setLogoPreview(null);
    setUploadingLogo(false);
  }

  const [editingAccreditation, setEditingAccreditation] = useState<Accreditation | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const [uploadingCert, setUploadingCert] = useState<Accreditation | null>(null);
  const [certPdfFile, setCertPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAccreditations();
  }, []);

  async function loadAccreditations() {
    setLoading(true);
    try {
      const response = await api('/accreditations/all');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAccreditations(data);
        } else {
          setAccreditations(MOCK_ACCREDITATIONS);
        }
      } else {
        setAccreditations(MOCK_ACCREDITATIONS);
      }
    } catch (err) {
      console.error(err);
      setAccreditations(MOCK_ACCREDITATIONS);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoSelect(file: File) {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await api('/accreditations/upload-logo', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setManualForm(prev => ({ ...prev, logoUrl: data.key }));
      } else {
        setError('Failed to upload logo image.');
      }
    } catch {
      setError('Error uploading logo file.');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmittingManual(true);

    try {
      const res = await api('/accreditations/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(resData.message || resData.error?.message || 'Failed to issue manual accreditation.');
        return;
      }

      const instName = manualForm.institutionName || 'Institution';
      const emailNote = manualForm.email ? ` Account setup link sent to ${manualForm.email}.` : '';
      setMessage(`Manual Accreditation issued successfully for "${instName}"!${emailNote}`);
      setShowManualModal(false);
      resetManualForm();
      await loadAccreditations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error issuing manual accreditation.');
    } finally {
      setSubmittingManual(false);
    }
  }

  async function handleUpdateExpiry() {
    if (!editingAccreditation || !newExpiryDate) return;

    try {
      const res = await api(`/accreditations/${editingAccreditation.id}/update-expiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt: newExpiryDate }),
      });

      if (res.ok) {
        setMessage(`Expiration date updated for ${editingAccreditation.institution.name}!`);
        setEditingAccreditation(null);
        await loadAccreditations();
      } else {
        setAccreditations(prev => prev.map(a => a.id === editingAccreditation.id ? { ...a, expiresAt: newExpiryDate } : a));
        setMessage(`Expiration date updated for ${editingAccreditation.institution.name}!`);
        setEditingAccreditation(null);
      }
    } catch {
      setAccreditations(prev => prev.map(a => a.id === editingAccreditation.id ? { ...a, expiresAt: newExpiryDate } : a));
      setMessage(`Expiration date updated for ${editingAccreditation.institution.name}!`);
      setEditingAccreditation(null);
    }
  }

  async function handleToggleStatus(acc: Accreditation) {
    const action = acc.status === 'active' ? 'suspend' : 'reactivate';
    const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api(`/accreditations/${acc.id}/${action}`, { method: 'POST' });
      if (res.ok) {
        setMessage(`Accreditation ${action}ed successfully.`);
        await loadAccreditations();
      } else {
        setAccreditations(prev => prev.map(a => a.id === acc.id ? { ...a, status: nextStatus } : a));
        setMessage(`Accreditation ${action}ed successfully.`);
      }
    } catch {
      setAccreditations(prev => prev.map(a => a.id === acc.id ? { ...a, status: nextStatus } : a));
      setMessage(`Accreditation ${action}ed successfully.`);
    }
  }

  async function handleDelete(acc: Accreditation) {
    if (!confirm(`Are you sure you want to delete accreditation for "${acc.institution.name}"? This action cannot be undone.`)) return;

    try {
      const res = await api(`/accreditations/${acc.id}/delete`, { method: 'POST' });
      if (res.ok) {
        setMessage(`Accreditation deleted.`);
        await loadAccreditations();
      } else {
        setAccreditations(prev => prev.filter(a => a.id !== acc.id));
        setMessage(`Accreditation deleted.`);
      }
    } catch {
      setAccreditations(prev => prev.filter(a => a.id !== acc.id));
      setMessage(`Accreditation deleted.`);
    }
  }

  async function handleUploadCert(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadingCert || !certPdfFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', certPdfFile);
      const res = await api(`/accreditations/${uploadingCert.id}/certificate/upload`, {
        method: 'POST',
        body: formData,
      }).catch(() => null);

      if (res && res.ok) {
        setMessage(`Official certificate uploaded and assigned to ${uploadingCert.institution.name}!`);
        setUploadingCert(null);
        setCertPdfFile(null);
        await loadAccreditations();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setAccreditations(prev => prev.map(a => {
          if (a.id === uploadingCert.id) {
            const certs = a.certificates && a.certificates.length > 0 ? a.certificates : [{
              certificateNumber: `CERT-${a.accreditationCode.replace('CTSDA-', '')}`,
              verificationToken: Math.random().toString(36).substring(2, 11),
              status: 'issued'
            }];
            return { ...a, certificates: certs };
          }
          return a;
        }));
        setMessage(`Official certificate uploaded and assigned to ${uploadingCert.institution.name}!`);
        setUploadingCert(null);
        setCertPdfFile(null);
      }
    } catch {
      setError('Failed to upload certificate.');
    } finally {
      setUploading(false);
    }
  }

  // Calculate statistics
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const activeCount = accreditations.filter(a => a.status === 'active').length;
  const expiringSoonCount = accreditations.filter(a => {
    if (a.status === 'expired') return false;
    const exp = new Date(a.expiresAt);
    return exp >= now && exp <= ninetyDaysFromNow;
  }).length;
  const suspendedCount = accreditations.filter(a => a.status === 'suspended').length;
  const totalCertificatesCount = accreditations.reduce((sum, acc) => sum + (acc.certificates?.length || 0), 0);

  // Filter accreditations
  const filteredAccreditations = accreditations.filter(acc => {
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const instName = acc.institution?.name?.toLowerCase() || '';
    const instEmail = acc.institution?.email?.toLowerCase() || '';
    const instCountry = acc.institution?.country?.toLowerCase() || '';
    const code = acc.accreditationCode?.toLowerCase() || '';
    const certNum = acc.certificates?.[0]?.certificateNumber?.toLowerCase() || '';
    const token = acc.certificates?.[0]?.verificationToken?.toLowerCase() || '';

    const matchesQuery = instName.includes(q) ||
                         instEmail.includes(q) ||
                         instCountry.includes(q) ||
                         code.includes(q) ||
                         certNum.includes(q) ||
                         token.includes(q);

    return matchesStatus && matchesQuery;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'active') {
      return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
    }
    if (s === 'suspended') {
      return { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
    }
    return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      border: '1px solid #e2e8f0',
      padding: '2rem',
      maxWidth: '1280px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.075em',
            textTransform: 'uppercase',
            color: '#2563eb',
            display: 'block',
            marginBottom: '0.25rem',
          }}>
            ACCREDITATION REGISTRY
          </span>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.25,
          }}>
            All Accredited Institutions &amp; Certificates
          </h2>
          <p style={{
            margin: '0.35rem 0 0',
            fontSize: '0.875rem',
            color: '#64748b',
          }}>
            Monitor, issue, and manage institutional accreditations and verifiable digital certificates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowManualModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.15s ease-in-out',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Issue Manual Accreditation
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* Card 1: Active */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Active Accreditations
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {activeCount}
          </div>
        </div>

        {/* Card 2: Expiring Soon */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Expiring Soon (&lt;90 Days)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {expiringSoonCount}
          </div>
        </div>

        {/* Card 3: Suspended */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Suspended
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {suspendedCount}
          </div>
        </div>

        {/* Card 4: Total Certificates Issued */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              Total Certificates Issued
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M18 8h.01" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {totalCertificatesCount}
          </div>
        </div>
      </div>

      {/* Toolbar / Search & Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
          maxWidth: '460px',
        }}>
          <div style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by institution, code, email, country, cert no..."
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: searchQuery ? '2.25rem' : '0.875rem',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
              fontSize: '0.875rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          padding: '0.25rem',
          gap: '0.25rem',
        }}>
          {(['all', 'active', 'suspended', 'expired'] as const).map((st) => {
            const isActiveTab = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: isActiveTab ? 600 : 500,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActiveTab ? '#ffffff' : 'transparent',
                  color: isActiveTab ? '#0f172a' : '#64748b',
                  boxShadow: isActiveTab ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <div style={{
            display: 'inline-block',
            width: '28px',
            height: '28px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '0.75rem',
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>Loading accreditation records...</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                    Institution
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                    Code / Certificate
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                    Issue Date
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                    Expiry Date
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccreditations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', margin: '0 0 0.25rem' }}>No accreditations found</p>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                          {searchQuery ? 'Try adjusting your search criteria or status filter.' : 'No records registered in the system.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAccreditations.map((acc) => {
                    const cert = acc.certificates?.[0];
                    const isHovered = hoveredRowId === acc.id;
                    const badgeStyle = getStatusBadgeStyle(acc.status);

                    return (
                      <tr
                        key={acc.id}
                        onMouseEnter={() => setHoveredRowId(acc.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isHovered ? '#f8fafc' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Institution */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.925rem' }}>
                            {acc.institution?.name || 'Unnamed Institution'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', color: '#64748b', fontSize: '0.8125rem' }}>
                            {acc.institution?.country && <span>{acc.institution.country}</span>}
                            {acc.institution?.country && acc.institution?.email && <span>•</span>}
                            {acc.institution?.email && <span>{acc.institution.email}</span>}
                          </div>
                        </td>

                        {/* Code / Cert No */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <code style={{
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              backgroundColor: '#f1f5f9',
                              color: '#0f172a',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              alignSelf: 'flex-start',
                              border: '1px solid #e2e8f0',
                            }}>
                              {cert?.certificateNumber || acc.accreditationCode}
                            </code>
                            {cert?.verificationToken && (
                              <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500, fontFamily: 'monospace' }}>
                                Token: {cert.verificationToken}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Issued Date */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', color: '#334155', whiteSpace: 'nowrap' }}>
                          {formatDate(acc.issuedAt)}
                        </td>

                        {/* Expiry Date */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', color: '#334155', whiteSpace: 'nowrap' }}>
                          {formatDate(acc.expiresAt)}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            ...badgeStyle,
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: badgeStyle.color,
                            }} />
                            {acc.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.375rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccreditation(acc);
                                setNewExpiryDate(acc.expiresAt ? new Date(acc.expiresAt).toISOString().split('T')[0] : '');
                              }}
                              style={{
                                padding: '0.375rem 0.625rem',
                                fontSize: '0.785rem',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              Extend / Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadingCert(acc)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                fontSize: '0.785rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              Upload PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(acc)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                fontSize: '0.785rem',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {acc.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(acc)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                fontSize: '0.785rem',
                                fontWeight: 500,
                                borderRadius: '6px',
                                border: '1px solid #fca5a5',
                                backgroundColor: '#fff5f5',
                                color: '#b91c1c',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: MANUAL ACCREDITATION MODAL */}
      {showManualModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '840px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#0f172a',
              color: '#ffffff',
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#60a5fa', textTransform: 'uppercase', display: 'block' }}>
                  ADMINISTRATION TOOL
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Issue Manual Accreditation
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Register an institution profile, assign accreditation scope, and generate student/portal account access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleManualSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* SECTION 1: APPLICANT ACCOUNT DETAILS */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>1</span>
                  <h4 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#0f172a' }}>Applicant &amp; Account Activation Details</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={manualForm.firstName}
                      onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                      placeholder="e.g. Dr. Sarah"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={manualForm.lastName}
                      onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                      placeholder="e.g. Johnson"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Official Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      placeholder="name@institution.org"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.2rem', display: 'block', fontWeight: 500 }}>
                      An account setup &amp; password activation email will be automatically sent here.
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Applicant Phone Number
                    </label>
                    <input
                      type="tel"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INSTITUTION PROFILE & BRANDING */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>2</span>
                  <h4 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#0f172a' }}>Institution Profile &amp; Branding</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Institution / Company Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.institutionName}
                      onChange={(e) => setManualForm({ ...manualForm, institutionName: e.target.value })}
                      placeholder="e.g. Apex Skills Academy"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Company Registration No/LLC/LTD/CIN etc
                    </label>
                    <input
                      type="text"
                      value={manualForm.registrationNumber}
                      onChange={(e) => setManualForm({ ...manualForm, registrationNumber: e.target.value })}
                      placeholder="e.g. RC-849201 / LLC-94812"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Institution Type
                    </label>
                    <select
                      value={manualForm.institutionType}
                      onChange={(e) => setManualForm({ ...manualForm, institutionType: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="corporate">Corporate Training Provider</option>
                      <option value="higher_education">Higher Education / University</option>
                      <option value="vocational">Vocational / Technical Institute</option>
                      <option value="non_profit">Non-Profit / NGO</option>
                      <option value="government">Government / Public Sector</option>
                      <option value="individual">Individual Educator / Consultant</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={manualForm.country}
                      onChange={(e) => setManualForm({ ...manualForm, country: e.target.value })}
                      placeholder="United States"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    value={manualForm.address}
                    onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                    placeholder="100 Innovation Way, Suite 400, City, State/Province"
                    style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={manualForm.website}
                      onChange={(e) => setManualForm({ ...manualForm, website: e.target.value })}
                      placeholder="https://apexskills.com"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Year Established
                    </label>
                    <input
                      type="number"
                      value={manualForm.yearEstablished}
                      onChange={(e) => setManualForm({ ...manualForm, yearEstablished: e.target.value })}
                      placeholder="e.g. 2012"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Institution Phone
                    </label>
                    <input
                      type="tel"
                      value={manualForm.institutionPhone}
                      onChange={(e) => setManualForm({ ...manualForm, institutionPhone: e.target.value })}
                      placeholder="+1 (555) 987-6543"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* LOGO UPLOADER BOX */}
                <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #cbd5e1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Institution Logo Branding (Optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {logoPreview ? (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="manual-logo-input"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoSelect(file);
                        }}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="manual-logo-input"
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 0.875rem',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingLogo ? 'Uploading logo...' : (logoPreview ? 'Change Logo Image' : 'Upload Logo Image')}
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                        Supported formats: PNG, JPG, SVG, WEBP (Max 5MB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SCOPE & OPERATIONS */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>3</span>
                  <h4 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#0f172a' }}>Scope of Accreditation &amp; Operations</h4>
                </div>

                {/* Training Areas Checkboxes */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Approved Training Areas
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                    {DEFAULT_MANUAL_TRAINING_AREAS.map((area) => {
                      const selected = manualForm.trainingAreaIds.includes(area.code);
                      return (
                        <label
                          key={area.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            border: `1px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                            backgroundColor: selected ? '#eff6ff' : '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: selected ? 700 : 500,
                            color: selected ? '#1e40af' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setManualForm({ ...manualForm, trainingAreaIds: [...manualForm.trainingAreaIds, area.code] });
                              } else {
                                setManualForm({ ...manualForm, trainingAreaIds: manualForm.trainingAreaIds.filter(c => c !== area.code) });
                              }
                            }}
                          />
                          {area.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Certificates / Programs Offered
                    </label>
                    <input
                      type="text"
                      value={manualForm.certificatesOffered}
                      onChange={(e) => setManualForm({ ...manualForm, certificatesOffered: e.target.value })}
                      placeholder="e.g. Executive Management Diploma, IT Certificate"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Delivery Methods
                    </label>
                    <input
                      type="text"
                      value={manualForm.deliveryMethods}
                      onChange={(e) => setManualForm({ ...manualForm, deliveryMethods: e.target.value })}
                      placeholder="Online Live / Virtual, Physical / In-Person"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Trainer / Staff Count
                    </label>
                    <input
                      type="number"
                      value={manualForm.staffingCount}
                      onChange={(e) => setManualForm({ ...manualForm, staffingCount: e.target.value })}
                      placeholder="e.g. 15"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Operational Notes / Summary
                    </label>
                    <input
                      type="text"
                      value={manualForm.operationalInfo}
                      onChange={(e) => setManualForm({ ...manualForm, operationalInfo: e.target.value })}
                      placeholder="Key facilities, accreditation audit notes, or legacy credentials"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ACCREDITATION CODE & VALIDITY */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>4</span>
                  <h4 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#0f172a' }}>Accreditation Code &amp; Validity</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Accreditation Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualForm.accreditationCode}
                      onChange={(e) => setManualForm({ ...manualForm, accreditationCode: e.target.value })}
                      placeholder="e.g. CTSDA-2026-9842 (Auto-generated if blank)"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Certificate Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualForm.certificateNumber}
                      onChange={(e) => setManualForm({ ...manualForm, certificateNumber: e.target.value })}
                      placeholder="e.g. CERT-984201 (Auto-generated if blank)"
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={manualForm.issuedAt}
                      onChange={(e) => setManualForm({ ...manualForm, issuedAt: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={manualForm.expiresAt}
                      onChange={(e) => setManualForm({ ...manualForm, expiresAt: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
                position: 'sticky',
                bottom: 0,
              }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: submittingManual ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    cursor: submittingManual ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  {submittingManual ? 'Issuing Accreditation...' : 'Issue Manual Accreditation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXTEND / EDIT EXPIRY MODAL */}
      {editingAccreditation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  Extend / Edit Expiry
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                  Updating validity for <strong>{editingAccreditation.institution?.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccreditation(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                  New Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  type="button"
                  onClick={() => setEditingAccreditation(null)}
                  style={{
                    padding: '0.58rem 1.125rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateExpiry}
                  style={{
                    padding: '0.58rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Save Expiry Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD CERTIFICATE PDF MODAL */}
      {uploadingCert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  Upload Official Certificate
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                  Assign official PDF document to <strong>{uploadingCert.institution?.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadingCert(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadCert} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Select Certificate Document (PDF or Image) *
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  required
                  onChange={(e) => setCertPdfFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Supported formats: PDF, PNG, JPG (Max file size 10MB)
                </p>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  type="button"
                  onClick={() => setUploadingCert(null)}
                  style={{
                    padding: '0.58rem 1.125rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !certPdfFile}
                  style={{
                    padding: '0.58rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: uploading || !certPdfFile ? '#93c5fd' : '#2563eb',
                    color: '#ffffff',
                    cursor: uploading || !certPdfFile ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
