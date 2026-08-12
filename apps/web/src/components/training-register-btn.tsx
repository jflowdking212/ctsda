'use client';

import React, { useState } from 'react';

export function TrainingRegisterBtn({ trainingId, price, title: _title }: { trainingId: string, price: string | number, title: string }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const isFree = Number(price) === 0;

  async function handleRegister() {
    if (!showForm) {
      setShowForm(true);
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email to continue.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/training/${trainingId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.message || data.error || 'Failed to register');
      }

      setSuccessMsg(data.message || 'Registration request sent successfully.');
      setShowForm(false);
      setName('');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {successMsg && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.4 }}>
          {successMsg}
        </div>
      )}
      {!successMsg && showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ 
              padding: '0.625rem 0.875rem', 
              border: '1px solid #cbd5e1', 
              borderRadius: '0.5rem', 
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ 
              padding: '0.625rem 0.875rem', 
              border: '1px solid #cbd5e1', 
              borderRadius: '0.5rem', 
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          {error && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{error}</span>}
        </div>
      )}
      
      {!successMsg && (
        <button 
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : (showForm ? 'Submit Request' : 'Register')}
        </button>
      )}
    </div>
  );
}
