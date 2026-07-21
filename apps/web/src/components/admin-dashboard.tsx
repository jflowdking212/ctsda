'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { UsersPanel } from './admin/users-panel';
import { SettingsPanel } from './admin/settings-panel';
import { BlogPanel } from './admin/blog-panel';
import { BillingPanel } from './admin/billing-panel';
import { TrainingPanel } from './admin/training-panel';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const ADMIN_SESSION_KEY = 'ctsda_admin_session';

const adminNav = [
  { href: '/admin/reports', section: 'reports', label: 'Reports', roles: ['super_admin', 'reviewer', 'finance_officer', 'support_officer', 'auditor'] },
  { href: '/admin/queue', section: 'queue', label: 'Queue', roles: ['super_admin', 'reviewer', 'support_officer'] },
  { href: '/admin/institutions', section: 'institutions', label: 'Institutions', roles: ['super_admin', 'support_officer', 'content_manager'] },
  { href: '/admin/billing', section: 'billing', label: 'Billing & Orders', roles: ['super_admin', 'finance_officer'] },
  { href: '/admin/users', section: 'users', label: 'Users', roles: ['super_admin'] },
  { href: '/admin/blog', section: 'blog', label: 'CMS / Blog', roles: ['super_admin', 'content_manager'] },
  { href: '/admin/training', section: 'training', label: 'Training', roles: ['super_admin', 'content_manager'] },
  { href: '/admin/settings', section: 'settings', label: 'Settings', roles: ['super_admin'] },
  { href: '/admin/audit', section: 'audit', label: 'Audit Logs', roles: ['super_admin', 'auditor'] },
];

export type AdminSection = 'reports' | 'queue' | 'institutions' | 'billing' | 'users' | 'blog' | 'training' | 'settings' | 'audit';

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

const sectionMeta: Record<AdminSection, { title: string; eyebrow: string; description: string }> = {
  reports: {
    title: 'Reports',
    eyebrow: 'Executive overview',
    description: 'Monitor application velocity, reviewer activity, accreditation status, and payment performance.',
  },
  queue: {
    title: 'Review queue',
    eyebrow: 'Application operations',
    description: 'Review submissions, update decisions, record payments, and manage applicant follow-up.',
  },
  institutions: {
    title: 'Institutions',
    eyebrow: 'Directory management',
    description: 'Maintain institution records, accreditation visibility, and exportable directory data.',
  },
  billing: {
    title: 'Billing & Orders',
    eyebrow: 'Financial management',
    description: 'Manage manual orders and active subscriptions.',
  },
  blog: {
    title: 'CMS / Blog',
    eyebrow: 'Content Management',
    description: 'Publish and edit articles for the public blog.',
  },
  training: {
    title: 'Training Resources',
    eyebrow: 'Training Management',
    description: 'Manage training modules, videos, and downloadable resources for learners.',
  },
  settings: {
    title: 'Global Settings',
    eyebrow: 'Platform configuration',
    description: 'Manage site identity and global configuration.',
  },
  users: {
    title: 'Users',
    eyebrow: 'Role administration',
    description: 'Review administrative accounts, access levels, and operational responsibility.',
  },
  audit: {
    title: 'Audit logs',
    eyebrow: 'Compliance trail',
    description: 'Inspect recorded administrative events and security-relevant activity.',
  },
};

