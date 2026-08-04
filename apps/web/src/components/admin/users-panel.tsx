'use client';

import React, { useState, useEffect } from 'react';

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT_OFFICER' | 'FINANCE_OFFICER' | 'CONTENT_MANAGER' | 'AUDITOR' | 'ADMIN' | 'USER';

export interface AdminUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: AdminRole;
  lastLogin?: string;
  isActive: boolean;
  status?: 'active' | 'inactive';
}

const RECENT_AUDIT_LOGS = [
  { action: 'Role Update', detail: 'Elena Rostova granted Finance Officer credentials', time: '10 mins ago', admin: 'Sarah Jenkins' },
  { action: 'User Invitation', detail: 'Sent admin invitation to Dr. Arthur Pendelton', time: '2 hours ago', admin: 'Victoria Sterling' },
  { action: 'Security Policy', detail: 'Enforced 2FA requirements across all active admins', time: 'Yesterday', admin: 'Sarah Jenkins' },
];

export function UsersPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Modals & messages state
  const [editRoleUser, setEditRoleUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('SUPPORT_OFFICER');
  
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteFirstName, setInviteFirstName] = useState<string>('');
  const [inviteLastName, setInviteLastName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('SUPPORT_OFFICER');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api('/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to fetch users', e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [api]);

  // Helper badge formatters
  const getRoleBadgeStyle = (role: string) => {
    const r = role.toUpperCase();
    let background = '#f1f5f9';
    let color = '#475569';
    if (r === 'SUPER_ADMIN' || r === 'ADMIN') {
      background = '#f3e8ff';
      color = '#6b21a8';
    } else if (r === 'SUPPORT_OFFICER') {
      background = '#dbeafe';
      color = '#1e40af';
    } else if (r === 'FINANCE_OFFICER') {
      background = '#dcfce7';
      color = '#166534';
    } else if (r === 'CONTENT_MANAGER') {
      background = '#ffedd5';
      color = '#c2410c';
    }
    return {
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      background,
      color,
    };
  };

  const getStatusBadgeStyle = (isActive: boolean) => {
    const background = isActive ? '#dcfce7' : '#fee2e2';
    const color = isActive ? '#166534' : '#991b1b';
    return {
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      background,
      color,
    };
  };

  const formatRoleLabel = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getUserName = (usr: AdminUser) => {
    if (usr.firstName || usr.lastName) {
      return `${usr.firstName || ''} ${usr.lastName || ''}`.trim();
    }
    return usr.name || 'Unknown User';
  };

  // Actions
  const handleToggleStatus = async (usr: AdminUser) => {
    const nextStatus = !usr.isActive;
    try {
      const updated = users.map(u => u.id === usr.id ? { ...u, isActive: nextStatus } : u);
      setUsers(updated);
      setMessage({
        text: `User ${getUserName(usr)} has been ${nextStatus ? 'activated' : 'deactivated'}. (API pending)`,
        type: 'success',
      });
    } catch (e) {
      setMessage({ text: 'Failed to toggle status.', type: 'error' });
    }
  };

  const handleResetPassword = (usr: AdminUser) => {
    setMessage({
      text: `Password reset link has been dispatched to ${usr.email}. (API pending)`,
      type: 'success',
    });
  };

  const handleSaveRole = async () => {
    if (!editRoleUser) return;
    try {
      const updated = users.map(u => u.id === editRoleUser.id ? { ...u, role: selectedRole } : u);
      setUsers(updated);
      setMessage({
        text: `Role for ${getUserName(editRoleUser)} updated to ${formatRoleLabel(selectedRole)}. (API pending)`,
        type: 'success',
      });
    } catch (e) {
      setMessage({ text: 'Failed to update role.', type: 'error' });
    }
    setEditRoleUser(null);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFirstName.trim() || !inviteEmail.trim()) {
      setMessage({ text: 'Please fill in required fields.', type: 'error' });
      return;
    }
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      firstName: inviteFirstName.trim(),
      lastName: inviteLastName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      lastLogin: '',
      isActive: true,
    };
    setUsers([...users, newUser]);
    setMessage({
      text: `Invitation sent to ${newUser.email} with role ${formatRoleLabel(newUser.role)}. (API pending)`,
      type: 'success',
    });
    setShowInviteModal(false);
    setInviteFirstName('');
    setInviteLastName('');
    setInviteEmail('');
    setInviteRole('SUPPORT_OFFICER');
  };

  const totalAdmins = users.length;
  const superAdmins = users.filter(u => u.role?.toUpperCase() === 'SUPER_ADMIN' || u.role?.toUpperCase() === 'ADMIN').length;
  const activeSessions = users.filter(u => u.isActive).length; // Simplify for now

  return (
    <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with blue left border accent */}
      <div
        className="admin-section-header"
        style={{
          borderLeft: '4px solid #2563eb',
          paddingLeft: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span className="admin-kicker" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            System Administration
          </span>
          <h2 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Users Panel
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            Manage administrator accounts, assign security roles, and monitor active sessions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="admin-button primary"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.375rem',
            backgroundColor: '#2563eb',
            border: '1px solid #2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          + Invite New Admin
        </button>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`admin-message ${message.type}`}
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#166534' : '#991b1b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              marginLeft: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div
        className="metric-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Users
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {totalAdmins}
          </div>
        </div>

        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Active Accounts
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '0.5rem' }}>
            {activeSessions}
          </div>
        </div>

        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Super Admins
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6b21a8', marginTop: '0.5rem' }}>
            {superAdmins}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="admin-card"
        style={{
          background: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            className="admin-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead
              style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
              }}
            >
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Last Login</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No users found.
                  </td>
                </tr>
              ) : users.map(usr => {
                const isHovered = hoveredRow === usr.id;
                const name = getUserName(usr);
                return (
                  <tr
                    key={usr.id}
                    onMouseEnter={() => setHoveredRow(usr.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: isHovered ? '#f8fafc' : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            flexShrink: 0,
                          }}
                        >
                          {name.substring(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {usr.email}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={getRoleBadgeStyle(usr.role)}>
                        {formatRoleLabel(usr.role)}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      {usr.lastLogin ? new Date(usr.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={getStatusBadgeStyle(usr.isActive ?? (usr.status === 'active'))}>
                        {usr.isActive ?? (usr.status === 'active') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button
                          onClick={() => {
                            setEditRoleUser(usr);
                            setSelectedRole(usr.role);
                          }}
                          className="admin-button"
                          style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          Edit Role
                        </button>

                        <button
                          onClick={() => handleToggleStatus(usr)}
                          className={usr.isActive ?? (usr.status === 'active') ? 'admin-button danger' : 'admin-button primary'}
                          style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.375rem',
                            border: `1px solid ${usr.isActive ?? (usr.status === 'active') ? '#dc2626' : '#166534'}`,
                            backgroundColor: usr.isActive ?? (usr.status === 'active') ? '#dc2626' : '#166534',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          {usr.isActive ?? (usr.status === 'active') ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleResetPassword(usr)}
                          className="admin-button"
                          style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          Reset Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Edit Role */}
      {editRoleUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Edit Administrative Role
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              Modify role permissions for <strong>{getUserName(editRoleUser)}</strong> ({editRoleUser.email}).
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Select New Role *
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as AdminRole)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPPORT_OFFICER">Support Officer</option>
                <option value="FINANCE_OFFICER">Finance Officer</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="AUDITOR">Auditor</option>
                <option value="USER">User</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setEditRoleUser(null)}
                className="admin-button"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="admin-button primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #2563eb',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Invite New Admin */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Invite New Administrator
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              Send an official accreditation portal onboarding invitation to a new administrator.
            </p>

            <form onSubmit={handleInviteSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={inviteFirstName}
                    onChange={e => setInviteFirstName(e.target.value)}
                    placeholder="e.g. Jane"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={inviteLastName}
                    onChange={e => setInviteLastName(e.target.value)}
                    placeholder="e.g. Mitchell"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="e.g. j.mitchell@ctsda.org"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                  Assign Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as AdminRole)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT_OFFICER">Support Officer</option>
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="CONTENT_MANAGER">Content Manager</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="USER">User</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="admin-button"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
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
                  className="admin-button primary"
                  style={{
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #2563eb',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
