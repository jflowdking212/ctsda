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
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>{getStatusBadge(app.status)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        className="admin-button"
                        style={{
                          padding: '0.3rem 0.7rem',
                          fontSize: '0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#0f172a',
                          cursor: 'pointer',
                          fontWeight: 500,
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
