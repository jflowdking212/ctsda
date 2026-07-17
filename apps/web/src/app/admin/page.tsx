'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const adminNav = [
  { href: '#queue', label: 'Queue', roles: ['super_admin', 'reviewer', 'support_officer'] },
  { href: '#institutions', label: 'Institutions', roles: ['super_admin', 'support_officer', 'content_manager'] },
  { href: '#settings', label: 'Settings', roles: ['super_admin', 'reviewer', 'finance_officer', 'support_officer', 'content_manager', 'auditor'] },
  { href: '#users', label: 'Users', roles: ['super_admin'] },
  { href: '#audit', label: 'Audit Logs', roles: ['super_admin', 'auditor'] },
];

const statuses = [
  'draft',
  'submitted',
  'under_review',
  'changes_requested',
  'resubmitted',
  'final_review',
  'approved',
  'rejected',
];

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isTotpEnabled: boolean;
};

export default function AdminDashboard() {
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [status, setStatus] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const visibleNav = useMemo(
    () => adminNav.filter((item) => profile && item.roles.includes(profile.role)),
    [profile],
  );

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;
    void loadApplications();
    if (['super_admin', 'support_officer', 'content_manager'].includes(profile.role)) void loadInstitutions();
    if (profile.role === 'super_admin') void loadUsers();
    if (['super_admin', 'auditor'].includes(profile.role)) void loadAuditLogs();
  }, [profile, status]);

  async function api(path: string, init?: RequestInit) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  async function loadProfile() {
    try {
      const response = await api('/admin/me');
      setProfile(await response.json());
    } catch {
      setProfile(null);
    }
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(totpCode && { totpCode }) }),
    });
    const result = await response.json();
    if (result.requiresTotp) {
      setRequiresTotp(true);
      setMessage('Enter your authenticator code to continue.');
      return;
    }
    await loadProfile();
  }

  async function loadApplications() {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await api(`/admin/applications${query}`);
    setApplications(await response.json());
  }

  async function loadApplication(id: string) {
    const response = await api(`/admin/applications/${id}`);
    setSelectedApplication(await response.json());
  }

  async function loadInstitutions() {
    const response = await api('/admin/institutions');
    setInstitutions(await response.json());
  }

  async function loadUsers() {
    const response = await api('/admin/users');
    setUsers(await response.json());
  }

  async function loadAuditLogs() {
    const response = await api('/admin/audit-logs');
    setAuditLogs(await response.json());
  }

  async function action(path: string, body: Record<string, unknown> = {}) {
    setMessage('');
    await api(path, { method: 'POST', body: JSON.stringify(body) });
    setMessage('Action completed.');
    await loadApplications();
    if (selectedApplication) await loadApplication(selectedApplication.id);
  }

  async function exportCsv() {
    const response = await fetch(`${API_BASE}/admin/institutions/export.csv`, { credentials: 'include' });
    if (!response.ok) throw new Error(await response.text());
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ctsda-institutions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!profile) {
    return (
      <main className="admin-login">
        <form className="admin-login-panel" onSubmit={login}>
          <Link className="admin-brand" href="/">
            CTSDA
          </Link>
          <h1>Admin Dashboard</h1>
          <p>Sign in with your administrator credentials and authenticator code.</p>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          {requiresTotp && (
            <label>
              Authenticator code
              <input value={totpCode} onChange={(event) => setTotpCode(event.target.value)} inputMode="numeric" required />
            </label>
          )}
          <button className="admin-button primary" type="submit">
            {requiresTotp ? 'Verify & Continue' : 'Continue'}
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          CTSDA
        </Link>
        <div className="admin-profile">
          <strong>
            {profile.firstName} {profile.lastName}
          </strong>
          <span>{profile.role.replace(/_/g, ' ')}</span>
        </div>
        <nav>
          {visibleNav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Operations</p>
            <h1>Admin Dashboard</h1>
          </div>
          <Link className="admin-button" href="/portal">
            Applicant Portal
          </Link>
        </header>

        {message && <p className="admin-message success">{message}</p>}

        <section className="admin-section" id="queue">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Applications</p>
              <h2>Review queue</h2>
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-grid two">
            <div className="admin-table">
              {applications.map((application) => (
                <button key={application.id} type="button" onClick={() => loadApplication(application.id)}>
                  <strong>{application.institution?.name || 'Untitled institution'}</strong>
                  <span>{application.status.replace(/_/g, ' ')}</span>
                  <small>{application.applicant?.email}</small>
                </button>
              ))}
              {applications.length === 0 && <p>No applications match this filter.</p>}
            </div>
            <ApplicationDetail application={selectedApplication} onAction={action} />
          </div>
        </section>

        {['super_admin', 'support_officer', 'content_manager'].includes(profile.role) && (
          <section className="admin-section" id="institutions">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Institutions</p>
                <h2>Management</h2>
              </div>
              {['super_admin', 'support_officer'].includes(profile.role) && (
                <button className="admin-button primary" type="button" onClick={exportCsv}>
                  Export CSV
                </button>
              )}
            </div>
            <div className="admin-card-list">
              {institutions.map((institution) => (
                <article className="admin-card" key={institution.id}>
                  <h3>{institution.name}</h3>
                  <p>{institution.country}</p>
                  <span>{institution.isActive ? 'Active' : 'Inactive'}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="admin-section" id="settings">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Settings</p>
              <h2>Password and 2FA</h2>
            </div>
          </div>
          <div className="admin-card-list">
            <article className="admin-card">
              <h3>Two-factor authentication</h3>
              <p>{profile.isTotpEnabled ? 'Enabled for this account.' : 'Setup required before privileged access.'}</p>
              <Link className="admin-button" href="/portal">
                Manage 2FA
              </Link>
            </article>
            <PasswordPanel api={api} />
          </div>
        </section>

        {profile.role === 'super_admin' && (
          <section className="admin-section" id="users">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Users</p>
                <h2>Role administration</h2>
              </div>
            </div>
            <div className="admin-card-list">
              {users.map((user) => (
                <article className="admin-card" key={user.id}>
                  <h3>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p>{user.email}</p>
                  <span>{user.role.replace(/_/g, ' ')}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {['super_admin', 'auditor'].includes(profile.role) && (
          <section className="admin-section" id="audit">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Audit</p>
                <h2>Read-only activity log</h2>
              </div>
            </div>
            <div className="admin-table">
              {auditLogs.map((log) => (
                <div className="audit-row" key={log.id}>
                  <strong>{log.action}</strong>
                  <span>{log.user?.email}</span>
                  <small>{new Date(log.createdAt).toLocaleString()}</small>
                </div>
              ))}
              {auditLogs.length === 0 && <p>No audit entries yet.</p>}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function ApplicationDetail({ application, onAction }: { application: any | null; onAction: (path: string, body?: Record<string, unknown>) => Promise<void> }) {
  if (!application) {
    return (
      <article className="admin-detail">
        <h2>Select an application</h2>
        <p>Checklist, comments, notes, and review actions will appear here.</p>
      </article>
    );
  }

  return (
    <article className="admin-detail">
      <p className="admin-kicker">Application detail</p>
      <h2>{application.institution?.name}</h2>
      <p>{application.reviewerNotes || 'No internal reviewer notes yet.'}</p>
      <div className="detail-actions">
        <button type="button" onClick={() => onAction(`/admin/applications/${application.id}/approve`, { reason: 'Approved in dashboard' })}>
          Approve
        </button>
        <button type="button" onClick={() => onAction(`/admin/applications/${application.id}/request-changes`, { reason: 'Changes requested' })}>
          Request changes
        </button>
        <button type="button" onClick={() => onAction(`/admin/applications/${application.id}/reject`, { reason: 'Rejected in dashboard' })}>
          Reject
        </button>
        <button type="button" onClick={() => onAction(`/admin/applications/${application.id}/undo-reject`, { reason: 'Undo rejection' })}>
          Undo reject
        </button>
      </div>
      <h3>Checklist</h3>
      <ul className="checklist">
        {application.checklistItems?.map((item: any) => (
          <li key={item.id}>
            <span>{item.isCompleted ? 'Done' : 'Open'}</span>
            {item.label}
          </li>
        ))}
      </ul>
      <h3>Comments</h3>
      <div className="comments">
        {application.comments?.map((comment: any) => (
          <p key={comment.id}>{comment.content}</p>
        ))}
      </div>
    </article>
  );
}

function PasswordPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api('/admin/settings/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setCurrentPassword('');
    setNewPassword('');
    setMessage('Password changed.');
  }

  return (
    <form className="admin-card settings-form" onSubmit={submit}>
      <h3>Change password</h3>
      <label>
        Current password
        <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" required />
      </label>
      <label>
        New password
        <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" required />
      </label>
      <button className="admin-button primary" type="submit">
        Save password
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
