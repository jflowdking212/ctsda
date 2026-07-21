import React, { useState, useEffect } from 'react';

export function BillingPanel({ api }: { api: (path: string, init?: RequestInit) => Promise<Response> }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilling();
  }, []);

  async function loadBilling() {
    try {
      const response = await api('/admin/billing/orders');
      setOrders(await response.json());
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Subscriptions & Orders</h2>
      <p>View Stripe subscriptions and manual orders.</p>
      {loading ? <p>Loading billing data...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Institution</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={5}>No orders found.</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id.substring(0,8)}...</td>
                <td>{o.institution?.name}</td>
                <td>{o.currency} {o.amount}</td>
                <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
