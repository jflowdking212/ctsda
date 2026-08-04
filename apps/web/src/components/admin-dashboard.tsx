'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BlogPanel } from './admin/blog-panel';
import { TrainingPanel } from './admin/training-panel';
import { QueuePanel } from './admin/queue-panel';
import { DirectoryPanel } from './admin/directory-panel';
import { BillingPanel } from './admin/billing-panel';
import { UsersPanel } from './admin/users-panel';
import { AccreditationsPanel } from './admin/accreditations-panel';
import { SettingsPanel } from './admin/settings-panel';

const ADMIN_SESSION_KEY = 'ctsda_admin_session';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const adminNav: Array<{ href: string; section: AdminSection; label: string; roles: string[], isSubmenu?: boolean }> = [
  { href: '/admin/reports', section: 'reports', label: 'Reports', roles: ['super_admin', 'support_officer', 'finance_officer', 'content_manager', 'auditor'] },
  { href: '/admin/accreditations', section: 'accreditations', label: 'Accreditations', roles: ['super_admin', 'support_officer'] },
  { href: '/admin/queue', section: 'queue', label: 'Review Queue', roles: ['super_admin', 'support_officer'], isSubmenu: true },
  { href: '/admin/institutions', section: 'institutions', label: 'Directory', roles: ['super_admin', 'support_officer', 'content_manager'] },
  { href: '/admin/billing', section: 'billing', label: 'Billing & Orders', roles: ['super_admin', 'finance_officer'] },
  { href: '/admin/users', section: 'users', label: 'Users', roles: ['super_admin'] },
  { href: '/admin/blog', section: 'blog', label: 'CMS / Blog', roles: ['super_admin', 'content_manager'] },
  { href: '/admin/training', section: 'training', label: 'Training', roles: ['super_admin', 'content_manager'] },
  { href: '/admin/settings', section: 'settings', label: 'Settings', roles: ['super_admin'] },
  { href: '/admin/audit', section: 'audit', label: 'Audit Logs', roles: ['super_admin', 'auditor'] },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'submitted':
    case 'resubmitted':
      return { background: '#fef3c7', color: '#b45309' }; // yellow
    case 'approved':
    case 'active':
      return { background: '#dcfce7', color: '#15803d' }; // green
    case 'rejected':
    case 'expired':
    case 'suspended':
      return { background: '#fee2e2', color: '#b91c1c' }; // red
    case 'under_review':
    case 'initial_screening':
    case 'final_review':
      return { background: '#e0e7ff', color: '#4338ca' }; // indigo
    default:
      return { background: '#f1f5f9', color: '#475569' }; // slate
  }
};

