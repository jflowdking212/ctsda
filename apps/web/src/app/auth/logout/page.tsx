'use client';

import { useEffect } from 'react';

const _RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE = (typeof window !== 'undefined' && _RAW_API_BASE === 'http://localhost:4000') ? '/api' : _RAW_API_BASE;
const ADMIN_SESSION_KEY = 'ctsda_admin_session';
const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || window.localStorage.getItem(ADMIN_SESSION_KEY) || '';
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({}),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
          },
        });
      } finally {
        window.localStorage.removeItem(PORTAL_SESSION_KEY);
        window.localStorage.removeItem(ADMIN_SESSION_KEY);
        window.location.replace('/portal/login');
      }
    }

    void logout();
  }, []);

  return (
    <main className="content-page narrow">
      <section className="content-panel">
        <p className="loading-inline">Logging out...</p>
      </section>
    </main>
  );
}
