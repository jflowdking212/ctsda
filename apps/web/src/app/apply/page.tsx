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
    deliveryMethods: '',
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

      {step === 1 && (
        <form className="content-panel content-form two-column" onSubmit={handleRequestOtp}>
          <h3 className="full-width">Step 1: Applicant Profile</h3>
          
          <label>First Name *<input required value={applicantForm.firstName} onChange={e => setApplicantForm({...applicantForm, firstName: e.target.value})} disabled={loading}/></label>
          <label>Last Name *<input required value={applicantForm.lastName} onChange={e => setApplicantForm({...applicantForm, lastName: e.target.value})} disabled={loading}/></label>
          <label>Email Address *<input required type="email" value={applicantForm.email} onChange={e => setApplicantForm({...applicantForm, email: e.target.value})} disabled={loading}/></label>
          <label>Phone Number *<input required value={applicantForm.phone} onChange={e => setApplicantForm({...applicantForm, phone: e.target.value})} disabled={loading}/></label>
          
          {error && <p className="status-message error full-width">{error}</p>}
          <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
            {loading ? 'Sending code...' : 'Continue & Verify Email'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="content-panel content-form" onSubmit={handleVerifyOtp}>
          <h3>Step 2: Verify Email</h3>
          {success && <p className="status-message success">{success}</p>}
          <p style={{ margin: '0.5rem 0 1rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Please enter the 6-digit code sent to <strong>{applicantForm.email}</strong>. 
            <br />
            <span style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginTop: '0.35rem' }}>
              💡 If you don't see the email in your inbox, please check your <strong>Spam / Junk</strong> folder.
            </span>
          </p>
          <label className="full-width">
            Verification Code *
            <input required value={otp} onChange={e => setOtp(e.target.value)} disabled={loading} style={{letterSpacing: '0.1em', fontFamily: 'monospace'}} />
          </label>
          {error && <p className="status-message error full-width">{error}</p>}
          <div style={{display: 'flex', gap: '1rem', width: '100%'}}>
            <button type="button" className="button secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
            <button className={loading ? 'button primary is-loading' : 'button primary'} style={{flex: 1}} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="content-panel content-form" onSubmit={handleFinalSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <h3>Step 3: Institution & Application Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <label>Institution Name *<input required value={institutionForm.name} onChange={e => setInstitutionForm({...institutionForm, name: e.target.value})} disabled={loading}/></label>
            <label>Registration/RC Number *<input required value={institutionForm.registrationNumber} onChange={e => setInstitutionForm({...institutionForm, registrationNumber: e.target.value})} disabled={loading}/></label>
            
            <label>
              Institution Type *
              <select required value={institutionForm.institutionType} onChange={e => setInstitutionForm({...institutionForm, institutionType: e.target.value})} disabled={loading}>
                <option value="corporate">Corporate Training Provider</option>
                <option value="vocational">Vocational & Technical Training</option>
                <option value="safety_center">Safety & Compliance Institute</option>
                <option value="higher_education">Higher Education</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>Country *<input required value={institutionForm.country} onChange={e => setInstitutionForm({...institutionForm, country: e.target.value})} disabled={loading}/></label>
            
            <label>Official Email *<input required type="email" value={institutionForm.email} onChange={e => setInstitutionForm({...institutionForm, email: e.target.value})} disabled={loading}/></label>
            <label>Official Phone *<input required value={institutionForm.phone} onChange={e => setInstitutionForm({...institutionForm, phone: e.target.value})} disabled={loading}/></label>
            
            <label className="full-width">Physical Address *<input required value={institutionForm.address} onChange={e => setInstitutionForm({...institutionForm, address: e.target.value})} disabled={loading}/></label>
            <label className="full-width">Company Logo (Optional)<input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} disabled={loading}/></label>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <label className="full-width">
              Training Area Categories (Select all that apply)
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {trainingAreas.map((area) => (
                  <label key={area.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '6px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={applicationForm.trainingAreaIds.includes(area.id)}
                      onChange={() => {
                        setApplicationForm(prev => {
                          const ids = prev.trainingAreaIds.includes(area.id) 
                            ? prev.trainingAreaIds.filter(id => id !== area.id)
                            : [...prev.trainingAreaIds, area.id];
                          return { ...prev, trainingAreaIds: ids };
                        })
                      }}
                      disabled={loading}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      <strong>{area.name}</strong>
                    </span>
                  </label>
                ))}
              </div>
            </label>

            <label>Certificates Offered (Comma separated) *<input required value={applicationForm.certificatesOffered} onChange={e => setApplicationForm({...applicationForm, certificatesOffered: e.target.value})} placeholder="e.g. Web Dev, UI/UX" disabled={loading}/></label>
            <label>Delivery Methods (Comma separated) *<input required value={applicationForm.deliveryMethods} onChange={e => setApplicationForm({...applicationForm, deliveryMethods: e.target.value})} placeholder="e.g. Online, In-person" disabled={loading}/></label>
            <label>Staffing Count (Optional)<input type="number" value={applicationForm.staffingCount} onChange={e => setApplicationForm({...applicationForm, staffingCount: e.target.value})} disabled={loading}/></label>
            <label className="full-width">Operational Information (Optional)<textarea rows={3} value={applicationForm.operationalInfo} onChange={e => setApplicationForm({...applicationForm, operationalInfo: e.target.value})} disabled={loading}/></label>
          </div>

          {error && <p className="status-message error full-width">{error}</p>}
          <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="content-panel content-form" style={{textAlign: 'center', padding: '3rem 1rem'}}>
          <div style={{fontSize: '3rem', color: '#10b981', marginBottom: '1rem'}}>✓</div>
          <h2>Application Submitted Successfully!</h2>
          <p style={{maxWidth: '500px', margin: '1rem auto'}}>
            Your application for CTSDA accreditation is now under review. You will receive updates via email as our team reviews your business information.
          </p>
          <button className="button secondary" onClick={() => router.push('/')} style={{marginTop: '1rem'}}>
            Return to Homepage
          </button>
        </div>
      )}
    </main>
  );
}
