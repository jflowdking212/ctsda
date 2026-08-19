'use client';

import React, { useState } from 'react';

export function DirectoryPanel({ 
  institutions: initialInstitutions, 
  api 
}: { 
  institutions: any[];
  api: (path: string, init?: RequestInit) => Promise<Response>;
}) {
  const [institutionsList, setInstitutionsList] = useState<any[]>(initialInstitutions || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    registrationNumber: '',
    institutionType: 'corporate',
    country: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    yearEstablished: '',
    description: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    isActive: true,
    showInDirectory: true,
  });

  // Keep internal list in sync if prop changes
  React.useEffect(() => {
    setInstitutionsList(initialInstitutions || []);
  }, [initialInstitutions]);

  // Load public directory visibility setting
  React.useEffect(() => {
    async function loadVisibility() {
      try {
        const res = await api('/settings');
        if (res.ok) {
          const s = await res.json();
          setShowDirectory(s.showDirectory !== 'false' && s.showDirectory !== false);
        }
      } catch (err) {
        console.error('Failed to load settings in directory panel', err);
      }
    }
    loadVisibility();
  }, [api]);

  async function handleToggleDirectoryVisibility() {
    setTogglingVisibility(true);
    const newStatus = !showDirectory;
    try {
      const res = await api('/settings', {
        method: 'POST',
        body: JSON.stringify({ showDirectory: newStatus ? 'true' : 'false' }),
      });
      if (res.ok) {
        setShowDirectory(newStatus);
        setMessage({
          type: 'success',
          text: newStatus
            ? '🌐 Public Directory is now VISIBLE to website visitors and added to the header navigation.'
            : '🔒 Public Directory is now HIDDEN from the frontend. Direct institution URLs (/directory/[slug]) remain accessible.',
        });
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `Failed to update directory visibility: ${err.message}` });
    } finally {
      setTogglingVisibility(false);
    }
  }

  // Extract unique countries
  const countries = Array.from(new Set(institutionsList.map((i) => i.country).filter(Boolean))).sort();

  // Metrics
  const totalListed = institutionsList.length;
  const activeCount = institutionsList.filter((i) => i.isActive).length;
  const suspendedCount = totalListed - activeCount;
  const uniqueCountriesCount = countries.length;

  const filteredInstitutions = institutionsList.filter((inst) => {
    if (countryFilter !== 'all' && inst.country !== countryFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = inst.name?.toLowerCase().includes(q) || false;
      const matchCode = inst.registrationNumber?.toLowerCase().includes(q) || false;
      const matchCountry = inst.country?.toLowerCase().includes(q) || false;
      const matchEmail = inst.email?.toLowerCase().includes(q) || false;
      return matchName || matchCode || matchCountry || matchEmail;
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

  const handleOpenModal = (inst: any, edit: boolean = false) => {
    setSelectedInst(inst);
    setIsEditMode(edit);
    setEditForm({
      name: inst.name || '',
      registrationNumber: inst.registrationNumber || '',
      institutionType: inst.institutionType || 'corporate',
      country: inst.country || '',
      address: inst.address || '',
      phone: inst.phone || '',
      email: inst.email || '',
      website: inst.website || '',
      yearEstablished: inst.yearEstablished ? String(inst.yearEstablished) : '',
      description: inst.description || '',
      facebookUrl: inst.facebookUrl || '',
      instagramUrl: inst.instagramUrl || '',
      linkedinUrl: inst.linkedinUrl || '',
      twitterUrl: inst.twitterUrl || '',
      isActive: inst.isActive ?? true,
      showInDirectory: inst.showInDirectory ?? true,
    });
  };

  const handleCloseModal = () => {
    setSelectedInst(null);
    setIsEditMode(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInst) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: editForm.name,
        registrationNumber: editForm.registrationNumber,
        institutionType: editForm.institutionType,
        country: editForm.country,
        address: editForm.address,
        phone: editForm.phone,
        email: editForm.email,
        website: editForm.website,
        yearEstablished: editForm.yearEstablished ? Number(editForm.yearEstablished) : null,
        description: editForm.description,
        facebookUrl: editForm.facebookUrl,
        instagramUrl: editForm.instagramUrl,
        linkedinUrl: editForm.linkedinUrl,
        twitterUrl: editForm.twitterUrl,
        isActive: editForm.isActive,
        showInDirectory: editForm.showInDirectory,
      };

      const res = await api(`/admin/institutions/${selectedInst.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errData.message || 'Failed to update institution profile.' });
        return;
      }

      const updated = await res.json().catch(() => null);

      // Update local state
      setInstitutionsList((prev) =>
        prev.map((item) =>
          item.id === selectedInst.id
            ? { ...item, ...payload, ...(updated || {}) }
            : item
        )
      );

      setMessage({
        type: 'success',
        text: `Institution profile updated successfully for "${editForm.name}"!`,
      });
      setSelectedInst(null);
      setIsEditMode(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Network or server error updating institution.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
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

      {message && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#14532d' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Directory Page Visibility Banner */}
      <div style={{
        background: showDirectory ? '#f0fdf4' : '#fff1f2',
        border: `1.5px solid ${showDirectory ? '#86efac' : '#fecdd3'}`,
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: showDirectory ? '#dcfce7' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}>
            {showDirectory ? '🌐' : '🔒'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <strong style={{ fontSize: '1rem', color: showDirectory ? '#14532d' : '#9f1239' }}>
                Public Directory Status: {showDirectory ? 'LIVE & VISIBLE' : 'HIDDEN FROM FRONTEND'}
              </strong>
              <span style={{
                background: showDirectory ? '#16a34a' : '#e11d48',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                textTransform: 'uppercase',
              }}>
                {showDirectory ? 'Online' : 'Hidden'}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: showDirectory ? '#166534' : '#be123c', lineHeight: 1.4 }}>
              {showDirectory
                ? 'The Directory menu is visible on the header and visitors can search institutions at /directory.'
                : 'The Directory menu is removed from header and /directory redirects to home. Individual profile links (/directory/[slug]) still work.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleDirectoryVisibility}
          disabled={togglingVisibility}
          style={{
            background: showDirectory ? '#dc2626' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: togglingVisibility ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {togglingVisibility ? 'Updating...' : showDirectory ? '🔒 Hide Public Directory' : '🌐 Reveal Public Directory'}
        </button>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Institutions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalListed}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Active Listed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }}>{activeCount}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Suspended / Inactive</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.25rem' }}>{suspendedCount}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Countries Represented</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.25rem' }}>{uniqueCountriesCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, reg number, email, or country..."
          style={{ flex: 1, minWidth: '240px', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
        >
          <option value="all">All Countries ({countries.length})</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Directory Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Institution Name</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Country</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Registration No.</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitutions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    No institutions match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInstitutions.map((inst) => (
                  <tr key={inst.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {inst.name}
                      {inst.website && (
                        <a href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>
                          {inst.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>📍 {inst.country || 'N/A'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#334155', fontFamily: 'monospace', fontWeight: 600 }}>{inst.registrationNumber || 'N/A'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#5d6a7c', textTransform: 'capitalize' }}>{(inst.institutionType || 'corporate').replace('_', ' ')}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{getStatusBadge(inst.isActive)}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(inst, true)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.785rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #2563eb',
                            background: '#2563eb',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          ✏️ Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(inst, false)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.785rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          View
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

      {/* View / Edit Modal */}
      {selectedInst && (
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
          onClick={handleCloseModal}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', background: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#60a5fa', textTransform: 'uppercase', display: 'block' }}>
                  {isEditMode ? 'ADMIN EDIT MODE' : 'INSTITUTION RECORD'}
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {isEditMode ? `Edit ${selectedInst.name}` : selectedInst.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {isEditMode ? (
              <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Official Institution Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={editForm.registrationNumber}
                      onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Institution Type
                    </label>
                    <select
                      value={editForm.institutionType}
                      onChange={(e) => setEditForm({ ...editForm, institutionType: e.target.value })}
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
                      Country <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Official Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Year Established
                    </label>
                    <input
                      type="number"
                      value={editForm.yearEstablished}
                      onChange={(e) => setEditForm({ ...editForm, yearEstablished: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Account Status
                    </label>
                    <select
                      value={editForm.isActive ? 'active' : 'suspended'}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="active">Active (Can Login)</option>
                      <option value="suspended">Suspended (Locked Out)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Directory Visibility
                    </label>
                    <select
                      value={editForm.showInDirectory ? 'visible' : 'hidden'}
                      onChange={(e) => setEditForm({ ...editForm, showInDirectory: e.target.value === 'visible' })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="visible">Visible (Listed on Public Directory)</option>
                      <option value="hidden">Hidden (Removed from Directory)</option>
                    </select>
                  </div>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '1rem 0 0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      Social Media Links
                    </h4>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={editForm.facebookUrl}
                      onChange={(e) => setEditForm({ ...editForm, facebookUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={editForm.instagramUrl}
                      onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={editForm.linkedinUrl}
                      onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      X (Twitter) URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/..."
                      value={editForm.twitterUrl}
                      onChange={(e) => setEditForm({ ...editForm, twitterUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Physical Headquarters Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      About / Institution Overview (Public Profile)
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={saving}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Registration Number</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{selectedInst.registrationNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Institution Type</div>
                    <div style={{ color: '#0f172a', marginTop: '0.2rem', textTransform: 'capitalize' }}>{(selectedInst.institutionType || 'corporate').replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Country</div>
                    <div style={{ color: '#0f172a', marginTop: '0.2rem' }}>📍 {selectedInst.country || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Year Established</div>
                    <div style={{ color: '#0f172a', marginTop: '0.2rem' }}>{selectedInst.yearEstablished || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Contact Email</div>
                    <div style={{ color: '#2563eb', fontWeight: 600 }}>{selectedInst.email || 'N/A'}</div>
                  </div>
                  {selectedInst.phone && (
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phone</div>
                      <div style={{ color: '#0f172a' }}>{selectedInst.phone}</div>
                    </div>
                  )}
                  {selectedInst.website && (
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Website</div>
                      <a href={selectedInst.website.startsWith('http') ? selectedInst.website : `https://${selectedInst.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>{selectedInst.website}</a>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Physical Address</div>
                    <div style={{ color: '#334155' }}>{selectedInst.address || 'No address logged.'}</div>
                  </div>
                </div>

                {selectedInst.description && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>About / Overview</div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>{selectedInst.description}</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
