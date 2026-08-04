'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [verificationToken, setVerificationToken] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

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
        if (data.error?.details?.length > 0) {
          setError(data.error.details.map((d: any) => d.message).join('. '));
        } else {
          setError(data.error?.message || data.message || 'Registration failed');
        }
        return;
      }

      setMessage('Account created! A verification token has been sent to your email. Check your inbox and spam/junk folders, then enter the code below.');
      setVerificationToken(data.verificationToken || '');
      setRegistered(true);
    } catch {
      setError('Registration service is not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setVerifyError('');
    setVerifySuccess('');
    setVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyCode.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setVerifyError(data.error?.message || 'Invalid or expired token. Please check your email and try again.');
        return;
      }

      setVerifySuccess('Email verified successfully! Redirecting you to login...');
      setTimeout(() => {
        router.push('/portal/login');
      }, 2000);
    } catch {
      setVerifyError('Verification service is not reachable. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="content-page narrow">
      <header className="content-header">
        <p className="eyebrow">Registration</p>
        <h1>Create Applicant Account</h1>
        <p>Set up your CTSDA applicant profile before starting an accreditation application.</p>
      </header>

      {!registered ? (
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
          <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      ) : (
        <div className="content-panel content-form">
          {message && <p className="status-message success full-width">{message}</p>}

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label className="full-width">
              Verification Code
              <input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Paste the token from your email here"
                required
                type="text"
                disabled={verifying}
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', margin: 0 }}>
              Didn&apos;t receive the email? Check your <strong>spam or junk</strong> folder. It may take a few minutes to arrive.
            </p>
            {verifyError && <p className="status-message error full-width">{verifyError}</p>}
            {verifySuccess && <p className="status-message success full-width">{verifySuccess}</p>}
            <button
              className={verifying ? 'button primary full-width is-loading' : 'button primary full-width'}
              type="submit"
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
