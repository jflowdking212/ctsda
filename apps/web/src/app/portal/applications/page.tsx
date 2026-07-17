'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: string;
  status: string;
  institution?: { name: string; country: string };
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/applications/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setApps(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>My Applications</h1>
      <p><a href="/portal/applications/new" style={{ color: '#1a365d' }}>Start a draft application</a></p>
      {loading && <p>Loading...</p>}
      {!loading && apps.length === 0 && <p>No applications yet.</p>}
      {apps.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {apps.map((app) => (
            <div key={app.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>{app.institution?.name || 'Application'}</h3>
              <p style={{ margin: 0, color: '#4a5568' }}>{app.institution?.country} · Status: {app.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
