'use client';

import React, { useState, useEffect } from 'react';

export function SettingsPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFaviconFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, faviconUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function testSmtp(e: React.MouseEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings };
      if (!payload.smtpPassword) {
        delete payload.smtpPassword;
      }
      
      const testRes = await api('/settings/test-smtp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (!testRes.ok) {
        const err = await testRes.json().catch(() => ({}));
        notify(`SMTP Test Failed: ${err.message || 'Unknown error'}`, 'error');
      } else {
        notify('SMTP Test Successful!', 'success');
      }
    } catch (error: any) {
      notify(`SMTP Test Failed: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const payload = { ...settings };
    if (!payload.smtpPassword) {
      delete payload.smtpPassword;
    }

    try {
      await api('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      notify('Settings saved successfully!', 'success');
    } catch (error: any) {
      notify(`Failed to save settings: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-panel" style={{ padding: '2rem', maxWidth: '900px', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'relative' }}>
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
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
          fontWeight: 500,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.2s ease-in-out',
        }}>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Global Platform Settings</h2>
        <p style={{ color: '#64748b' }}>Manage site branding, SEO metadata, contact details, SMTP email gateway, and accreditation fees.</p>
      </header>
      
      {loading ? <p style={{ color: '#64748b' }}>Loading settings...</p> : (
        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1: BRANDING & LOGOS */}
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>Brand Identity & Assets</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* LOGO UPLOAD */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Official Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', border: '1px border #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No logo</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoFileChange} style={{ fontSize: '0.8rem' }} />
                    <input 
                      type="text" 
                      value={settings.logoUrl || ''} 
                      onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                      style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', marginTop: '0.4rem', fontSize: '0.8rem' }}
                      placeholder="Or enter image URL"
                    />
                  </div>
                </div>
              </div>

              {/* FAVICON UPLOAD */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>Favicon Icon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {settings.faviconUrl ? (
                      <img src={settings.faviconUrl} alt="Favicon preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Icon</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleFaviconFileChange} style={{ fontSize: '0.8rem' }} />
                    <input 
                      type="text" 
                      value={settings.faviconUrl || ''} 
                      onChange={e => setSettings({...settings, faviconUrl: e.target.value})} 
                      style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', marginTop: '0.4rem', fontSize: '0.8rem' }}
                      placeholder="Or enter favicon URL"
                    />
                  </div>
                </div>
              </div>

            </div>
          </fieldset>

          {/* SECTION 2: GENERAL & SEO */}
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>General & SEO Metadata</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Site Title</label>
                  <input 
                    type="text" 
                    value={settings.siteTitle || ''} 
                    onChange={e => setSettings({...settings, siteTitle: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    placeholder="e.g. Council for Training Skills and Development America"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Tagline</label>
                  <input 
                    type="text" 
                    value={settings.siteTagline || ''} 
                    onChange={e => setSettings({...settings, siteTagline: e.target.value})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                    placeholder="e.g. Setting Global Standards in Education"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Meta Description (SEO)</label>
                <textarea 
                  value={settings.metaDescription || ''} 
                  onChange={e => setSettings({...settings, metaDescription: e.target.value})} 
                  rows={2}
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="Summary for search engines..."
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SEO Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  value={settings.metaKeywords || ''} 
                  onChange={e => setSettings({...settings, metaKeywords: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="e.g. accreditation, certificate verification, CTSDA, educational quality"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Full Site Description / About Summary</label>
                <textarea 
                  value={settings.siteDescription || ''} 
                  onChange={e => setSettings({...settings, siteDescription: e.target.value})} 
                  rows={3}
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="Comprehensive description of CTSDA and its accreditation scope..."
                />
              </div>

            </div>
          </fieldset>

          {/* SECTION 3: CONTACT & PLATFORM OPTIONS */}
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>Platform Contact Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Support Email</label>
                <input 
                  type="email" 
                  value={settings.supportEmail || ''} 
                  onChange={e => setSettings({...settings, supportEmail: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="management@ctsdamerica.com"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Contact Phone</label>
                <input 
                  type="text" 
                  value={settings.contactPhone || ''} 
                  onChange={e => setSettings({...settings, contactPhone: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="+1 (555) 019-2831"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Headquarters Address</label>
                <input 
                  type="text" 
                  value={settings.contactAddress || ''} 
                  onChange={e => setSettings({...settings, contactAddress: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="Washington, D.C., USA"
                />
              </div>
            </div>
          </fieldset>

          {/* SECTION 4: SMTP GATEWAY */}
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>SMTP Email Configuration</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Host</label>
                <input 
                  type="text" 
                  value={settings.smtpHost || ''} 
                  onChange={e => setSettings({...settings, smtpHost: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="e.g. mail.domain.com"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Port</label>
                <input 
                  type="text" 
                  value={settings.smtpPort || ''} 
                  onChange={e => setSettings({...settings, smtpPort: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  placeholder="587 or 465"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Encryption Security</label>
                <select 
                  value={settings.smtpSecure ?? 'auto'} 
                  onChange={e => setSettings({...settings, smtpSecure: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', backgroundColor: 'white' }}
                >
                  <option value="auto">Auto-detect (Port 465 = SSL, 587 = TLS)</option>
                  <option value="true">SSL / TLS (Port 465)</option>
                  <option value="false">STARTTLS / Plain (Port 587 / 25)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Username</label>
                <input 
                  type="text" 
                  value={settings.smtpUser || ''} 
                  onChange={e => setSettings({...settings, smtpUser: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Password</label>
                <input 
                  type="password" 
                  value={settings.smtpPassword || ''} 
                  onChange={e => setSettings({...settings, smtpPassword: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                type="button" 
                onClick={testSmtp}
                disabled={saving}
                style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.6rem 1.25rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              >
                Test SMTP Connection
              </button>
            </div>
          </fieldset>

          {/* SECTION 5: ACCREDITATION WORKFLOW & FEES */}
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Accreditation Workflow & Fees</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Workflow Model</label>
                <select 
                  value={settings.accreditationWorkflow || 'review_first'} 
                  onChange={e => setSettings({...settings, accreditationWorkflow: e.target.value})} 
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', backgroundColor: 'white' }}
                >
                  <option value="review_first">Review First (Apply free, Pay on approval)</option>
                  <option value="pay_upfront">Pay Upfront (Pay full fee before submission)</option>
                  <option value="hybrid">Hybrid (Pay app fee upfront, Pay accreditation fee on approval)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Accreditation Fee (USD)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={settings.accreditationFee || 500} 
                    onChange={e => setSettings({...settings, accreditationFee: parseFloat(e.target.value) || 0})} 
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={saving} 
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
            >
              {saving ? 'Saving Settings...' : 'Save Global Settings'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
