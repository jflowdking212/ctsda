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
        <div className="content-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div className="content-list-card" key={app.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{app.institution?.name || 'Application'}</h3>
                <p className="meta-line" style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, textTransform: 'capitalize' }}>
                  Status: {app.status.replace(/_/g, ' ')}
                </p>
              </div>
              
              {app.status === 'approved' && app.accreditation?.certificateNumber && (
                <div>
                  <a 
                    href={`/verify-certificate?certNumber=${app.accreditation.certificateNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary"
                    style={{ 
                      display: 'inline-block', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '0.375rem', 
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    View / Download Certificate
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
