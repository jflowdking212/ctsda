'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    institutionName: '',
    registrationNumber: '',
    institutionType: 'corporate',
    country: 'Nigeria',
    address: '',
    trainingAreaIds: ['SOFTWARE-ENG'], // default example
    certificatesOffered: 'Certificate of Completion',
    deliveryMethods: 'Online, In-person',
    staffingCount: '',
    operationalInfo: '',
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

      setMessage('Account & Application created! A verification token has been sent to your email. Enter it below to complete registration.');
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

      setVerifySuccess('Email verified successfully! Your application is now pending review. Redirecting you to login...');
      setTimeout(() => {
        router.push('/portal/login');
      }, 3000);
    } catch {
      setVerifyError('Verification service is not reachable. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="content-page narrow" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header className="content-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="eyebrow" style={{ color: '#0ea5e9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Accreditation Application</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Apply Now</h1>
        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Create your user profile and submit your institution's details in one step.</p>
      </header>

      {!registered ? (
        <form className="content-panel content-form" onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f1f5f9' }}>1. User Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              First Name *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Last Name *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Email Address *
              <input type="email" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Phone Number
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={loading} />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Password *
              <input type="password" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={loading} />
            </label>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f1f5f9' }}>2. Institution Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Institution / Company Name *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Registration / RC Number *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Institution Type
              <select style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }} value={form.institutionType} onChange={(e) => setForm({ ...form, institutionType: e.target.value })} disabled={loading}>
                <option value="corporate">Corporate Training Provider</option>
                <option value="vocational">Vocational / Technical</option>
                <option value="higher_education">Higher Education</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Country *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required disabled={loading} />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Physical Address
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={loading} />
            </label>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f1f5f9' }}>3. Accreditation Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Certificates Offered (Comma separated) *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.certificatesOffered} onChange={(e) => setForm({ ...form, certificatesOffered: e.target.value })} placeholder="e.g. Full-Stack Web Development, UI/UX" required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Delivery Methods (Comma separated) *
              <input style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} value={form.deliveryMethods} onChange={(e) => setForm({ ...form, deliveryMethods: e.target.value })} placeholder="e.g. Online, In-person" required disabled={loading} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Operational Information
              <textarea style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', minHeight: '100px', resize: 'vertical' }} value={form.operationalInfo} onChange={(e) => setForm({ ...form, operationalInfo: e.target.value })} placeholder="Provide a brief overview of your programs and operations..." disabled={loading} />
            </label>
          </div>

          {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1.5rem', fontWeight: 500 }}>{error}</div>}
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      ) : (
        <div className="content-panel content-form" style={{ backgroundColor: '#ffffff', padding: '3rem 2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Application Submitted!</h2>
          <p style={{ color: '#475569', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>{message}</p>

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Verification Code
              <input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Paste the code from your email"
                required
                type="text"
                disabled={verifying}
                style={{ padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: '1rem', textAlign: 'center' }}
              />
            </label>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
              Didn&apos;t receive the email? Check your <strong>spam or junk</strong> folder.
            </p>
            {verifyError && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{verifyError}</div>}
            {verifySuccess && <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{verifySuccess}</div>}
            <button
              type="submit"
              disabled={verifying}
              style={{ padding: '0.875rem', backgroundColor: '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 700, cursor: verifying ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
