'use client';

import React, { useState } from 'react';

export function TrainingRegisterBtn({ trainingId, price, title }: { trainingId: string, price: string | number, title: string }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [error, setError] = useState('');
  const isFree = Number(price) === 0;

  async function handleRegister() {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    
    if (!email) {
      setError('Please enter your email to continue.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/training/${trainingId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.message || data.error || 'Failed to register');
      }

      if (data.requiresLogin) {
        // Redirect to login with callback
        window.location.href = `/auth/login?callbackUrl=/training&message=${encodeURIComponent(data.message)}`;
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.status === 'free') {
        window.location.href = '/portal/training?enrolled=success';
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {showEmailInput && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
      
      <button 
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: isFree ? '#10b981' : '#0ea5e9',
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
        {loading ? 'Processing...' : (showEmailInput ? (isFree ? 'Enroll Now' : `Pay $${Number(price).toFixed(2)}`) : 'Register')}
      </button>
    </div>
  );
}
