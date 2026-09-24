'use client';

import { useState } from 'react';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      institution: formData.get('institution'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to send message');
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSubmit}>
      {success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.625rem', fontSize: '0.95rem' }}>
          Your message has been sent successfully. We will get back to you shortly.
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.625rem', fontSize: '0.95rem' }}>
          {error}
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Full Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          name="fullName"
          type="text"
          placeholder="e.g. Dr. Jane Smith"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            color: '#0f172a',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Email Address <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="jane@institution.edu"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            color: '#0f172a',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Institution / Organization
        </label>
        <input
          name="institution"
          type="text"
          placeholder="e.g. Global Academy of Science"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            color: '#0f172a',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Subject / Topic <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          name="subject"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            outline: 'none',
          }}
        >
          <option value="">Select a subject...</option>
          <option value="accreditation">Institutional Accreditation Inquiry</option>
          <option value="verification">Certificate Verification Assistance</option>
          <option value="training">Training Program Accreditation</option>
          <option value="partnership">Partnership & Collaboration</option>
          <option value="other">General Question</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
          Your Message <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="How can our team help you?"
          required
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            color: '#0f172a',
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          backgroundColor: loading ? '#94a3b8' : '#2563eb',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '0.95rem 1.75rem',
          borderRadius: '0.625rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.3)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
