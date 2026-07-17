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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');

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
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Could not create application');
      return;
    }

    setMessage(`Draft application created: ${data.id}`);
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Start Draft Application</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        <input value={form.institutionId} onChange={(event) => setForm({ ...form, institutionId: event.target.value })} placeholder="Institution ID" required style={{ padding: '0.5rem' }} />
        <input value={form.preRegistrationToken} onChange={(event) => setForm({ ...form, preRegistrationToken: event.target.value })} placeholder="Pre-registration token" style={{ padding: '0.5rem' }} />
        <input value={form.trainingAreaIds} onChange={(event) => setForm({ ...form, trainingAreaIds: event.target.value })} placeholder="Training area IDs, comma separated" required style={{ padding: '0.5rem' }} />
        <input value={form.certificatesOffered} onChange={(event) => setForm({ ...form, certificatesOffered: event.target.value })} placeholder="Certificates offered, comma separated" required style={{ padding: '0.5rem' }} />
        <input value={form.deliveryMethods} onChange={(event) => setForm({ ...form, deliveryMethods: event.target.value })} placeholder="Delivery methods, comma separated" required style={{ padding: '0.5rem' }} />
        <input value={form.staffingCount} onChange={(event) => setForm({ ...form, staffingCount: event.target.value })} placeholder="Staffing count" type="number" style={{ padding: '0.5rem' }} />
        <textarea value={form.operationalInfo} onChange={(event) => setForm({ ...form, operationalInfo: event.target.value })} placeholder="Operational information" rows={5} style={{ padding: '0.5rem' }} />
        {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
        {message && <p style={{ color: '#276749' }}>{message}</p>}
        <button type="submit" style={{ padding: '0.5rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Save draft</button>
      </form>
    </div>
  );
}
