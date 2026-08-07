'use client';

import { useEffect, useState } from 'react';

type Certificate = {
  id: string;
  certificateNumber: string;
  verificationToken: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
};

type Accreditation = {
  id: string;
  accreditationCode: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  certificates?: Certificate[];
};

type Invoice = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  paidAt?: string;
};

type Institution = {
  id: string;
  name: string;
  registrationNumber?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
};

type Application = {
  id: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  institution?: Institution;
  invoices?: Invoice[];
  accreditations?: Accreditation[];
};

const PORTAL_SESSION_KEY = 'ctsda_portal_session';

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    async function load() {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const storedUser = window.localStorage.getItem(`${PORTAL_SESSION_KEY}_user`);
      if (storedUser) {
        try { setUserProfile(JSON.parse(storedUser)); } catch (e) { setMessage(''); }
      }

      const res = await fetch(`${apiUrl}/applications/me`, {
        credentials: 'include',
        headers: {
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setApps(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    load();
  }, [apiUrl]);

  async function submitApplication(applicationId: string) {
    setMessage('');
    setPayingId(applicationId);
    try {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const response = await fetch(`${apiUrl}/applications/${applicationId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
        body: JSON.stringify({}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || 'Unable to submit application');
      }
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      setMessage(result.message || 'Application submitted successfully.');
      const res = await fetch(`${apiUrl}/applications/me`, {
        credentials: 'include',
        headers: {
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
      });
      if (res.ok) setApps(await res.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit application');
    } finally {
      setPayingId(null);
    }
  }

  async function startCheckout(applicationId: string) {
    setMessage('');
    setPayingId(applicationId);
    try {
      const storedSession = window.localStorage.getItem(PORTAL_SESSION_KEY) || '';
      const response = await fetch(`${apiUrl}/payments/create-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(storedSession ? { 'X-Session-Id': storedSession } : {}),
        },
        body: JSON.stringify({ applicationId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error?.message || result.message || 'Unable to start checkout');
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setMessage(result.message || 'Payment is already complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start checkout');
    } finally {
      setPayingId(null);
    }
  }

  function formatDate(d?: string) {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  }

  function getDaysRemaining(expiryDateStr?: string) {
    if (!expiryDateStr) return null;
    try {
      const expiry = new Date(expiryDateStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((expiry - now) / (1000 * 3600 * 24));
      return diffDays;
    } catch {
      return null;
    }
  }

  return (
    <main className="content-page" style={{ maxWidth: '1140px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header Welcome Banner */}
      <header className="content-header" style={{ marginBottom: '2rem', backgroundColor: '#0f172a', color: '#ffffff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
              APPLICANT PORTAL &amp; ACCREDITATION HUB
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>
              Welcome back{userProfile?.firstName ? `, ${userProfile.firstName}` : ''}!
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: '640px' }}>
              Monitor your institutional accreditation credentials, digital certificates, billing records, and renewal validity.
            </p>
          </div>
          <a
            className="button primary"
            href="/portal/applications/new"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            + Apply for New Accreditation
          </a>
        </div>
      </header>

      {message && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
          Loading your accreditation records...
        </div>
      )}

      {!loading && apps.length === 0 && (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <svg style={{ width: '48px', height: '48px', color: '#94a3b8', marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>No Accreditation Records Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You haven't submitted an institutional accreditation application yet.</p>
          <a href="/portal/applications/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
            Start Accreditation Application →
          </a>
        </div>
      )}

      {apps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {apps.map((app) => {
            const isApproved = app.status === 'approved';
            const acc = app.accreditations?.[0];
            const cert = acc?.certificates?.[0];
            const daysRemaining = getDaysRemaining(cert?.expiryDate || acc?.expiresAt);

            return (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden',
                }}
              >
                {/* Application Header Bar */}
                <div
                  style={{
                    padding: '1.25rem 1.75rem',
                    backgroundColor: isApproved ? '#f0fdf4' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {app.institution?.logoUrl ? (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={app.institution.logoUrl.startsWith('http') ? app.institution.logoUrl : `${apiUrl}/accreditations/logo-file?key=${encodeURIComponent(app.institution.logoUrl)}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {app.institution?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {app.institution?.name || 'Institution Application'}
                      </h2>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                        {app.institution?.registrationNumber ? `Company Reg No: ${app.institution.registrationNumber} • ` : ''}{app.institution?.country || 'Global Partner'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isApproved ? (
                      <span style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ACCREDITATION ACTIVE
                      </span>
                    ) : (
                      <span style={{ backgroundColor: app.status === 'under_review' ? '#f59e0b' : '#3b82f6', color: '#ffffff', padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        Status: {app.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* ACCREDITATION & CERTIFICATE DETAILS BOX (If Approved / Active) */}
                  {isApproved && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 15l-2 5l-2 -2l-2 2l1.5 -5.5"/><circle cx="12" cy="9" r="6"/></svg>
                          Official Verification &amp; Certificate Credentials
                        </h4>
                        {daysRemaining !== null && (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: daysRemaining < 60 ? '#d97706' : '#16a34a', backgroundColor: daysRemaining < 60 ? '#fef3c7' : '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                            {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Accreditation Expired'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                            Accreditation Code
                          </span>
                          <strong style={{ fontSize: '0.975rem', color: '#0f172a', fontFamily: 'monospace' }}>
                            {acc?.accreditationCode || 'CTSDA-2026-ACTIVE'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                            Certificate Number
                          </span>
                          <strong style={{ fontSize: '0.975rem', color: '#0f172a', fontFamily: 'monospace' }}>
                            {cert?.certificateNumber || 'CERT-ACTIVE'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                            Activation / Issue Date
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                            {formatDate(cert?.issueDate || acc?.issuedAt || app.reviewedAt)}
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                            Expiration Date
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 700 }}>
                            {formatDate(cert?.expiryDate || acc?.expiresAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        {cert?.verificationToken && (
                          <a
                            href={`/verify?token=${cert.verificationToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.625rem 1.25rem',
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Verify Digital Certificate
                          </a>
                        )}

                        {cert?.verificationToken && (
                          <a
                            href={`/verify-certificate?certNumber=${cert.certificateNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.625rem 1.25rem',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Certificate (PDF / QR)
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => startCheckout(app.id)}
                          style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: '#ffffff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginLeft: 'auto',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                          Renew Accreditation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BILLING & INVOICE HISTORY SECTION */}
                  <div>
                    <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.975rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      Billing &amp; Invoice History
                    </h4>

                    {app.invoices && app.invoices.length > 0 ? (
                      <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Invoice ID</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {app.invoices.map((inv) => (
                              <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                                  {inv.id.substring(0, 18)}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                                  {inv.description || 'CTSDA Institutional Accreditation Fee'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                                  ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {inv.currency?.toUpperCase() || 'USD'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                  {formatDate(inv.paidAt || inv.createdAt)}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ backgroundColor: inv.status === 'paid' ? '#dcfce7' : '#fef3c7', color: inv.status === 'paid' ? '#166534' : '#92400e', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                  {inv.status !== 'paid' ? (
                                    <button
                                      type="button"
                                      onClick={() => startCheckout(app.id)}
                                      disabled={payingId === app.id}
                                      style={{ padding: '0.4rem 0.85rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                      {payingId === app.id ? 'Processing...' : 'Pay Invoice'}
                                    </button>
                                  ) : (
                                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8125rem' }}>✓ Paid Receipt</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.875rem', color: '#64748b' }}>
                        No separate invoice transactions recorded yet. (Accreditation status active).
                      </div>
                    )}
                  </div>

                  {/* UNAPPROVED / PENDING ACTION BUTTONS */}
                  {!isApproved && (
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      {app.status === 'draft' && (
                        <button
                          type="button"
                          className={payingId === app.id ? 'button primary is-loading' : 'button primary'}
                          onClick={() => submitApplication(app.id)}
                          disabled={payingId === app.id}
                          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                        >
                          {payingId === app.id ? 'Submitting...' : 'Submit Application →'}
                        </button>
                      )}
                      {(app.status === 'payment_pending' || (app.invoices && app.invoices.some(i => i.status !== 'paid'))) && (
                        <button
                          type="button"
                          className={payingId === app.id ? 'button primary is-loading' : 'button primary'}
                          onClick={() => startCheckout(app.id)}
                          disabled={payingId === app.id}
                          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                        >
                          {payingId === app.id ? 'Starting Checkout...' : 'Complete Payment →'}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
