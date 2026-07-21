'use client';

import { useEffect, useState } from 'react';

export default function PortalDashboard() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const sessionId = getCookie('sessionId');
      if (!sessionId) {
        window.location.href = '/portal/login';
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/applications/me`, {
        headers: { 'x-session-id': sessionId },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    }
    load();
  }, []);

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <p className="eyebrow">Applicant portal</p>
        <h1>Applicant Portal</h1>
        <p>Track your CTSDA applications and continue work on pending submissions.</p>
      </header>

      <section className="content-panel">
        <h2>Applications</h2>
        {applications.length === 0 && <p>No applications yet.</p>}
        <div className="content-list">
          {applications.map((app) => (
            <div className="content-list-card" key={app.id}>
              <h3>{app.institution?.name || 'Application'}</h3>
              <p className="meta-line">{app.status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
