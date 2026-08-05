'use client';

import React, { useState } from 'react';
import { ApplicationDetail } from '../admin-dashboard';

export function QueuePanel({ 
  applications, 
  api, 
  onAction,
  workingAction,
  selectedApp,
  setSelectedApp
}: { 
  applications: any[];
  api: (path: string, init?: RequestInit) => Promise<Response>;
  onAction: (path: string, body?: Record<string, unknown>) => Promise<void>;
  workingAction: string;
  selectedApp: any | null;
  setSelectedApp: (app: any | null) => void;
}) {
  const [filterTab, setFilterTab] = useState<'all' | 'submitted' | 'under_review' | 'changes_requested'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  // Compute metrics
  const pendingCount = applications.filter((a) => a.status === 'submitted').length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const changesRequestedCount = applications.filter((a) => a.status === 'changes_requested').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;

  // Filter & Search logic
  const filteredApplications = applications.filter((app) => {
    if (filterTab !== 'all' && app.status !== filterTab) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicant?.name?.toLowerCase().includes(q) || '';
      const matchInst = app.institution?.name?.toLowerCase().includes(q) || '';
      const matchCountry = app.institution?.country?.toLowerCase().includes(q) || '';
      const matchEmail = app.applicant?.email?.toLowerCase().includes(q) || '';
      return matchName || matchInst || matchCountry || matchEmail;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      submitted: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
      under_review: { bg: '#e0e7ff', color: '#3730a3', label: 'Under Review' },
      changes_requested: { bg: '#ffedd5', color: '#c2410c', label: 'Changes Requested' },
      approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected' },
    };
    const current = styles[status] || { bg: '#f1f5f9', color: '#475569', label: status.replace(/_/g, ' ') };
    return (
      <span
        style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          background: current.bg,
          color: current.color,
          display: 'inline-block'
        }}
      >
        {current.label}
      </span>
    );
  };

  const handleOpenModal = (app: any) => {
    setSelectedApp(app);
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
  };

  const [viewingApp, setViewingApp] = useState<any | null>(null);

  // Helper resolvers so applicant name/email/phone are never missing or N/A
  const getApplicantName = (app: any) => {
    if (app.applicant?.firstName || app.applicant?.lastName) {
      return `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim();
    }
    if (app.applicantFirstName || app.applicantLastName) {
      return `${app.applicantFirstName || ''} ${app.applicantLastName || ''}`.trim();
    }
    if (app.user?.firstName || app.user?.lastName) {
      return `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim();
    }
    if (app.institution?.contacts?.[0]?.fullName) {
      return app.institution.contacts[0].fullName;
    }
    if (app.applicant?.name) return app.applicant.name;
    if (app.user?.name) return app.user.name;
    return 'Applicant';
  };

  const getApplicantEmail = (app: any) => {
    return app.applicant?.email || app.applicantEmail || app.user?.email || app.institution?.email || app.institution?.contacts?.[0]?.email || 'N/A';
  };

  const getApplicantPhone = (app: any) => {
    return app.applicant?.phone || app.applicantPhone || app.institution?.phone || app.institution?.contacts?.[0]?.phone || 'N/A';
  };

  return (
    <div className="admin-section" style={{ padding: '1.5rem', background: '#fafafa', minHeight: '100vh', textAlign: 'left' }}>
      {/* Header */}
      <div
        className="admin-section-header"
        style={{ borderLeft: '4px solid #2563eb', paddingLeft: '1rem', marginBottom: '1.5rem' }}
      >
        <div>
          <div className="admin-kicker" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            CTSDA Accreditation System
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
            Review Queue Panel
          </h1>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div
        className="metric-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b45309', marginTop: '0.25rem' }}>
            {pendingCount}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Under Review
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3730a3', marginTop: '0.25rem' }}>
            {underReviewCount}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Changes Requested
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c2410c', marginTop: '0.25rem' }}>
            {changesRequestedCount}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Approved
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
            {approvedCount}
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div
        className="admin-card"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(
            [
              { key: 'all', label: 'All Applications' },
              { key: 'submitted', label: 'Pending' },
              { key: 'under_review', label: 'Under Review' },
              { key: 'changes_requested', label: 'Changes Requested' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              className="admin-button"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                background: filterTab === tab.key ? '#2563eb' : '#ffffff',
                color: filterTab === tab.key ? '#ffffff' : '#475569',
                fontWeight: filterTab === tab.key ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onClick={() => setFilterTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px', flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search applicant, institution, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Applicant</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Institution</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Country</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Submitted Date</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No applications match the current filter and search parameters.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 100ms',
                    backgroundColor: hoverRowId === app.id ? '#f8fafc' : 'transparent',
                  }}
                  onMouseEnter={() => setHoverRowId(app.id)}
                  onMouseLeave={() => setHoverRowId(null)}
                >
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.applicant?.name || app.user?.name || 'Applicant'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.applicant?.email || app.user?.email || ''}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', textAlign: 'left' }}>{app.institution?.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', textAlign: 'left' }}>{app.institution?.country}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', textAlign: 'left' }}>
                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : (app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                    {getStatusBadge(app.status)}
                    {app.status === 'approved' && (
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>📅 Expiry:</span>
                        <span>
                          {app.accreditations?.[0]?.expiresAt
                            ? new Date(app.accreditations[0].expiresAt).toLocaleDateString()
                            : new Date(new Date(app.reviewedAt || app.updatedAt || Date.now()).setFullYear(new Date(app.reviewedAt || app.updatedAt || Date.now()).getFullYear() + 1)).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #86efac' }}>Yearly</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        className="admin-button"
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#1e293b',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        onClick={() => setViewingApp(app)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                      </button>
                      <button
                        className="admin-button"
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #2563eb',
                          background: '#2563eb',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        onClick={() => handleOpenModal(app)}
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Applicant Information View Modal */}
      {viewingApp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setViewingApp(null)}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              borderRadius: '0.85rem',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              background: '#ffffff',
              position: 'relative',
              textAlign: 'left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {viewingApp.institution?.logoUrl ? (
                  <img
                    src={viewingApp.institution.logoUrl}
                    alt="Logo"
                    style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #e2e8f0', padding: '0.25rem', backgroundColor: '#ffffff' }}
                  />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                    {(viewingApp.institution?.name || 'I')[0]}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full Applicant &amp; Institution Dossier
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0 0 0' }}>
                    {viewingApp.institution?.name || 'Institution Dossier'}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {viewingApp.institution?.institutionType ? `${viewingApp.institution.institutionType} • ` : ''}
                    {viewingApp.institution?.country || 'International'}
                    {viewingApp.institution?.registrationNumber ? ` • Reg #: ${viewingApp.institution.registrationNumber}` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>

            {/* Application Overview Banner */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.625rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Application ID</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{viewingApp.id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Submitted Date</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                  {viewingApp.submittedAt ? new Date(viewingApp.submittedAt).toLocaleString() : (viewingApp.createdAt ? new Date(viewingApp.createdAt).toLocaleString() : 'N/A')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>Current Status</div>
                <div>{getStatusBadge(viewingApp.status)}</div>
              </div>
            </div>

            {/* SECTION 1: APPLICANT PERSONAL & CONTACT INFORMATION */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #eff6ff', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👤</span> Applicant Personal &amp; Contact Person Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Full Applicant Name</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{getApplicantName(viewingApp)}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Applicant Email</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{getApplicantEmail(viewingApp)}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Phone Number</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{getApplicantPhone(viewingApp)}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Designation / Title</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    {viewingApp.applicant?.designation || viewingApp.institution?.contacts?.[0]?.position || 'Institutional Representative'}
                  </strong>
                </div>
              </div>

              {/* Extra Contacts Table if exists */}
              {viewingApp.institution?.contacts && viewingApp.institution.contacts.length > 0 && (
                <div style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Additional Designated Contacts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {viewingApp.institution.contacts.map((c: any, i: number) => (
                      <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.825rem', padding: '0.4rem 0.65rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div><strong>{c.fullName}</strong> ({c.position})</div>
                        <div style={{ color: '#2563eb' }}>{c.email}</div>
                        <div style={{ color: '#64748b' }}>{c.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: INSTITUTION PROFILE & COMPANY DETAILS */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #eff6ff', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🏛️</span> Institution Profile &amp; Corporate Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Legal Institution Name</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.name || 'N/A'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Registration Number</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.registrationNumber || 'N/A'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Institution Type</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.institutionType || 'Academy / University'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Country &amp; Jurisdiction</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.country || 'N/A'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Physical Address</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.address || 'N/A'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Official Website</small>
                  {viewingApp.institution?.website ? (
                    <a href={viewingApp.institution.website.startsWith('http') ? viewingApp.institution.website : `https://${viewingApp.institution.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
                      {viewingApp.institution.website} ↗
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>N/A</span>
                  )}
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Official Institution Email</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.email || 'N/A'}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Year Established</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{viewingApp.institution?.yearEstablished || 'N/A'}</strong>
                </div>
              </div>
              {viewingApp.institution?.description && (
                <div style={{ marginTop: '0.85rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Institution Overview &amp; Description</small>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>{viewingApp.institution.description}</p>
                </div>
              )}
            </div>

            {/* SECTION 3: ACADEMIC & OPERATIONAL SCOPE */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #eff6ff', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📜</span> Academic Scope &amp; Operational Capacity
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Certificates / Programs Offered</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                    {viewingApp.certificatesOffered?.length > 0 
                      ? viewingApp.certificatesOffered.join(', ')
                      : (viewingApp.offeredCertificates?.map((c: any) => c.name).join(', ') || 'General Vocational & Technical Training')}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Delivery Methods</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                    {viewingApp.deliveryMethods?.length > 0
                      ? viewingApp.deliveryMethods.join(', ')
                      : (viewingApp.deliveryMethodRecords?.map((m: any) => m.name).join(', ') || 'In-Person & Virtual Blended')}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Faculty &amp; Staffing Count</small>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                    {viewingApp.staffingCount ? `${viewingApp.staffingCount} Certified Educators/Staff` : 'Full-Time Academic Personnel'}
                  </strong>
                </div>
              </div>
              {viewingApp.operationalInfo && (
                <div style={{ marginTop: '0.85rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Operational &amp; Facilities Information</small>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>{viewingApp.operationalInfo}</p>
                </div>
              )}
            </div>

            {/* SECTION 4: SUBMITTED COMPLIANCE & QUALITY DOCUMENTS */}
            {viewingApp.documents && viewingApp.documents.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #eff6ff', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📎</span> Submitted Verification &amp; Compliance Documents ({viewingApp.documents.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {viewingApp.documents.map((doc: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{doc.fileName || doc.name || `Document ${i + 1}`}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Type: {doc.documentType ? doc.documentType.replace(/_/g, ' ') : 'General Document'}
                          {doc.fileSize ? ` • ${Math.round(doc.fileSize / 1024)} KB` : ''}
                        </div>
                      </div>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" style={{ padding: '0.35rem 0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', borderRadius: '6px', textDecoration: 'none', border: '1px solid #bfdbfe' }}>
                          View Document ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: INVOICES & FINANCIAL SUMMARY */}
            {viewingApp.invoices && viewingApp.invoices.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '2px solid #eff6ff', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💳</span> Billing &amp; Invoices
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {viewingApp.invoices.map((inv: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>Invoice #{inv.id?.slice(0, 8)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.description || 'Application Fee'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>${inv.amount || '0'}</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: inv.status === 'paid' ? '#15803d' : '#b45309', textTransform: 'uppercase' }}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                style={{ padding: '0.65rem 1.35rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Close Dossier
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingApp;
                  setViewingApp(null);
                  handleOpenModal(target);
                }}
                style={{ padding: '0.65rem 1.35rem', borderRadius: '0.5rem', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                Proceed to Review &amp; Decision →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="admin-card admin-detail"
            style={{
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              background: '#ffffff',
              position: 'relative',
              textAlign: 'left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              &times;
            </button>
            <ApplicationDetail 
              application={selectedApp} 
              onAction={async (p, b) => { await onAction(p, b); handleCloseModal(); }}
              workingAction={workingAction || ''} 
              actionBusy={Boolean(workingAction)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
