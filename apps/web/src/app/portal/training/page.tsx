'use client';

import { useEffect, useState } from 'react';

const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export default function MyTrainingPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function load() {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      if (!storedSession) {
        window.location.href = '/portal/login?callbackUrl=/portal/training';
        return;
      }
      
      try {
        const res = await fetch(`${apiUrl}/api/portal/training/my-enrollments`, {
          credentials: 'include',
          headers: {
            'X-Session-Id': storedSession,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setEnrollments(Array.isArray(data) ? data : []);
        } else if (res.status === 401 || res.status === 403) {
          window.location.href = '/portal/login?callbackUrl=/portal/training';
        }
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiUrl]);

  const activeEnrollments = enrollments.filter((e: any) => e.status === 'paid' || e.status === 'free');

  return (
    <main className="content-page">
      <header className="content-header">
        <p className="eyebrow">Training</p>
        <h1>My Training</h1>
        <p>Access and manage your enrolled training modules and video resources.</p>
        <a className="button primary" href="/training">Browse Training Catalog</a>
      </header>

      {loading && <p className="loading-inline">Loading your training modules...</p>}
      
      {!loading && activeEnrollments.length === 0 && (
        <section className="content-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h2 style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 600, marginBottom: '0.5rem' }}>No active enrollments</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You haven't enrolled in any training modules yet.</p>
        </section>
      )}

      {!loading && activeEnrollments.length > 0 && (
        <section className="content-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {activeEnrollments.map((enrollment: any) => {
            const training = enrollment.training;
            if (!training) return null;
            return (
              <div key={enrollment.id} style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '6px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {training.category || 'General'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                      Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>
                    {training.title}
                  </h3>

                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
                    {training.description?.slice(0, 100) || 'Training module content.'}
                    {training.description?.length > 100 && '...'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                    {training.videoUrl ? (
                      <a href={training.videoUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', padding: '0.625rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                        Watch Video
                      </a>
                    ) : (
                      <span style={{ flex: 1, textAlign: 'center', padding: '0.625rem', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        No Video
                      </span>
                    )}
                    {training.resourceUrl && (
                      <a href={training.resourceUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', padding: '0.625rem', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                        Resources
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
