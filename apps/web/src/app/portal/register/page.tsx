'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'applicant' }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      setMessage(`Account created. Development verification token: ${data.verificationToken}`);
    } catch {
      setError('Registration service is not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-page narrow">
      <header className="content-header">
        <p className="eyebrow">Registration</p>
        <h1>Create Applicant Account</h1>
        <p>Set up your CTSDA applicant profile before starting an accreditation application.</p>
      </header>

      <form className="content-panel content-form two-column" onSubmit={handleSubmit}>
        {(['firstName', 'lastName', 'email', 'phone'] as const).map((field) => (
          <label key={field}>
            {field.replace(/([A-Z])/g, ' $1')}
            <input
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              required={field !== 'phone'}
              type={field === 'email' ? 'email' : 'text'}
              disabled={loading}
            />
          </label>
        ))}
        <label className="full-width">
          Password
          <input
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            type="password"
            disabled={loading}
          />
        </label>
        {error && <p className="status-message error full-width">{error}</p>}
        {message && <p className="status-message success full-width">{message}</p>}
        <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
