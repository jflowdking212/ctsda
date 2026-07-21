'use client';

import React, { useState, useEffect } from 'react';

const S = {
  panel: { padding: '2rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const },
  name: { fontWeight: 500, color: '#0f172a' },
  email: { color: '#64748b', fontSize: '0.875rem' },
  roleChip: (role: string) => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: role === 'super_admin' ? '#ede9fe' : role === 'reviewer' ? '#dbeafe' : '#f0fdf4',
    color: role === 'super_admin' ? '#6d28d9' : role === 'reviewer' ? '#1d4ed8' : '#15803d',
  }),
  activeBadge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#16a34a' } as React.CSSProperties,
  suspendedBadge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#dc2626' } as React.CSSProperties,
  suspendBtn: { padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  activateBtn: { padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #86efac', backgroundColor: '#fff', color: '#16a34a', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  newBtn: { padding: '0.6rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#0f766e', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
};

export function UsersPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const response = await api('/admin/users');
      setUsers(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    setBusy(id);
    try {
      await api(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      await loadUsers();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>User Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage roles and account access for all registered users.</p>
        </div>
        <button style={S.newBtn}>Invite User</button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading users...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Name</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ transition: 'background 0.15s' }}>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#0369a1', flexShrink: 0 }}>
                        {(u.firstName?.[0] || '?')}{(u.lastName?.[0] || '')}
                      </div>
                      <span style={S.name}>{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={S.email}>{u.email}</span></td>
                  <td style={S.td}><span style={S.roleChip(u.role)}>{u.role?.replace('_', ' ')}</span></td>
                  <td style={S.td}>
                    <span style={u.isActive ? S.activeBadge : S.suspendedBadge}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(u.id, u.isActive)}
                      disabled={busy === u.id}
                      style={u.isActive ? S.suspendBtn : S.activateBtn}
                    >
                      {busy === u.id ? '...' : u.isActive ? 'Suspend' : 'Activate'}
                    </button>
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