async function readErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}.`;
  const text = await response.text().catch(() => '');

  if (!text) return fallback;

  try {
    const data = JSON.parse(text);
    if (Array.isArray(data.message)) return data.message.join(' ');
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (data.error && typeof data.error.message === 'string') return data.error.message;
  } catch {
    // Some API errors are plain text.
  }

  return text;
}

function readStoredSession() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_SESSION_KEY) || '';
}

function storeSession(sessionId?: string) {
  if (typeof window === 'undefined' || !sessionId) return;
  window.localStorage.setItem(ADMIN_SESSION_KEY, sessionId);
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isTotpEnabled: boolean;
  sessionId?: string;
};

let globalAdminProfile: AdminUser | null = null;

export function AdminDashboard({ section = 'reports' }: { section?: AdminSection }) {
  const [profile, setProfile] = useState<AdminUser | null>(globalAdminProfile);
  const [checkingSession, setCheckingSession] = useState(!globalAdminProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [status, setStatus] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [, setUsers] = useState<any[]>([]); // users state is set by sub-panels
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [workingAction, setWorkingAction] = useState('');
  const [exporting, setExporting] = useState('');

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  async function logout() {
    setMessage(' ');
    try {
      await api('/auth/logout', { method: 'POST' });
      clearStoredSession();
      globalAdminProfile = null;
      setProfile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  }



  const visibleNav = useMemo(
    () => adminNav.filter((item) => profile && item.roles.includes(profile.role)),
    [profile],
  );
  const currentSection = sectionMeta[section];

  useEffect(() => {
    void loadProfile(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (section === 'reports') void loadReportSummary();
    if (section === 'queue') void loadApplications();
    if (section === 'institutions' && ['super_admin', 'support_officer', 'content_manager'].includes(profile.role)) void loadInstitutions();
    if (section === 'users' && profile.role === 'super_admin') void loadUsers();
    if (section === 'audit' && ['super_admin', 'auditor'].includes(profile.role)) void loadAuditLogs();
  }, [profile, section, status]);

  async function api(path: string, init?: RequestInit) {
    const storedSession = readStoredSession();
    let response: Response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
          ...(init?.headers || {}),
        },
      });
    } catch {
      throw new Error('Admin API is not reachable. Please make sure the backend server is running.');
    }

    if (!response.ok) {
      const message = await readErrorMessage(response);
      throw new Error(message);
    }
    return response;
  }

  async function apiWithSessionRetry(path: string, init?: RequestInit) {
    try {
      return await api(path, init);
    } catch (error) {
      if (readStoredSession() && error instanceof Error && /invalid|expired|no session|unauthorized/i.test(error.message)) {
        clearStoredSession();
        return api(path, init);
      }
      throw error;
    }
  }

  async function loadProfile(isInitialCheck = false) {
    if (isInitialCheck) {
      if (globalAdminProfile) {
        setCheckingSession(false);
        return;
      }
      setCheckingSession(true);
    }
    try {
      const response = await apiWithSessionRetry('/admin/me');
      const profile = await response.json();
      storeSession(profile.sessionId);
      globalAdminProfile = profile;
      setProfile(profile);
    } catch (error) {
      if (error instanceof Error && /invalid|expired|no session|unauthorized/i.test(error.message)) {
        clearStoredSession();
      }
      globalAdminProfile = null;
      setProfile(null);
    } finally {
      if (isInitialCheck) setCheckingSession(false);
    }
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoginLoading(true);
    try {
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
      if (result.requiresPasswordReset) {
        setMessage(result.message || 'Password reset is required before dashboard access.');
        return;
      }
      storeSession(result.accessToken);
      await loadProfile();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const response = await api(`/admin/applications${query}`);
      setApplications(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load applications.');
    }
  }

  async function loadApplication(id: string) {
    try {
      const response = await api(`/admin/applications/${id}`);
      setSelectedApplication(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load application.');
    }
  }

  async function loadInstitutions() {
    try {
      const response = await api('/admin/institutions');
      setInstitutions(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load institutions.');
    }
  }

  async function loadUsers() {
    try {
      const response = await api('/admin/users');
      setUsers(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load users.');
    }
  }

  async function loadAuditLogs() {
    try {
      const response = await api('/admin/audit-logs');
      setAuditLogs(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load audit logs.');
    }
  }

  async function loadReportSummary() {
    try {
      const response = await api('/admin/reports/summary');
      setReportSummary(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load report summary.');
    }
  }

  async function action(path: string, body: Record<string, unknown> = {}) {
    setMessage('');
    setWorkingAction(path);
    try {
      await api(path, { method: 'POST', body: JSON.stringify(body) });
      setMessage('Action completed.');
      await loadApplications();
      if (selectedApplication) await loadApplication(selectedApplication.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action could not be completed.');
    } finally {
      setWorkingAction('');
    }
  }

  async function exportCsv() {
    setExporting('institutions');
    try {
      const response = await fetch(`${API_BASE}/admin/institutions/export.csv`, { credentials: 'include' });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'ctsda-institutions.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setExporting('');
    }
  }

  async function exportBoardReport(format: 'csv' | 'pdf') {
    setExporting(`board-${format}`);
    try {
      const response = await fetch(`${API_BASE}/admin/reports/export.${format}`, { credentials: 'include' });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ctsda-board-report.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setExporting('');
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-login">
        <section className="admin-login-panel">
          <Link className="admin-brand" href="/">
            <img src="/images/logo-ctsda.png" alt="" />
            <span>
              <strong>CTSDA</strong>
              <small>Administration</small>
            </span>
          </Link>
          <h1>Admin Dashboard</h1>
          <p className="loading-inline">Checking your admin session...</p>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="admin-login">
        <form className="admin-login-panel" onSubmit={login}>
          <Link className="admin-brand" href="/">
            <img src="/images/logo-ctsda.png" alt="" />
            <span>
              <strong>CTSDA</strong>
              <small>Administration</small>
            </span>
          </Link>
          <h1>Admin Dashboard</h1>
          <p>Sign in with your administrator credentials and authenticator code.</p>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required disabled={loginLoading} />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required disabled={loginLoading} />
          </label>
          {requiresTotp && (
            <label>
              Authenticator code
              <input value={totpCode} onChange={(event) => setTotpCode(event.target.value)} inputMode="numeric" required disabled={loginLoading} />
            </label>
          )}
          <button className={loginLoading ? 'admin-button primary is-loading' : 'admin-button primary'} type="submit" disabled={loginLoading}>
            {loginLoading ? (requiresTotp ? 'Verifying...' : 'Signing in...') : requiresTotp ? 'Verify & Continue' : 'Continue'}
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        flexShrink: 0, 
        zIndex: 50, 
        height: '70px', 
        padding: '0 1.25rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <img src="/images/logo-ctsda.png" alt="CTSDA" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }} className="admin-header-title">
              <strong style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a192f', lineHeight: 1, margin: '0 0 2px 0' }}>CTSDA</strong>
              <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, lineHeight: 1 }}>Administration</small>
            </div>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="admin-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, padding: '0.4rem 0.75rem' }} type="button" onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span className="admin-header-logout-text">Logout</span>
          </button>
          <button className="admin-sidebar-toggle" style={{ margin: 0 }} type="button" onClick={() => setIsMobileNavOpen((prev) => !prev)} aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileNavOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 640px) {
          .admin-header-title { display: none !important; }
          .admin-header-logout-text { display: none !important; }
        }
      `}</style>

      <main className="admin-shell" style={{ flex: 1, minHeight: 'calc(100vh - 70px)' }}>
        <aside className={`admin-sidebar ${isMobileNavOpen ? 'is-open' : ''}`} style={{ top: '70px', height: 'calc(100vh - 70px)' }}>
          <div className="admin-profile" style={{ marginTop: '1rem' }}>
            <div className="admin-avatar" aria-hidden="true">
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>
            <div className="admin-profile-info">
              <strong>
                {profile.firstName} {profile.lastName}
              </strong>
              <span>{profile.role.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {isMobileNavOpen && <button className="admin-sidebar-close" type="button" onClick={() => setIsMobileNavOpen(false)} aria-label="Close menu" style={{position:'absolute',top:'0.5rem',right:'0.5rem',width:'2.25rem',height:'2.25rem',color:'#0a192f',background:'none',border:'none',borderRadius:'0.5rem',cursor:'pointer',zIndex:5,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>}
          <nav className={`admin-sidebar-nav ${isMobileNavOpen ? 'is-open' : ''}`}>
          {visibleNav.map((item) => {
            const iconPaths: Record<string, string> = {
              reports: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              queue: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
              institutions: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
              billing: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
              blog: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
              settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
              users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
              audit: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            };
            return (
              <Link className={item.section === section ? 'active' : undefined} key={item.href} href={item.href} onClick={() => setIsMobileNavOpen(false)}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[item.section]} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {isMobileNavOpen && <div className="admin-sidebar-overlay is-open" onClick={() => setIsMobileNavOpen(false)} aria-hidden="true" />}

      <section className="admin-main">
        {/* Inner header moved to top-level admin-layout */}

        {/* Page Content Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div>
              <p className="admin-kicker">{currentSection.eyebrow}</p>
              <h1>{currentSection.title}</h1>
              <p className="hidden md:block">{currentSection.description}</p>
            </div>
          </div>
          <div className="admin-actions">
            <Link className="admin-button" href="/portal">
              Applicant Portal
            </Link>
          </div>
        </header>

        {message && <p className="admin-message success">{message}</p>}

        {section === 'reports' && (
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Reporting</p>
              <h2>Pipeline analytics</h2>
            </div>
            <div className="admin-actions">
              <button
                className={exporting === 'board-csv' ? 'admin-button is-loading' : 'admin-button'}
                type="button"
                onClick={() => exportBoardReport('csv')}
                disabled={Boolean(exporting)}
              >
                {exporting === 'board-csv' ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                className={exporting === 'board-pdf' ? 'admin-button primary is-loading' : 'admin-button primary'}
                type="button"
                onClick={() => exportBoardReport('pdf')}
                disabled={Boolean(exporting)}
              >
                {exporting === 'board-pdf' ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
          <ReportPanel summary={reportSummary} />
        </section>
        )}

        {section === 'queue' && (
        <section className="admin-section">
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
            <ApplicationDetail application={selectedApplication} onAction={action} workingAction={workingAction} />
          </div>
        </section>
        )}

        {section === 'institutions' && ['super_admin', 'support_officer', 'content_manager'].includes(profile.role) && (
          <section className="admin-section">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Institutions</p>
                <h2>Management</h2>
              </div>
              {['super_admin', 'support_officer'].includes(profile.role) && (
                <button
                  className={exporting === 'institutions' ? 'admin-button primary is-loading' : 'admin-button primary'}
                  type="button"
                  onClick={exportCsv}
                  disabled={Boolean(exporting)}
                >
                  {exporting === 'institutions' ? 'Exporting...' : 'Export CSV'}
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

        {section === 'billing' && ['super_admin', 'finance_officer'].includes(profile.role) && (
          <BillingPanel api={api} />
        )}

        {section === 'blog' && ['super_admin', 'content_manager'].includes(profile.role) && (
          <BlogPanel api={api} />
        )}

        {section === 'training' && ['super_admin', 'content_manager'].includes(profile.role) && (
          <TrainingPanel api={api} />
        )}

        {section === 'settings' && (
          <>
            <section className="admin-section">
              <div className="admin-section-header">
                <div>
                  <p className="admin-kicker">Security</p>
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
            
            {['super_admin'].includes(profile.role) && (
              <SettingsPanel api={api} />
            )}
          </>
        )}

        {section === 'users' && profile.role === 'super_admin' && (
          <UsersPanel api={api} />
        )}

        {section === 'audit' && ['super_admin', 'auditor'].includes(profile.role) && (
          <section className="admin-section">
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
    </div>
  );
}

function ReportPanel({ summary }: { summary: any | null }) {
  if (!summary) {
    return <p>Loading analytics...</p>;
  }

  const metrics = [
    ['New applications', summary.pipeline.newApplications30d, 'Last 30 days'],
    ['Total applications', summary.pipeline.totalApplications, 'All time'],
    ['Avg review time', `${summary.pipeline.averageReviewDays} days`, 'Submitted to decision'],
    ['Approval rate', `${Math.round(summary.pipeline.approvalRate * 100)}%`, 'Approved vs rejected'],
    ['Active accreditations', summary.accreditations.active, 'Currently valid'],
    ['Expiring soon', summary.accreditations.expiringIn90Days, 'Next 90 days'],
    ['Completed revenue', summary.revenue.completedAmount, 'Paid invoices'],
    ['Paid transactions', summary.revenue.completedPayments, 'Completed payments'],
  ];

  return (
    <div className="report-stack">
      <div className="metric-grid">
        {metrics.map(([label, value, hint]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </div>

      <div className="report-grid">
        <ReportList
          title="Applications by status"
          items={summary.pipeline.applicationsByStatus.map((item: any) => ({
            label: item.status.replace(/_/g, ' '),
            value: item.count,
          }))}
        />
        <ReportList
          title="Countries represented"
          items={summary.institutions.countriesRepresented.map((item: any) => ({
            label: item.country,
            value: item.count,
          }))}
        />
        <ReportList
          title="Popular training areas"
          items={summary.trainingAreas.map((item: any) => ({
            label: item.name,
            value: item.applications,
          }))}
        />
        <ReportList
          title="Reviewer workload"
          items={summary.reviewers.map((item: any) => ({
            label: item.name,
            value: item.openReviews,
          }))}
        />
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  return (
    <article className="report-list">
      <h3>{title}</h3>
      {items.length === 0 && <p>No data yet.</p>}
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </article>
  );
}

function ApplicationDetail({
  application,
  onAction,
  workingAction,
}: {
  application: any | null;
  onAction: (path: string, body?: Record<string, unknown>) => Promise<void>;
  workingAction: string;
}) {
  const [manualReference, setManualReference] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  if (!application) {
    return (
      <article className="admin-detail">
        <h2>Select an application</h2>
        <p>Checklist, comments, notes, and review actions will appear here.</p>
      </article>
    );
  }

  const manualPaymentPath = `/admin/applications/${application.id}/manual-payment`;
  const actionBusy = Boolean(workingAction);

  return (
    <article className="admin-detail">
      <p className="admin-kicker">Application detail</p>
      <h2>{application.institution?.name}</h2>
      
      {application.institution && (
        <div className="institution-details" style={{ fontSize: '0.9rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
          <p style={{ margin: '0 0 0.5rem' }}><strong>Registration:</strong> {application.institution.registrationNumber}</p>
          <p style={{ margin: '0 0 0.5rem' }}><strong>Type:</strong> {application.institution.institutionType}</p>
          <p style={{ margin: '0 0 0.5rem' }}><strong>Location:</strong> {application.institution.country} - {application.institution.address}</p>
          <p style={{ margin: 0 }}><strong>Contact:</strong> {application.institution.email} | {application.institution.phone}</p>
        </div>
      )}

      {application.accreditations?.length > 0 && (
        <div className="accreditation-summary" style={{ fontSize: '0.9rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '0.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#047857' }}>Accreditation Details</h3>
          {application.accreditations.map((acc: any) => (
            <div key={acc.id} style={{ marginBottom: '0.5rem' }}>
              <p style={{ margin: '0 0 0.25rem' }}><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{acc.status}</span></p>
              <p style={{ margin: '0 0 0.25rem' }}><strong>Certificate Token:</strong> <code style={{ userSelect: 'all', background: '#d1fae5', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>{acc.certificateToken}</code></p>
              {acc.accreditationCode && <p style={{ margin: '0 0 0.25rem' }}><strong>Accreditation Code:</strong> <code style={{ userSelect: 'all', background: '#d1fae5', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>{acc.accreditationCode}</code></p>}
              <p style={{ margin: 0 }}><strong>Valid until:</strong> {new Date(acc.expiresAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <p>{application.reviewerNotes || 'No internal reviewer notes yet.'}</p>
      <div className="payment-summary">
        <h3>Payment</h3>
        {application.invoices?.length ? (
          application.invoices.map((invoice: any) => (
            <p key={invoice.id}>
              {invoice.invoiceNumber} - {invoice.status} - {invoice.currency} {invoice.amount}
            </p>
          ))
        ) : (
          <p>No invoice has been generated yet.</p>
        )}
      </div>
      <form
        className="manual-payment-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onAction(`/admin/applications/${application.id}/manual-payment`, {
            reference: manualReference,
            notes: manualNotes,
            ...(manualAmount && { amount: Number(manualAmount) }),
          }).then(() => {
            setManualReference('');
            setManualAmount('');
            setManualNotes('');
          });
        }}
      >
        <h3>Record manual payment</h3>
        <label>
          Reference
          <input
            value={manualReference}
            onChange={(event) => setManualReference(event.target.value)}
            placeholder="Bank transfer reference"
            required
            disabled={actionBusy}
          />
        </label>
        <label>
          Amount
          <input
            value={manualAmount}
            onChange={(event) => setManualAmount(event.target.value)}
            inputMode="numeric"
            placeholder="Leave blank to use invoice amount"
            disabled={actionBusy}
          />
        </label>
        <label>
          Notes
          <input
            value={manualNotes}
            onChange={(event) => setManualNotes(event.target.value)}
            placeholder="Optional receipt note"
            disabled={actionBusy}
          />
        </label>
        <button
          className={workingAction === manualPaymentPath ? 'is-loading' : undefined}
          type="submit"
          disabled={actionBusy}
        >
          {workingAction === manualPaymentPath ? 'Recording payment...' : 'Mark paid manually'}
        </button>
      </form>
      <div className="detail-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        {['submitted'].includes(application.status) && (
          <button
            className={`admin-button ${workingAction.endsWith('/start-review') ? 'is-loading' : ''}`}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/start-review`)}
            disabled={actionBusy}
          >
            Start Review
          </button>
        )}
        {['under_review', 'final_review'].includes(application.status) && (
          <button
            className={`admin-button ${workingAction.endsWith('/approve') ? 'is-loading' : ''}`}
            style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/approve`, { reason: 'Approved in dashboard' })}
            disabled={actionBusy}
          >
            {workingAction.endsWith('/approve') ? 'Approving...' : 'Approve'}
          </button>
        )}
        {['submitted', 'under_review', 'initial_screening'].includes(application.status) && (
          <button
            className={`admin-button ${workingAction.endsWith('/request-changes') ? 'is-loading' : ''}`}
            style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/request-changes`, { reason: 'Changes requested' })}
            disabled={actionBusy}
          >
            {workingAction.endsWith('/request-changes') ? 'Sending...' : 'Request changes'}
          </button>
        )}
        {['submitted', 'initial_screening', 'under_review', 'final_review'].includes(application.status) && (
          <button
            className={`admin-button ${workingAction.endsWith('/reject') && !workingAction.endsWith('/undo-reject') ? 'is-loading' : ''}`}
            style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/reject`, { reason: 'Rejected in dashboard' })}
            disabled={actionBusy}
          >
            {workingAction.endsWith('/reject') && !workingAction.endsWith('/undo-reject') ? 'Rejecting...' : 'Reject'}
          </button>
        )}
        {application.status === 'rejected' && (
          <button
            className={`admin-button ${workingAction.endsWith('/undo-reject') ? 'is-loading' : ''}`}
            style={{ backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' }}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/undo-reject`, { reason: 'Undo rejection' })}
            disabled={actionBusy}
          >
            {workingAction.endsWith('/undo-reject') ? 'Restoring...' : 'Undo reject'}
          </button>
        )}
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
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api('/admin/settings/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password changed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password could not be changed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-card settings-form" onSubmit={submit}>
      <h3>Change password</h3>
      <label>
        Current password
        <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" required disabled={loading} />
      </label>
      <label>
        New password
        <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" required disabled={loading} />
      </label>
      <button className={loading ? 'admin-button primary is-loading' : 'admin-button primary'} type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
