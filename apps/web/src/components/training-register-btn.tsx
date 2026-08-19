'use client';

import React, { useState } from 'react';

export function TrainingRegisterBtn({
  trainingId,
  price: _price,
  title: _title,
}: {
  trainingId: string;
  price: string | number;
  title: string;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Anti-spam Captcha state
  const [captchaId, setCaptchaId] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const _RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const API_BASE = (typeof window !== 'undefined' && _RAW_API_BASE === 'http://localhost:4000') ? '/api' : _RAW_API_BASE;

  async function fetchCaptcha() {
    setLoadingCaptcha(true);
    try {
      const res = await fetch(`${API_BASE}/training/captcha`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.captchaId && data.question) {
          setCaptchaId(data.captchaId);
          setCaptchaQuestion(data.question);
          setCaptchaAnswer('');
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingCaptcha(false);
    }
  }

  function handleOpenForm() {
    setShowForm(true);
    setError('');
    void fetchCaptcha();
  }

  async function handleRegister() {
    if (!showForm) {
      handleOpenForm();
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!captchaAnswer.trim()) {
      setError('Please solve the math verification question.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/training/${trainingId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          captchaId,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // Refresh captcha on failed attempt
        void fetchCaptcha();
        throw new Error(data.message || data.error?.message || 'Failed to submit registration request.');
      }

      setSuccessMsg(data.message || 'Your registration request has been received.');
      setShowForm(false);
      setName('');
      setEmail('');
      setCaptchaAnswer('');
    } catch (err: any) {
      setError(err.message || 'Error submitting registration.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {successMsg && (
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '0.625rem',
            fontSize: '0.85rem',
            textAlign: 'center',
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <span>✓</span> Request Received
          </div>
          {successMsg}
        </div>
      )}

      {!successMsg && showForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.625rem',
            padding: '0.875rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Full Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.45rem',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Email Address <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.45rem',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          {/* Security Captcha Box */}
          <div
            style={{
              padding: '0.625rem 0.75rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.45rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>🛡️</span> Security Verification
              </div>
              <button
                type="button"
                onClick={fetchCaptcha}
                disabled={loadingCaptcha}
                title="Get a new math challenge"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.1rem 0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>↻</span> {loadingCaptcha ? 'Refreshing...' : 'New Question'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #93c5fd',
                  borderRadius: '0.35rem',
                  padding: '0.4rem 0.65rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#1e3a8a',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {loadingCaptcha ? 'Loading...' : captchaQuestion || 'What is 5 + 3 = ?'}
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.35rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.5rem 0.65rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                color: '#b91c1c',
                fontSize: '0.75rem',
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '0.55rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading || loadingCaptcha}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: '#10233f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: loading || loadingCaptcha ? 'not-allowed' : 'pointer',
                opacity: loading || loadingCaptcha ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {!successMsg && !showForm && (
        <button
          onClick={handleOpenForm}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#10233f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s',
          }}
        >
          Register for Training
        </button>
      )}
    </div>
  );
}
