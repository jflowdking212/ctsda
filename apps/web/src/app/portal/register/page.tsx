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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'applicant' }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Registration failed');
      return;
    }

    setMessage(`Account created. Development verification token: ${data.verificationToken}`);
  }

  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Create Applicant Account</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        {(['firstName', 'lastName', 'email', 'phone'] as const).map((field) => (
          <label key={field}>
            {field}
            <input
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              required={field !== 'phone'}
              type={field === 'email' ? 'email' : 'text'}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        ))}
        <label>
          password
          <input
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            type="password"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
        {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
        {message && <p style={{ color: '#276749' }}>{message}</p>}
        <button type="submit" style={{ padding: '0.5rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Create account</button>
      </form>
    </div>
  );
}
