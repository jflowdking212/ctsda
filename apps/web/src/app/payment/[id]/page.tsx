'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [showManualBank, setShowManualBank] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (!id) return;
    fetch(`${apiUrl}/payments/invoice/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Invoice not found');
        return res.json();
      })
      .then(data => {
        setInvoice(data);
      })
      .catch(() => {
        setError('Invoice or Application record not found.');
      })
      .finally(() => setLoading(false));
  }, [id, apiUrl]);

  async function handlePay() {
    setPaying(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/payments/public-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id, applicationId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Payment provider unavailable');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || 'Payment is already complete.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment checkout failed');
      setShowManualBank(true);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading payment invoice details...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '3rem 1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '2.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>CTSDA Accreditation Settlement</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Council for Technical Skills & Development Accreditation</p>
        </div>

        {error && (
          <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {invoice ? (
          <div>
            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Invoice Number</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{invoice.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Institution</span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{invoice.institutionName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Recipient</span>
                <span style={{ color: '#334155', fontSize: '0.875rem' }}>{invoice.applicantName} ({invoice.applicantEmail})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #cbd5e1' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Amount Due</span>
                <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.25rem' }}>${invoice.amount} {invoice.currency}</span>
              </div>
            </div>

            {invoice.status === 'paid' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>✓ Invoice Paid</h3>
                <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.875rem' }}>This accreditation fee has been successfully settled.</p>
                <Link href="/portal/applications" style={{ display: 'inline-block', padding: '0.625rem 1.25rem', backgroundColor: '#166534', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                  Go to Applications Portal
                </Link>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  style={{ width: '100%', padding: '0.875rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', marginBottom: '1rem' }}
                >
                  {paying ? 'Connecting to Gateway...' : `Pay $${invoice.amount} via Credit Card / Stripe`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualBank(!showManualBank)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {showManualBank ? 'Hide Bank Wire Details' : 'Pay via Wire Transfer / Bank Deposit'}
                </button>

                {showManualBank && (
                  <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Bank Wire Transfer Details</h4>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Bank Name:</strong> CTSDA International Settlement Bank</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Account Name:</strong> CTSDA Accreditation Services</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>SWIFT/BIC:</strong> CTSDAUS33XXX</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Reference:</strong> {invoice.invoiceNumber}</p>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8125rem', color: '#64748b' }}>After making transfer, please send proof to finance@ctsdamerica.com or contact support for manual approval.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/portal/applications" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Back to Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
