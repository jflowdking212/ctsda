'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Form State
  const [applicantForm, setApplicantForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  const [otp, setOtp] = useState('');
  
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    registrationNumber: '',
    institutionType: 'corporate',
    country: 'Nigeria',
    address: '',
    phone: '',
    email: '',
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [applicationForm, setApplicationForm] = useState({
    trainingAreaIds: [] as string[],
    certificatesOffered: '',
    deliveryMethods: 'Online Live / Virtual',
    staffingCount: '',
    operationalInfo: '',
  });

  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions/training-areas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrainingAreas(data);
          if (data.length > 0) {
            setApplicationForm(prev => ({ ...prev, trainingAreaIds: [data[0].id] }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: applicantForm.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error?.message || data.message || 'Failed to send verification code.');
        return;
      }
      setStep(2);
      setSuccess('Verification code sent to your email.');
    } catch (err) {
      setError('Service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: applicantForm.email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error?.message || 'Invalid or expired code.');
        return;
      }
      setError('');
      setSuccess('');
      setStep(3);
    } catch (err) {
      setError('Service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: applicantForm.email,
        otp,
        firstName: applicantForm.firstName,
        lastName: applicantForm.lastName,
        phone: applicantForm.phone,
        institution: institutionForm,
        application: {
          trainingAreaIds: applicationForm.trainingAreaIds,
          certificatesOffered: applicationForm.certificatesOffered.split(',').map(s => s.trim()).filter(Boolean),
          deliveryMethods: applicationForm.deliveryMethods.split(',').map(s => s.trim()).filter(Boolean),
          staffingCount: applicationForm.staffingCount ? Number(applicationForm.staffingCount) : undefined,
          operationalInfo: applicationForm.operationalInfo,
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions/public-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error?.message || data.message || 'Application submission failed.');
        setLoading(false);
        return;
      }

      // Upload Logo if present
      if (logoFile && data.applicationId && data.uploadToken) {
        const formData = new FormData();
        formData.append('file', logoFile);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/documents/public-upload/${data.applicationId}/${data.uploadToken}`, {
          method: 'POST',
          body: formData,
        });
      }

      setStep(4);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content-page narrow">
      <header className="content-header" style={{
        backgroundColor: '#ffffff',
        padding: '2rem 2.5rem',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        borderLeft: '5px solid #2563eb',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
      }}>
        <p className="eyebrow" style={{ color: '#d97706', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', textAlign: 'left', alignSelf: 'flex-start' }}>Accreditation</p>
        <h1 style={{ textAlign: 'left', color: '#0f172a', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.2, alignSelf: 'flex-start' }}>Apply for CTSDA Accreditation</h1>
        <p style={{ textAlign: 'left', color: '#64748b', fontSize: '1rem', margin: 0, lineHeight: 1.5, alignSelf: 'flex-start' }}>Complete the form below to begin the application process.</p>
      </header>

      {/* STEP WIZARD BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 1 ? '#2563eb' : '#e2e8f0', color: step >= 1 ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
          <span style={{ fontSize: '0.875rem', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? '#0f172a' : '#64748b' }}>Profile</span>
        </div>
        <div style={{ flex: 1, height: '2px', backgroundColor: step >= 2 ? '#2563eb' : '#e2e8f0', margin: '0 1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 2 ? '#2563eb' : '#e2e8f0', color: step >= 2 ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>2</div>
          <span style={{ fontSize: '0.875rem', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? '#0f172a' : '#64748b' }}>Verification</span>
        </div>
        <div style={{ flex: 1, height: '2px', backgroundColor: step >= 3 ? '#2563eb' : '#e2e8f0', margin: '0 1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= 3 ? '#2563eb' : '#e2e8f0', color: step >= 3 ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>3</div>
          <span style={{ fontSize: '0.875rem', fontWeight: step === 3 ? 700 : 500, color: step === 3 ? '#0f172a' : '#64748b' }}>Institution Info</span>
        </div>
      </div>

      {step === 1 && (
        <form className="content-panel" onSubmit={handleRequestOtp} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Step 1: Applicant Representative Profile</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Please enter your personal contact details as the primary applicant representative.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input required value={applicantForm.firstName} onChange={e => setApplicantForm({...applicantForm, firstName: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.925rem', outline: 'none' }} placeholder="e.g. John" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input required value={applicantForm.lastName} onChange={e => setApplicantForm({...applicantForm, lastName: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.925rem', outline: 'none' }} placeholder="e.g. Doe" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="email" value={applicantForm.email} onChange={e => setApplicantForm({...applicantForm, email: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.925rem', outline: 'none' }} placeholder="john.doe@example.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
              <input required value={applicantForm.phone} onChange={e => setApplicantForm({...applicantForm, phone: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.925rem', outline: 'none' }} placeholder="+1 (555) 019-2831" />
            </div>
          </div>
          
          {error && <p className="status-message error" style={{ marginTop: '1.25rem', backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #fecaca', fontSize: '0.875rem' }}>{error}</p>}
          
          <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading} style={{ width: '100%', marginTop: '1.75rem', padding: '0.875rem 1.5rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>
            {loading ? 'Sending Verification Code...' : 'Continue & Verify Email →'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="content-panel" onSubmit={handleVerifyOtp} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Step 2: Email Verification</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Verify your identity to unlock institution registration.</p>
          </div>

          {success && <p className="status-message success" style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{success}</p>}
          
          <p style={{ margin: '0.5rem 0 1.25rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Please enter the 6-digit verification code sent to <strong>{applicantForm.email}</strong>. 
            <br />
            <span style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginTop: '0.35rem' }}>
              💡 If you don't see the email in your inbox, please check your <strong>Spam / Junk</strong> folder.
            </span>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>6-Digit Verification Code <span style={{ color: '#ef4444' }}>*</span></label>
            <input required value={otp} onChange={e => setOtp(e.target.value)} disabled={loading} placeholder="123456" maxLength={6} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '1.25rem', letterSpacing: '0.25em', fontFamily: 'monospace', fontWeight: 700, width: '220px', outline: 'none' }} />
          </div>

          {error && <p className="status-message error" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #fecaca', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button type="button" onClick={() => setStep(1)} disabled={loading} style={{ padding: '0.875rem 1.5rem', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, borderRadius: '0.5rem', border: '1px solid #cbd5e1', cursor: loading ? 'not-allowed' : 'pointer' }}>
              ← Back
            </button>
            <button className={loading ? 'button primary is-loading' : 'button primary'} style={{ flex: 1, padding: '0.875rem 1.5rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }} type="submit" disabled={loading}>
              {loading ? 'Verifying Code...' : 'Verify Code & Proceed →'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="content-panel" onSubmit={handleFinalSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1: INSTITUTION DETAILS */}
          <div>
            <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>1. Institution Information</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>Official details of the organization seeking CTSDA accreditation.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={institutionForm.name} onChange={e => setInstitutionForm({...institutionForm, name: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="e.g. Apex Safety Institute" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Registration / RC Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={institutionForm.registrationNumber} onChange={e => setInstitutionForm({...institutionForm, registrationNumber: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="e.g. RC-982341" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Institution Type <span style={{ color: '#ef4444' }}>*</span></label>
                <select required value={institutionForm.institutionType} onChange={e => setInstitutionForm({...institutionForm, institutionType: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', backgroundColor: '#ffffff', outline: 'none' }}>
                  <option value="tech_software">Tech, Software & Digital Skills Academy</option>
                  <option value="ecommerce_digital">E-Commerce, Digital Business & Marketing Institute</option>
                  <option value="corporate">Corporate Training & Professional Development</option>
                  <option value="vocational">Vocational & Technical Training Institute</option>
                  <option value="safety_compliance">Safety, Health & Compliance Institute</option>
                  <option value="finance_fintech">Finance, Accounting & FinTech Academy</option>
                  <option value="healthcare_medical">Healthcare & Medical Training Center</option>
                  <option value="higher_education">Higher Education / University / College</option>
                  <option value="driving_transport">Transport, Logistics & Automotive Institute</option>
                  <option value="other">Other Training Provider</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Country <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={institutionForm.country} onChange={e => setInstitutionForm({...institutionForm, country: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Official Email <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="email" value={institutionForm.email} onChange={e => setInstitutionForm({...institutionForm, email: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="info@institution.com" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Official Phone <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={institutionForm.phone} onChange={e => setInstitutionForm({...institutionForm, phone: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="+1 (555) 019-2831" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Physical Headquarters Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={institutionForm.address} onChange={e => setInstitutionForm({...institutionForm, address: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="Street address, City, State/Province" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Company Logo (Appears on accredited partner gallery upon approval)</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} disabled={loading} style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.85rem', backgroundColor: '#f8fafc' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: ACCREDITATION SCOPE & TRAINING AREAS */}
          <div>
            <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>2. Accreditation Scope & Training Areas</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>Select the training areas your institution provides and seeks accreditation for.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.75rem' }}>
                Select Training Area Categories (Click cards to toggle)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
                {trainingAreas.map((area) => {
                  const isChecked = applicationForm.trainingAreaIds.includes(area.id);
                  return (
                    <div
                      key={area.id}
                      onClick={() => {
                        if (loading) return;
                        setApplicationForm(prev => {
                          const ids = prev.trainingAreaIds.includes(area.id) 
                            ? prev.trainingAreaIds.filter(id => id !== area.id)
                            : [...prev.trainingAreaIds, area.id];
                          return { ...prev, trainingAreaIds: ids };
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '0.85rem 1.15rem',
                        borderRadius: '0.625rem',
                        border: isChecked ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease-in-out',
                        boxShadow: isChecked ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '2px solid #94a3b8',
                          backgroundColor: isChecked ? '#2563eb' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          transition: 'all 0.15s ease',
                        }}>
                          {isChecked && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#1e40af' : '#334155' }}>
                          {area.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Certificates Offered (Comma separated) <span style={{ color: '#ef4444' }}>*</span></label>
                <input required value={applicationForm.certificatesOffered} onChange={e => setApplicationForm({...applicationForm, certificatesOffered: e.target.value})} placeholder="e.g. Web Development, UI/UX Design" disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Primary Delivery Method <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  required
                  value={applicationForm.deliveryMethods || 'Online Live / Virtual'}
                  onChange={e => setApplicationForm({...applicationForm, deliveryMethods: e.target.value})}
                  disabled={loading}
                  style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', backgroundColor: '#ffffff', outline: 'none' }}
                >
                  <option value="Online Live / Virtual">Online Live / Virtual Classroom</option>
                  <option value="In-Person Classroom">In-Person / Physical Classroom</option>
                  <option value="Hybrid (Online & In-Person)">Hybrid (Online & In-Person)</option>
                  <option value="Self-Paced E-Learning">Self-Paced E-Learning</option>
                  <option value="Blended Learning Workshops">Blended Learning Workshops</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Staffing Count (Instructors / Staff)</label>
                <input type="number" min="1" value={applicationForm.staffingCount} onChange={e => setApplicationForm({...applicationForm, staffingCount: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="e.g. 15" />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Operational & Facility Summary (Optional)</label>
              <textarea rows={3} value={applicationForm.operationalInfo} onChange={e => setApplicationForm({...applicationForm, operationalInfo: e.target.value})} disabled={loading} style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} placeholder="Provide any additional context about your training facilities, quality management system, or accreditation history..." />
            </div>
          </div>

          {error && <p className="status-message error" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #fecaca', fontSize: '0.875rem' }}>{error}</p>}
          
          <button className={loading ? 'button primary is-loading' : 'button primary'} type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem 1.5rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}>
            {loading ? 'Submitting Application...' : 'Submit Accreditation Application'}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="content-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem auto', border: '2px solid #a7f3d0' }}>✓</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Application Submitted Successfully!</h2>
          <p style={{ maxWidth: '560px', margin: '0 auto 1.5rem auto', color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
            Your application for <strong>CTSDA accreditation</strong> is now under review. A confirmation email has been sent to <strong>{applicantForm.email}</strong> with your application details.
          </p>
          
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.625rem', padding: '1.25rem', maxWidth: '520px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
              💡 <strong>Need help or have an enquiry?</strong><br />
              If you need to make updates or have any questions regarding your application status, please reach out directly to our support team:
            </p>
            <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>
              ✉️ <a href="mailto:support@ctsda.org" style={{ color: '#2563eb', textDecoration: 'underline' }}>support@ctsda.org</a>
            </p>
          </div>

          <button className="button primary" onClick={() => router.push('/')} style={{ padding: '0.875rem 2rem', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
            Return to Homepage
          </button>
        </div>
      )}
    </main>
  );
}
