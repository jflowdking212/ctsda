'use client';

import React, { useState, useEffect } from 'react';

export type PageTab = 'home' | 'about' | 'services' | 'training' | 'blog' | 'contact';

export function PagesPanel({ 
  api, 
  initialPage = 'home' 
}: { 
  api: (path: string, init?: RequestInit) => Promise<Response>;
  initialPage?: PageTab;
}) {
  const [activeTab, setActiveTab] = useState<PageTab>(initialPage);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page') as PageTab;
      if (pageParam && ['home', 'about', 'services', 'training', 'blog', 'contact'].includes(pageParam)) {
        setActiveTab(pageParam);
      }
    }
  }, []);

  function notify(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await api('/settings');
      if (response.ok) {
        setSettings(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api('/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        notify(`Failed to save page contents: ${err.message || 'Server error'}`, 'error');
      } else {
        notify('Page contents saved successfully!', 'success');
      }
    } catch (error: any) {
      notify(`Failed to save page contents: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: PageTab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home Page', icon: '🏠' },
    { key: 'about', label: 'About Page', icon: 'ℹ️' },
    { key: 'services', label: 'Services Page', icon: '🛠️' },
    { key: 'training', label: 'Training Page', icon: '🎓' },
    { key: 'blog', label: 'Blog Page', icon: '📰' },
    { key: 'contact', label: 'Contact Page', icon: '📞' },
  ];

  return (
    <div className="admin-panel" style={{ padding: '2rem', maxWidth: '1000px', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderRadius: '0.5rem',
          backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontWeight: 500,
          fontSize: '0.9rem',
        }}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} type="button" style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button>
        </div>
      )}

      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Public Pages Management</h2>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>Customize titles, headlines, value statements, and copy text across all public pages.</p>
      </header>

      {/* SUBMENU TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.5rem 0.5rem 0 0',
                border: 'none',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                marginBottom: '-2px',
                borderBottom: isActive ? '2px solid #2563eb' : 'none',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading page content settings...</p>
      ) : (
        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* TAB 1: HOME PAGE */}
          {activeTab === 'home' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>🏠 Home / Landing Page Content (`/`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Hero Ribbon Badge</label>
                    <input 
                      type="text" 
                      value={settings.homeHeroBadge ?? 'Official International Accreditation Body'} 
                      onChange={e => setSettings({...settings, homeHeroBadge: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Main Hero Headline</label>
                    <input 
                      type="text" 
                      value={settings.homeHeroTitle ?? 'Council For Training Skills & Development America (CTSDA)'} 
                      onChange={e => setSettings({...settings, homeHeroTitle: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Hero Subtitle / Value Statement</label>
                  <textarea 
                    value={settings.homeHeroSubtitle ?? 'Empowering global education and workforce training providers with rigorous quality standards, international recognition, and 100% verifiable digital credentials.'} 
                    onChange={e => setSettings({...settings, homeHeroSubtitle: e.target.value})} 
                    rows={3}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Framework Card Title</label>
                    <input 
                      type="text" 
                      value={settings.homeFrameworkTitle ?? 'Global Quality Benchmark'} 
                      onChange={e => setSettings({...settings, homeFrameworkTitle: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Framework Subtitle</label>
                    <input 
                      type="text" 
                      value={settings.homeFrameworkSubtitle ?? 'CTSDA sets international standards for vocational, technical, and executive training providers worldwide.'} 
                      onChange={e => setSettings({...settings, homeFrameworkSubtitle: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {/* TAB 2: ABOUT PAGE */}
          {activeTab === 'about' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>ℹ️ About Page Content (`/about`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>About Hero Subtitle</label>
                  <input 
                    type="text" 
                    value={settings.aboutHeroSubtitle ?? 'Empowering educational excellence through comprehensive accreditation services since 2010.'} 
                    onChange={e => setSettings({...settings, aboutHeroSubtitle: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Our Mission Statement</label>
                  <textarea 
                    value={settings.aboutMissionText ?? 'The Council For Training Skills and Development America (CTSDA) is dedicated to advancing excellence in education and training through comprehensive accreditation services. We strive to empower institutions, trainers and educational service providers to deliver high-quality programs that meet the evolving needs of learners and industries.'} 
                    onChange={e => setSettings({...settings, aboutMissionText: e.target.value})} 
                    rows={4}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Our Vision Statement</label>
                  <textarea 
                    value={settings.aboutVisionText ?? 'We envision a world where every learner has access to quality education and training, fostering personal growth, professional development, and societal progress. CTSDA aims to be the leading accreditation body, setting the gold standard for educational excellence and innovation.'} 
                    onChange={e => setSettings({...settings, aboutVisionText: e.target.value})} 
                    rows={4}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* TAB 3: SERVICES PAGE */}
          {activeTab === 'services' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>🛠️ Services Page Content (`/services`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Services Hero Subtitle</label>
                  <input 
                    type="text" 
                    value={settings.servicesHeroSubtitle ?? 'Comprehensive accreditation solutions designed to elevate educational standards and ensure excellence in learning.'} 
                    onChange={e => setSettings({...settings, servicesHeroSubtitle: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Services Overview Intro</label>
                  <textarea 
                    value={settings.servicesOverviewText ?? 'At CTSDA, we offer specialized accreditation and evaluation services tailored to educational institutions, vocational training centers, and corporate learning providers.'} 
                    onChange={e => setSettings({...settings, servicesOverviewText: e.target.value})} 
                    rows={4}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* TAB 4: TRAINING PAGE */}
          {activeTab === 'training' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>🎓 Training Page Content (`/training`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Training Hero Subtitle</label>
                  <textarea 
                    value={settings.trainingHeroSubtitle ?? 'Browse free training modules, videos, and resources from the CTSDA to improve road safety and driver training standards.'} 
                    onChange={e => setSettings({...settings, trainingHeroSubtitle: e.target.value})} 
                    rows={3}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>Training Courses CMS</strong>
                    <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Manage individual training modules, video URLs, categories, and prices.</span>
                  </div>
                  <a href="/admin/training" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Manage Training Courses →</a>
                </div>
              </div>
            </fieldset>
          )}

          {/* TAB 5: BLOG PAGE */}
          {activeTab === 'blog' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>📰 Blog Page Content (`/blog`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Blog Hero Subtitle</label>
                  <textarea 
                    value={settings.blogHeroSubtitle ?? 'Latest insights, accreditation standards, educational news, and industry updates from CTSDA.'} 
                    onChange={e => setSettings({...settings, blogHeroSubtitle: e.target.value})} 
                    rows={3}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>Blog Articles CMS</strong>
                    <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Create, edit, and publish articles, news, and press releases.</span>
                  </div>
                  <a href="/admin/blog" style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Manage Blog Posts →</a>
                </div>
              </div>
            </fieldset>
          )}

          {/* TAB 6: CONTACT PAGE */}
          {activeTab === 'contact' && (
            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <legend style={{ padding: '0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>📞 Contact Page Content (`/contact`)</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Contact Hero Subtitle</label>
                  <input 
                    type="text" 
                    value={settings.contactHeroSubtitle ?? 'We are here to assist institutions, educators, applicants, and the public with accreditation, verification, and partnership inquiries.'} 
                    onChange={e => setSettings({...settings, contactHeroSubtitle: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Contact Form Intro Text</label>
                  <input 
                    type="text" 
                    value={settings.contactIntroText ?? 'Reach out directly to our dedicated support team for assistance.'} 
                    onChange={e => setSettings({...settings, contactIntroText: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Support Email</label>
                    <input 
                      type="email" 
                      value={settings.contactEmail ?? settings.supportEmail ?? 'support@ctsdamerica.com'} 
                      onChange={e => setSettings({...settings, contactEmail: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Legal Inquiry Email</label>
                    <input 
                      type="email" 
                      value={settings.contactLegalEmail ?? 'management@ctsdamerica.com'} 
                      onChange={e => setSettings({...settings, contactLegalEmail: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Contact Phone</label>
                    <input 
                      type="text" 
                      value={settings.contactPhone ?? '+1 (302) 555-0199'} 
                      onChange={e => setSettings({...settings, contactPhone: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Operating Hours</label>
                    <input 
                      type="text" 
                      value={settings.contactHours ?? 'Monday - Friday: 9:00 AM - 5:00 PM EST'} 
                      onChange={e => setSettings({...settings, contactHours: e.target.value})} 
                      style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Headquarters Address</label>
                  <input 
                    type="text" 
                    value={settings.contactAddress ?? 'The Green, STE A, Dover, Kent, Delaware, United States'} 
                    onChange={e => setSettings({...settings, contactAddress: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
              </div>
            </fieldset>
          )}

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={saving} 
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
            >
              {saving ? 'Saving Page Content...' : 'Save Page Content'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