export type AdminSection = 'reports' | 'queue' | 'institutions' | 'billing' | 'users' | 'accreditations' | 'blog' | 'training' | 'settings' | 'audit';

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
    title: 'Reports & Dashboard',
    eyebrow: 'Executive overview',
    description: 'Monitor pending applications, review velocity, accreditation status, and platform performance.',
  },
  queue: {
    title: 'Review Queue',
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
  accreditations: {
    title: 'Accreditations',
    description: 'Monitor, issue, and manage institutional accreditations and verifiable digital certificates.',
    eyebrow: 'Certifications',
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
  const [, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [workingAction, setWorkingAction] = useState('');
  const [exporting, setExporting] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

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

  // Parse URL query params on load (e.g. ?status=submitted or ?appId=123)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlStatus = params.get('status');
      if (urlStatus && statuses.includes(urlStatus)) {
        setStatus(urlStatus);
      }
    }
  }, []);

  useEffect(() => {
    void loadProfile(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    void loadNotifications();
    if (section === 'reports') void loadReportSummary();
    if (section === 'queue') void loadApplications();
    if (section === 'institutions' && ['super_admin', 'support_officer', 'content_manager'].includes(profile.role)) void loadInstitutions();
    if (section === 'users' && profile.role === 'super_admin') void loadUsers();
    if (section === 'audit' && ['super_admin', 'auditor'].includes(profile.role)) void loadAuditLogs();
  }, [profile, section, status]);

  async function api(path: string, init?: RequestInit) {
    const storedSession = readStoredSession();
    let response: Response;
    const isPostOrPut = init?.method && ['POST', 'PUT', 'PATCH'].includes(init.method.toUpperCase());
    try {
      response = await fetch(`${API_BASE}${path}`, {
        cache: 'no-store',
        ...init,
        body: init?.body ?? (isPostOrPut ? JSON.stringify({}) : undefined),
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

  async function loadNotifications() {
    try {
      const response = await api('/admin/notifications');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Ignore notification fetch errors
    }
  }

  async function markNotificationsRead() {
    try {
      await api('/admin/notifications/read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
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
      const apps = await response.json();
      setApplications(Array.isArray(apps) ? apps : []);

      // Check if URL has appId specified
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const targetAppId = params.get('appId');
        if (targetAppId) {
          const found = apps.find((a: any) => a.id === targetAppId);
          if (found) {
            void loadApplication(targetAppId);
          }
        }
      }
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
      void loadNotifications();
      void loadReportSummary();
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

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

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
      
      {/* GLOBAL TOPBAR HEADER */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        flexShrink: 0, 
        zIndex: 100, 
        height: '70px', 
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* NOTIFICATION BELL (trigger only — dropdown is portaled) */}
          <button
            ref={bellRef}
            type="button"
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              if (unreadCount > 0) void markNotificationsRead();
            }}
            style={{
              position: 'relative',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
            }}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

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

      {/* DASHBOARD CONTAINER WITH SIDEBAR & CONTENT */}
      <main className="admin-shell" style={{ flex: 1, minHeight: 'calc(100vh - 70px)' }}>
        <aside className={`admin-sidebar ${isMobileNavOpen ? 'is-open' : ''}`} style={{ 
          position: 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          alignSelf: 'flex-start',
          zIndex: 90
        }}>
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
          
          <nav className={`admin-sidebar-nav ${isMobileNavOpen ? 'is-open' : ''}`}>
            {visibleNav.map((item) => {
              const iconPaths: Record<AdminSection, string> = {
                reports: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                queue: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                institutions: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h9m-9 0V9a2 2 0 012-2h2a2 2 0 012 2v12',
                billing: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z',
                blog: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
                training: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
                audit: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                accreditations: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              };
              return (
                <Link
                  className={item.section === section ? 'active' : undefined}
                  style={item.isSubmenu ? { paddingLeft: '3rem', fontSize: '0.925rem', marginTop: '-0.25rem', marginBottom: '0.25rem' } : {}}
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  {!item.isSubmenu && (
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[item.section]} />
                    </svg>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {isMobileNavOpen && <div className="admin-sidebar-overlay is-open" onClick={() => setIsMobileNavOpen(false)} aria-hidden="true" />}

        <section className="admin-main">
          {/* Page Content Header */}
          <header className="admin-topbar" style={{ textAlign: 'left' }}>
            <div className="admin-topbar-left" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
              <div>
                <p className="admin-kicker" style={{ margin: '0 0 0.5rem 0' }}>{currentSection.eyebrow}</p>
                <h1 style={{ textAlign: 'left', margin: '0 0 0.25rem 0' }}>{currentSection.title}</h1>
                <p style={{ textAlign: 'left', margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>{currentSection.description}</p>
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
                <h2>Pipeline analytics & Actions</h2>
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
            <QueuePanel 
              api={api} 
              applications={applications}
              onAction={action}
              workingAction={workingAction}
              selectedApp={selectedApplication}
              setSelectedApp={setSelectedApplication}
            />
          )}

          {section === 'institutions' && (
            <DirectoryPanel 
              api={api}
              institutions={institutions}
            />
          )}

          {section === 'billing' && (
            <BillingPanel api={api} />
          )}

          {section === 'users' && (
            <UsersPanel api={api} />
          )}

          {section === 'accreditations' && (
            <AccreditationsPanel api={api} />
          )}

          {section === 'blog' && (
            <BlogPanel api={api} />
          )}

          {section === 'training' && (
            <TrainingPanel api={api} />
          )}

          {section === 'settings' && (
             <SettingsPanel api={api} />
          )}

          {section === 'audit' && (
             <div className="admin-section"><p>Audit logs panel integration pending...</p></div>
          )}
        </section>
      </main>

      {/* NOTIFICATION DROPDOWN — portaled to document.body so it overlays everything */}
      {isNotifOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Click-away backdrop */}
          <div
            onClick={() => setIsNotifOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              background: 'transparent',
            }}
          />
          {/* Dropdown panel */}
          <div style={{
            position: 'fixed',
            top: (() => {
              if (bellRef.current) {
                const rect = bellRef.current.getBoundingClientRect();
                return rect.bottom + 8;
              }
              return 78;
            })(),
            right: (() => {
              if (bellRef.current) {
                const rect = bellRef.current.getBoundingClientRect();
                return window.innerWidth - rect.right;
              }
              return 24;
            })(),
            width: '360px',
            maxWidth: 'calc(100vw - 2rem)',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            zIndex: 99999,
            maxHeight: '480px',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              borderBottom: '1px solid #f1f5f9',
              flexShrink: 0,
            }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Notifications</strong>
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '6px',
                  transition: 'background 120ms',
                }}
              >
                ✕ Close
              </button>
            </div>
            {/* Items */}
            <div style={{
              overflowY: 'auto',
              padding: '0.5rem 0.75rem 0.75rem',
              flex: 1,
            }}>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '1rem 0', textAlign: 'center' }}>No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                      borderLeft: n.isRead ? '3px solid #e2e8f0' : '3px solid #0d9488',
                      marginBottom: '0.375rem',
                      cursor: n.metadata?.applicationId ? 'pointer' : 'default',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.isRead ? '#ffffff' : '#f0fdf4'; }}
                    onClick={() => {
                      if (n.metadata?.applicationId) {
                        setIsNotifOpen(false);
                        window.location.href = `/admin/queue?appId=${n.metadata.applicationId}`;
                      }
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.4 }}>{n.title}</strong>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>{n.body}</p>
                    <small style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export function ApplicationDetail({
  application,
  onAction,
  actionBusy,
  workingAction,
}: {
  application: any;
  onAction: (path: string, payload: any) => Promise<void>;
  actionBusy: boolean;
  workingAction: string;
}) {
  const [manualReference, setManualReference] = React.useState('');
  const [manualAmount, setManualAmount] = React.useState('');
  const [manualNotes, setManualNotes] = React.useState('');
  const manualPaymentPath = `/admin/applications/${application.id}/manual-payment`;

  return (
    <article className="admin-detail">
      <header>
        <h3>{application.institution.name}</h3>
        <span className="badge">{application.status}</span>
      </header>
      <div className="detail-grid">
        <div>
          <small>Country</small>
          <p>{application.institution.country}</p>
        </div>
        <div>
          <small>Submitted</small>
          <p>{new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="admin-actions" style={{ marginTop: '1rem' }}>
        {['submitted', 'initial_screening'].includes(application.status) && (
          <button
            className={workingAction.endsWith('/start-review') ? 'admin-button primary is-loading' : 'admin-button primary'}
            type="button"
            onClick={() => onAction(`/admin/applications/${application.id}/start-review`, { reason: 'Started review' })}
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
            {workingAction.endsWith('/approve') ? 'Approving...' : 'Approve Application'}
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
      </div>
    </article>
  );
}

function ReportPanel({ summary }: { summary: any | null }) {
  if (!summary) {
    return <p className="loading-inline">Loading analytics...</p>;
  }

  const pendingCount = summary.pipeline?.pendingApplications ?? (
    summary.pipeline?.applicationsByStatus
      ?.filter((s: any) => ['submitted', 'resubmitted', 'under_review'].includes(s.status))
      .reduce((acc: number, curr: any) => acc + curr.count, 0) || 0
  );

  const metrics = [
    {
      label: 'Pending Applications',
      value: pendingCount,
      hint: 'Awaiting admin review (Click to review)',
      href: '/admin/queue?status=submitted',
      highlight: true,
    },
    {
      label: 'Total Applications',
      value: summary.pipeline.totalApplications,
      hint: 'All time submissions',
      href: '/admin/queue',
    },
    {
      label: 'Approved Applications',
      value: summary.pipeline.approvedApplications ?? (summary.pipeline.applicationsByStatus?.find((s: any) => s.status === 'approved')?.count || 0),
      hint: 'Accreditation granted',
      href: '/admin/queue?status=approved',
    },
    {
      label: 'Active Accreditations',
      value: summary.accreditations.active,
      hint: 'Currently valid directory items',
      href: '/admin/institutions',
    },
    {
      label: 'New Submissions (30d)',
      value: summary.pipeline.newApplications30d,
      hint: 'Created in last 30 days',
      href: '/admin/queue',
    },
    {
      label: 'Avg Review Time',
      value: `${summary.pipeline.averageReviewDays} days`,
      hint: 'Submitted to decision',
    },
    {
      label: 'Approval Rate',
      value: `${Math.round(summary.pipeline.approvalRate * 100)}%`,
      hint: 'Approved vs rejected',
    },
    {
      label: 'Completed Revenue',
      value: summary.revenue.completedAmount,
      hint: 'Paid invoices',
      href: '/admin/billing',
    },
  ];

  return (
    <div className="report-stack">
      <div className="metric-grid">
        {metrics.map((m) => {
          const cardContent = (
            <article
              className="metric-card"
              key={m.label}
              style={{
                cursor: m.href ? 'pointer' : 'default',
                ...(m.highlight && {
                  border: '2px solid #f59e0b',
                  backgroundColor: '#fffbeb',
                }),
              }}
            >
              <span style={{ fontWeight: m.highlight ? 'bold' : 'normal', color: m.highlight ? '#b45309' : undefined }}>{m.label}</span>
              <strong style={{ color: m.highlight ? '#d97706' : undefined }}>{m.value}</strong>
              <small>{m.hint}</small>
            </article>
          );

          if (m.href) {
            return (
              <Link key={m.label} href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                {cardContent}
              </Link>
            );
          }
          return cardContent;
        })}
      </div>

      <div className="report-grid">
        <ReportList
          title="Applications by status"
          items={summary.pipeline.applicationsByStatus.map((item: any) => ({
            label: item.status.replace(/_/g, ' '),
            value: item.count,
            href: `/admin/queue?status=${item.status}`,
          }))}
        />
        <ReportList
          title="Countries represented"
          items={summary.institutions.countriesRepresented.map((item: any) => ({
            label: item.country,
            value: item.count,
            href: '/admin/institutions',
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
            href: '/admin/queue',
          }))}
        />
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: Array<{ label: string; value: number | string; href?: string }> }) {
  return (
    <article className="report-list">
      <h3>{title}</h3>
      {items.length === 0 && <p>No data yet.</p>}
      {items.map((item) => {
        const rowContent = (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ textTransform: 'capitalize' }}>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              {rowContent}
            </Link>
          );
        }
        return rowContent;
      })}
    </article>
  );
}


