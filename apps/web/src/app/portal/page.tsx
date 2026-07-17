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
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Applicant Portal</h1>
      <p>Welcome to your CTSDA portal.</p>
      <div style={{ marginTop: '1rem' }}>
        <h2>Applications</h2>
        {applications.length === 0 && <p>No applications yet.</p>}
        {applications.map((app) => (
          <div key={app.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 6, marginTop: '0.5rem' }}>
            <strong>{app.institution?.name || 'Application'}</strong>
            <div style={{ color: '#4a5568' }}>{app.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}