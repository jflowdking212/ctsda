'use client';

import { useState } from 'react';

export default function NewApplicationPage() {
  const [form, setForm] = useState({
    institutionId: '',
    preRegistrationToken: '',
    trainingAreaIds: '',
    certificatesOffered: '',
    deliveryMethods: '',
    staffingCount: '',
    operationalInfo: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          institutionId: form.institutionId,
          preRegistrationToken: form.preRegistrationToken || undefined,
          trainingAreaIds: form.trainingAreaIds.split(',').map((item) => item.trim()).filter(Boolean),
          certificatesOffered: form.certificatesOffered.split(',').map((item) => item.trim()).filter(Boolean),
          deliveryMethods: form.deliveryMethods.split(',').map((item) => item.trim()).filter(Boolean),
          staffingCount: form.staffingCount ? Number(form.staffingCount) : undefined,
          operationalInfo: form.operationalInfo || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Could not create application');
        return;
      }

      setMessage(`Draft application created: ${data.id}`);
    } catch {
      setError('Application service is not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <p className="eyebrow">New application</p>
        <h1>Start Draft Application</h1>
        <p>Provide the initial operational details required to open an accreditation review.</p>
      </header>

      <form className="content-panel content-form two-column" onSubmit={handleSubmit}>
        <label>
          Institution ID
          <input value={form.institutionId} onChange={(event) => setForm({ ...form, institutionId: event.target.value })} required disabled={loading} />
        </label>
        <label>
          Pre-registration token
          <input value={form.preRegistrationToken} onChange={(event) => setForm({ ...form, preRegistrationToken: event.target.value })} disabled={loading} />
        </label>
        <label className="full-width">
          Training area IDs
          <input value={form.trainingAreaIds} onChange={(event) => setForm({ ...form, trainingAreaIds: event.target.value })} placeholder="Comma separated" required disabled={loading} />
        </label>
        <label>
          Certificates offered
          <input value={form.certificatesOffered} onChange={(event) => setForm({ ...form, certificatesOffered: event.target.value })} placeholder="Comma separated" required disabled={loading} />
        </label>
        <label>
          Delivery methods
          <input value={form.deliveryMethods} onChange={(event) => setForm({ ...form, deliveryMethods: event.target.value })} placeholder="Comma separated" required disabled={loading} />
        </label>
        <label>
          Staffing count
          <input value={form.staffingCount} onChange={(event) => setForm({ ...form, staffingCount: event.target.value })} type="number" disabled={loading} />
        </label>
        <label className="full-width">
          Operational information
          <textarea value={form.operationalInfo} onChange={(event) => setForm({ ...form, operationalInfo: event.target.value })} rows={5} disabled={loading} />
        </label>
        {error && <p className="status-message error full-width">{error}</p>}
        {message && <p className="status-message success full-width">{message}</p>}
        <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
          {loading ? 'Saving draft...' : 'Save draft'}
        </button>
      </form>
    </main>
  );
}
