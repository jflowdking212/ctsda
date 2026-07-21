'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: string;
  status: string;
  institution?: { name: string; country: string };
};

const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    async function load() {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const res = await fetch(`${apiUrl}/applications/me`, {
        credentials: 'include',
        headers: {
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setApps(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    load();
  }, [apiUrl]);

  async function startCheckout(applicationId: string) {
    setMessage('');
    setPayingId(applicationId);
    try {
      const response = await fetch(`${apiUrl}/payments/create-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(window.localStorage.getItem(PORTAL_SESSION_KEY) ? { 'X-Session-Id': window.localStorage.getItem(PORTAL_SESSION_KEY) || '' } : {}),
        },
        body: JSON.stringify({ applicationId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to start checkout');
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setMessage(result.message || 'Payment is already complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start checkout');
    } finally {
      setPayingId(null);
    }
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <p className="eyebrow">Applications</p>
        <h1>My Applications</h1>
        <p>Review your CTSDA submissions, payment status, and next application steps.</p>
        <a className="button primary" href="/portal/applications/new">Start a draft application</a>
      </header>

      {message && <p className="status-message">{message}</p>}
      {loading && <p className="loading-inline">Loading applications...</p>}
      {!loading && apps.length === 0 && (
        <section className="content-panel">
          <p>No applications yet.</p>
        </section>
      )}
      {apps.length > 0 && (
        <section className="content-list">
          {apps.map((app) => (
            <div className="content-list-card" key={app.id}>
              <h3>{app.institution?.name || 'Application'}</h3>
              <p className="meta-line">
                {app.institution?.country} - Status: {app.status}
              </p>
              {['submitted', 'payment_pending'].includes(app.status) && (
                <button
                  className={payingId === app.id ? 'button primary is-loading' : 'button primary'}
                  type="button"
                  onClick={() => startCheckout(app.id)}
                  disabled={payingId === app.id}
                >
                  {payingId === app.id ? 'Starting checkout...' : 'Pay application fee'}
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
