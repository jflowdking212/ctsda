import React, { useState, useEffect } from 'react';

export function SettingsPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await api('/settings');
      setSettings(await response.json());
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error: any) {
      alert(`Failed to save settings: ${error.message}`);
    }
    setSaving(false);
  }

  return (
    <div className="admin-panel" style={{ padding: '2rem', maxWidth: '800px', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Global Site Settings</h2>
        <p style={{ color: '#64748b' }}>Configure SMTP, Logo, Favicon, Tagline, and Meta Data.</p>
      </header>
      
      {loading ? <p style={{ color: '#64748b' }}>Loading settings...</p> : (
        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Site Title</label>
            <input 
              type="text" 
              value={settings.siteTitle || ''} 
              onChange={e => setSettings({...settings, siteTitle: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
              placeholder="e.g. CTSDA"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Tagline</label>
            <input 
              type="text" 
              value={settings.siteTagline || ''} 
              onChange={e => setSettings({...settings, siteTagline: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
              placeholder="e.g. Empowering Safe Driving"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Meta Description</label>
            <textarea 
              value={settings.metaDescription || ''} 
              onChange={e => setSettings({...settings, metaDescription: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', minHeight: '100px', resize: 'vertical', outline: 'none' }}
              placeholder="Brief description for SEO..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Logo URL</label>
              <input 
                type="url" 
                value={settings.logoUrl || ''} 
                onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                placeholder="/images/logo.png"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Favicon URL</label>
              <input 
                type="url" 
                value={settings.faviconUrl || ''} 
                onChange={e => setSettings({...settings, faviconUrl: e.target.value})} 
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                placeholder="/favicon.ico"
              />
            </div>
          </div>

          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', marginTop: '1rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>SMTP Configuration</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Host</label>
                <input 
                  type="text" 
                  value={settings.smtpHost || ''} 
                  onChange={e => setSettings({...settings, smtpHost: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>SMTP Port</label>
                <input 
                  type="text" 
                  value={settings.smtpPort || ''} 
                  onChange={e => setSettings({...settings, smtpPort: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                />
              </div>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', marginTop: '1rem' }}>
            <legend style={{ padding: '0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Accreditation Pricing & Workflow</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Workflow Model</label>
                <select 
                  value={settings.accreditationWorkflow || 'review_first'} 
                  onChange={e => setSettings({...settings, accreditationWorkflow: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="review_first">Review First (Apply free, Pay on approval)</option>
                  <option value="pay_upfront">Pay Upfront (Pay full fee before submission)</option>
                  <option value="hybrid">Hybrid (Pay app fee upfront, Pay accreditation fee on approval)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: (settings.accreditationWorkflow || 'review_first') === 'review_first' ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                {(settings.accreditationWorkflow || 'review_first') !== 'review_first' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Application Fee (USD)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={settings.applicationFee || 0} 
                      onChange={e => setSettings({...settings, applicationFee: parseFloat(e.target.value) || 0})} 
                      style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                    />
                    <small style={{ color: '#64748b' }}>Used in Pay Upfront & Hybrid modes.</small>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Accreditation Fee (USD)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={settings.accreditationFee || 500} 
                    onChange={e => setSettings({...settings, accreditationFee: parseFloat(e.target.value) || 0})} 
                    style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', width: '100%', outline: 'none' }}
                  />
                  <small style={{ color: '#64748b' }}>Used in Review First & Hybrid modes.</small>
                </div>
              </div>
            </div>
          </fieldset>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={saving} 
              style={{ backgroundColor: '#0f766e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
