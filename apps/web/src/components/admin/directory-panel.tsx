'use client';

import React, { useState } from 'react';

export function DirectoryPanel({ 
  institutions, 
  api 
}: { 
  institutions: any[];
  api: (path: string, init?: RequestInit) => Promise<Response>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form edit states for modal
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<string>('active');

  // Extract unique countries
  const countries = Array.from(new Set(institutions.map((i) => i.country).filter(Boolean))).sort();

  // Dynamic metrics calculation
  const totalListed = institutions.length;
  const activeCount = institutions.filter((i) => i.isActive).length;
  const suspendedCount = totalListed - activeCount;
  const uniqueCountriesCount = countries.length;

  const filteredInstitutions = institutions.filter((inst) => {
    if (countryFilter !== 'all' && inst.country !== countryFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = inst.name?.toLowerCase().includes(q) || '';
      const matchCode = inst.registrationNumber?.toLowerCase().includes(q) || '';
      const matchCountry = inst.country?.toLowerCase().includes(q) || '';
      return matchName || matchCode || matchCountry;
    }
    return true;
  });

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          background: isActive ? '#dcfce7' : '#fee2e2',
          color: isActive ? '#15803d' : '#b91c1c',
        }}
      >
        {isActive ? 'Active' : 'Suspended'}
      </span>
    );
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      // In a real app, we'd hit the API here, e.g.
      // await api(`/admin/institutions/${id}/status`, { method: 'POST', body: JSON.stringify({ isActive: !currentActive }) });
      setMessage({
        type: 'success',
        text: `Visibility toggle requested. (API connection pending for this route)`,
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to toggle status.' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleOpenDetailModal = (inst: any, edit: boolean = false) => {
    setSelectedInst(inst);
    setIsEditMode(edit);
    setEditEmail(inst.email || '');
    setEditStatus(inst.isActive ? 'active' : 'suspended');
  };

  const handleCloseModal = () => {
    setSelectedInst(null);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedInst) return;
    try {
      setMessage({
        type: 'success',
        text: `Institution details updated for ${selectedInst.name}. (API connection pending)`,
      });
    } catch (e) {
      setMessage({ type: 'error', text: 'Update failed.' });
    }
    setSelectedInst(null);
    setIsEditMode(false);
    setTimeout(() => setMessage(null), 4000);
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
            CTSDA Accredited Registry
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
            Accredited Directory Panel
          </h1>
        </div>
      </div>

      {/* Message Notification */}
      {message && (
        <div
          className={`admin-message ${message.type}`}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Top Metric Cards */}
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
            Total Listed
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalListed}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
            {activeCount}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suspended
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b91c1c', marginTop: '0.25rem' }}>
            {suspendedCount}
          </div>
        </div>
        <div className="metric-card admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Countries
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>
            {uniqueCountriesCount}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Country Dropdown */}
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
        <div style={{ minWidth: '240px', flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search institution name, code, or country..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Filter Country:</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c as string} value={c as string}>
                {c as string}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Institution</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Country</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Registration No.</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Listed Since</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstitutions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No institutions found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredInstitutions.map((inst) => (
                <tr
                  key={inst.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 100ms',
                    backgroundColor: hoverRowId === inst.id ? '#f8fafc' : 'transparent',
                  }}
                  onMouseEnter={() => setHoverRowId(inst.id)}
                  onMouseLeave={() => setHoverRowId(null)}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a', textAlign: 'left' }}>
                    {inst.name}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{inst.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', textAlign: 'left' }}>{inst.country}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', fontFamily: 'monospace', fontWeight: 600, textAlign: 'left' }}>
                    {inst.registrationNumber}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', textAlign: 'left' }}>
                    {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>{getStatusBadge(inst.isActive)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
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
                        onClick={() => handleOpenDetailModal(inst, false)}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selectedInst && (
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
              maxWidth: '540px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEditMode ? 'Edit Institution Listing' : 'Institution Details'}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  {selectedInst.name}
                </h2>
              </div>
              <div>{getStatusBadge(selectedInst.isActive)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Registration No</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b', marginTop: '0.1rem' }}>
                  {selectedInst.registrationNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Country</div>
                <div style={{ color: '#1e293b', marginTop: '0.1rem' }}>{selectedInst.country}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Listed Since</div>
                <div style={{ color: '#1e293b', marginTop: '0.1rem' }}>
                  {selectedInst.createdAt ? new Date(selectedInst.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Contact Email</div>
              <div style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.75rem' }}>{selectedInst.email}</div>
              
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Address</div>
              <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                {selectedInst.address || 'No address logged.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <button
                className="admin-button"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
