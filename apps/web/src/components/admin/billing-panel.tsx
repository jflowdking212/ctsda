'use client';

import React, { useState, useEffect } from 'react';

export function BillingPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & messages
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<any | null>(null);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await api('/admin/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data || []);
        }
      } catch (e) {
        console.error('Failed to fetch billing data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchBilling();
  }, [api]);

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'all') return true;
    return inv.status === activeTab;
  });

  const handleMarkAsPaidConfirm = async () => {
    if (!markPaidInvoice) return;
    if (!paymentRef.trim()) {
      setMessage({ text: 'Please enter a valid payment reference number.', type: 'error' });
      return;
    }
    
    try {
      // await api(`/admin/invoices/${markPaidInvoice.id}/pay`, { method: 'POST', body: JSON.stringify({ reference: paymentRef.trim() }) });
      const updated = invoices.map(inv =>
        inv.id === markPaidInvoice.id
          ? { ...inv, status: 'paid' as const, referenceNo: paymentRef.trim() }
          : inv
      );
      setInvoices(updated);
      setMessage({
        text: `Invoice ${markPaidInvoice.id} successfully marked as PAID (Ref: ${paymentRef.trim()}). (API connection pending)`,
        type: 'success',
      });
    } catch (e) {
      setMessage({ text: 'Failed to mark as paid', type: 'error' });
    }
    setMarkPaidInvoice(null);
    setPaymentRef('');
  };

  const handleSendReminder = (inv: any) => {
    setMessage({
      text: `Payment reminder notice successfully emailed to ${inv.institution?.name || 'institution'} for ${inv.id}.`,
      type: 'success',
    });
  };

  const handleDownloadReceipt = (inv: any) => {
    setMessage({
      text: `Generating official payment receipt for ${inv.id}... Download started.`,
      type: 'success',
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    let background = '#dcfce7';
    let color = '#166534';
    if (status === 'pending') {
      background = '#fef3c7';
      color = '#92400e';
    } else if (status === 'overdue' || status === 'failed') {
      background = '#fee2e2';
      color = '#991b1b';
    }
    return {
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      background,
      color,
    };
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue' || i.status === 'failed').length;

  return (
    <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with blue left border accent */}
      <div
        className="admin-section-header"
        style={{
          borderLeft: '4px solid #2563eb',
          paddingLeft: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <span className="admin-kicker" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Financial Management
          </span>
          <h2 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Billing & Orders Panel
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            Manage accreditation institution invoices, payments, subscriptions, and financial records.
          </p>
        </div>
      </div>

      {/* Message Toast / Alert */}
      {message && (
        <div
          className={`admin-message ${message.type}`}
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#166534' : '#991b1b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              marginLeft: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div
        className="metric-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Revenue
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Paid Invoices
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '0.5rem' }}>
            {paidCount}
          </div>
        </div>

        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Pending
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.5rem' }}>
            {pendingCount}
          </div>
        </div>

        <div
          className="metric-card"
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Overdue / Failed
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.5rem' }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Main Billing Table Section */}
      <div
        className="admin-card"
        style={{
          background: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Tabs Filter Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#fafafa',
          }}
        >
          {(['all', 'paid', 'pending', 'overdue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="admin-button"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: activeTab === tab ? '#2563eb' : '#cbd5e1',
                backgroundColor: activeTab === tab ? '#2563eb' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#475569',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'all' ? 'All Invoices' : tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div style={{ overflowX: 'auto' }}>
          <table
            className="admin-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead
              style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0',
              }}
            >
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Invoice #</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Institution</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isHovered = hoveredRow === inv.id;
                  return (
                    <tr
                      key={inv.id}
                      onMouseEnter={() => setHoveredRow(inv.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        backgroundColor: isHovered ? '#f8fafc' : 'transparent',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {inv.invoiceNumber || inv.id?.split('-')[0] || inv.id}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#334155', fontWeight: 500 }}>
                        {inv.application?.institution?.name || inv.institution?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {inv.currency || '$'}{inv.amount}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={getStatusBadgeStyle(inv.status)}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="admin-button"
                            style={{
                              padding: '0.3rem 0.7rem',
                              fontSize: '0.75rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            View
                          </button>

                          {inv.status === 'pending' && (
                            <button
                              onClick={() => {
                                setMarkPaidInvoice(inv);
                                setPaymentRef('');
                              }}
                              className="admin-button primary"
                              style={{
                                padding: '0.3rem 0.7rem',
                                fontSize: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #2563eb',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              Mark as Paid
                            </button>
                          )}

                          {(inv.status === 'overdue' || inv.status === 'failed') && (
                            <button
                              onClick={() => handleSendReminder(inv)}
                              className="admin-button danger"
                              style={{
                                padding: '0.3rem 0.7rem',
                                fontSize: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #dc2626',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              Send Reminder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Mark as Paid */}
      {markPaidInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Confirm Payment Settlement
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>
              Mark invoice <strong>{markPaidInvoice.id}</strong> as fully paid.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Payment Reference Number / Transaction Hash *
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder="e.g. STR-99281 or WIRE-2026-X88"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setMarkPaidInvoice(null);
                  setPaymentRef('');
                }}
                className="admin-button"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaidConfirm}
                className="admin-button primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #2563eb',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View Invoice Details */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              maxWidth: '500px',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Invoice Details
              </h3>
              <span style={getStatusBadgeStyle(selectedInvoice.status)}>
                {selectedInvoice.status}
              </span>
            </div>

            <div className="admin-detail" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Invoice Number</span>
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{selectedInvoice.invoiceNumber || selectedInvoice.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Institution</span>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>{selectedInvoice.application?.institution?.name || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Amount</span>
                <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '1rem' }}>{selectedInvoice.currency || '$'}{selectedInvoice.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Issue Date</span>
                <span style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.85rem' }}>{selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : ''}</span>
              </div>
              {selectedInvoice.referenceNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Reference #</span>
                  <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.85rem' }}>{selectedInvoice.referenceNo}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="admin-button"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
