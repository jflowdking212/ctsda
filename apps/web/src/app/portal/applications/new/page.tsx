'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CountrySelect } from '../../../../components/country-select';

interface Institution {
  id: string;
  name: string;
  registrationNumber?: string;
  institutionType?: string;
  country?: string;
}

interface TrainingArea {
  id: string;
  name: string;
  code: string;
  description?: string;
}

const DEFAULT_CTSDA_TRAINING_AREAS = [
  { id: 'cta-1', code: 'LEADERSHIP-MGMT', name: 'Leadership, Governance & Management', description: 'Executive leadership, governance frameworks, and strategic management' },
  { id: 'cta-2', code: 'HR-MGMT', name: 'Human Resource Management', description: 'Talent management, HR operations, and organizational development' },
  { id: 'cta-3', code: 'PROJECT-MGMT', name: 'Project Management', description: 'Project planning, agile methodologies, and program execution' },
  { id: 'cta-4', code: 'FINANCE-PROCURE', name: 'Finance, Accounting & Procurement', description: 'Financial management, corporate accounting, auditing, and procurement' },
  { id: 'cta-5', code: 'BUSINESS-ENTR', name: 'Business & Entrepreneurship', description: 'Business strategy, startup incubation, and commercial development' },
  { id: 'cta-6', code: 'IT-DIGITAL', name: 'Information Technology & Digital Skills', description: 'Software development, cybersecurity, cloud computing, and digital literacy' },
  { id: 'cta-7', code: 'HSE-HEALTH', name: 'Health, Safety & Environment (HSE)', description: 'Occupational health, workplace safety, hazard management, and environmental compliance' },
  { id: 'cta-8', code: 'ENG-TECH', name: 'Engineering & Technical Training', description: 'Industrial engineering, technical trades, automotive, and mechanical operations' },
  { id: 'cta-9', code: 'EDU-TRAIN', name: 'Education & Training', description: 'Pedagogy, instructional design, educator certification, and training methodology' },
  { id: 'cta-10', code: 'RESEARCH-EVAL', name: 'Research, Monitoring & Evaluation', description: 'Data research methodologies, impact assessment, monitoring, and evaluation' },
  { id: 'cta-11', code: 'COMM-SOFT', name: 'Communication & Soft Skills', description: 'Corporate communication, public speaking, negotiation, and interpersonal skills' },
  { id: 'cta-12', code: 'LEGAL-RISK', name: 'Legal, Compliance & Risk Management', description: 'Regulatory compliance, legal frameworks, corporate governance, and risk mitigation' },
];

export default function NewApplicationPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<TrainingArea[]>(DEFAULT_CTSDA_TRAINING_AREAS);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(['cta-1']);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  
  // Institution details form
  const [instForm, setInstForm] = useState({
    name: '',
    registrationNumber: '',
    institutionType: 'corporate',
    country: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    yearEstablished: '',
    contactName: '',
  });

  // Selected existing institution ID
  const [selectedInstId, setSelectedInstId] = useState('');

  // Application details form
  const [appForm, setAppForm] = useState({
    preRegistrationToken: '',
    certificatesOffered: 'Full-Stack Web Development, Frontend Engineering, UI/UX Design, Backend API Development',
    deliveryMethods: 'Online, In-person',
    staffingCount: '15',
    operationalInfo: 'Software engineering, web application development, and tech skills training provider.',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  async function fetchInstitutionsList() {
    try {
      const instRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions`);
      if (instRes.ok) {
        const instData = await instRes.json();
        if (Array.isArray(instData) && instData.length > 0) {
          setInstitutions(instData);
          setSelectedInstId(instData[0].id);
          return instData;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }

  useEffect(() => {
    async function loadData() {
      try {
        await fetchInstitutionsList();

        // Load training areas
        const areaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions/training-areas`);
        if (areaRes.ok) {
          const areaData = await areaRes.json();
          if (Array.isArray(areaData) && areaData.length > 0) {
            setTrainingAreas(areaData);
            // Default select Software Engineering if available
            const soft = areaData.find((a: TrainingArea) => a.code === 'SOFTWARE-ENG');
            if (soft) {
              setSelectedAreaIds([soft.id]);
            } else {
              setSelectedAreaIds([areaData[0].id]);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, []);

  function toggleAreaId(id: string) {
    setSelectedAreaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      let targetInstitutionId = selectedInstId;

      // Step 1: If creating a new institution, register it (or find existing match)
      if (mode === 'new') {
        if (!instForm.name.trim() || !instForm.registrationNumber.trim() || !instForm.email.trim()) {
          setError('Please fill in required Institution fields: Name, Registration Number, and Official Email.');
          setLoading(false);
          return;
        }

        const instResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: instForm.name.trim(),
            registrationNumber: instForm.registrationNumber.trim(),
            institutionType: instForm.institutionType,
            country: instForm.country.trim(),
            address: instForm.address.trim() || 'N/A',
            phone: instForm.phone.trim() || 'N/A',
            email: instForm.email.trim(),
            website: instForm.website.trim() || undefined,
            yearEstablished: instForm.yearEstablished ? parseInt(instForm.yearEstablished) : undefined,
            contacts: [
              {
                fullName: instForm.contactName.trim() || instForm.name.trim(),
                position: 'Director / Representative',
                email: instForm.email.trim(),
                phone: instForm.phone.trim() || 'N/A',
                isPrimary: true,
              },
            ],
          }),
        });

        const instData = await instResponse.json().catch(() => ({}));
        
        if (instResponse.ok) {
          targetInstitutionId = instData.id;
        } else if (instResponse.status === 409) {
          // If institution already exists, retrieve its ID from institutions list automatically
          const updatedList = await fetchInstitutionsList();
          const matched = updatedList.find(
            (i: Institution) =>
              i.name?.toLowerCase() === instForm.name.trim().toLowerCase() ||
              i.registrationNumber === instForm.registrationNumber.trim()
          );
          if (matched) {
            targetInstitutionId = matched.id;
          } else {
            setError('Institution already exists. Please select it from the existing list.');
            setLoading(false);
            return;
          }
        } else {
          setError(instData.error?.message || instData.message || 'Could not register institution.');
          setLoading(false);
          return;
        }
      }

      if (!targetInstitutionId) {
        setError('No valid Institution selected.');
        setLoading(false);
        return;
      }

      // Step 2: Create draft application
      const appResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/institutions/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          institutionId: targetInstitutionId,
          preRegistrationToken: appForm.preRegistrationToken.trim() || undefined,
          trainingAreaIds: selectedAreaIds,
          certificatesOffered: appForm.certificatesOffered ? appForm.certificatesOffered.split(',').map((item) => item.trim()).filter(Boolean) : ['Certificate of Completion'],
          deliveryMethods: appForm.deliveryMethods ? appForm.deliveryMethods.split(',').map((item) => item.trim()).filter(Boolean) : ['Online'],
          staffingCount: appForm.staffingCount ? Number(appForm.staffingCount) : undefined,
          operationalInfo: appForm.operationalInfo.trim() || undefined,
        }),
      });

      const appData = await appResponse.json().catch(() => ({}));
      if (!appResponse.ok) {
        setError(appData.error?.message || appData.message || 'Could not create application. Please verify details.');
        setLoading(false);
        return;
      }

      setMessage(`Draft application created successfully for ${instForm.name || 'your institution'}! Application ID: ${appData.id}. Redirecting to dashboard...`);
      setTimeout(() => {
        router.push('/portal/applications');
      }, 2000);
    } catch {
      setError('Service is temporarily unreachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <p className="eyebrow">Accreditation</p>
        <h1>Start Draft Application</h1>
        <p>Register your institution and provide operational details to begin accreditation review.</p>
      </header>

      <form className="content-panel content-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* MODE SELECTOR */}
        <div className="full-width" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle, #f8f9fa)', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem', marginTop: 0 }}>Institution Selection</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="radio"
                name="mode"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
                disabled={loading}
              />
              <span><strong>+ Register a New Institution</strong> (e.g. Jay Bliss Tech)</span>
            </label>
            {institutions.length > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'existing'}
                  onChange={() => setMode('existing')}
                  disabled={loading}
                />
                <span><strong>Select Existing Registered Institution</strong></span>
              </label>
            )}
          </div>
        </div>

        {/* SECTION 1: INSTITUTION DETAILS */}
        {mode === 'new' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <h3 className="full-width" style={{ margin: '0.5rem 0 0', color: 'var(--color-primary, #0f172a)' }}>1. Institution Profile</h3>
            
            <label>
              Institution / Company Name *
              <input
                value={instForm.name}
                onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                placeholder="e.g. Jay Bliss Tech"
                required
                disabled={loading}
              />
            </label>

            <label>
              Company Registration No/LLC/LTD/CIN etc *
              <input
                value={instForm.registrationNumber}
                onChange={(e) => setInstForm({ ...instForm, registrationNumber: e.target.value })}
                placeholder="e.g. RC-1029384, LLC-482, CIN-9821"
                required
                disabled={loading}
              />
            </label>

            <label>
              Institution Type
              <select
                value={instForm.institutionType}
                onChange={(e) => setInstForm({ ...instForm, institutionType: e.target.value })}
                disabled={loading}
              >
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
            </label>

            <label style={{ display: 'block' }}>
              Country *
              <CountrySelect
                value={instForm.country}
                onChange={(val) => setInstForm({ ...instForm, country: val })}
                disabled={loading}
                required
              />
            </label>

            <label>
              Official Email Address *
              <input
                type="email"
                value={instForm.email}
                onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                placeholder="e.g. info@jayblisstech.com"
                required
                disabled={loading}
              />
            </label>

            <label>
              Phone Number
              <input
                value={instForm.phone}
                onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                placeholder="e.g. +234 803 396 5904"
                disabled={loading}
              />
            </label>

            <label className="full-width">
              Physical Address
              <input
                value={instForm.address}
                onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                placeholder="e.g. Commercial Avenue, Lagos"
                disabled={loading}
              />
            </label>

            <label>
              Official Website
              <input
                type="url"
                value={instForm.website}
                onChange={(e) => setInstForm({ ...instForm, website: e.target.value })}
                placeholder="e.g. https://www.jayblisstech.com"
                disabled={loading}
              />
            </label>

            <label>
              Year Established
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={instForm.yearEstablished}
                onChange={(e) => setInstForm({ ...instForm, yearEstablished: e.target.value })}
                placeholder="e.g. 2015"
                disabled={loading}
              />
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ margin: '0.5rem 0 0', color: 'var(--color-primary, #0f172a)' }}>1. Select Institution</h3>
            <label>
              Choose Institution
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                disabled={loading || fetchingData}
                required
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.institutionType || 'Institution'}) — {inst.country || 'N/A'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '0.5rem 0' }} />

        {/* SECTION 2: APPLICATION DETAILS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <h3 className="full-width" style={{ margin: '0.5rem 0 0', color: 'var(--color-primary, #0f172a)' }}>2. Accreditation & Training Details</h3>

          <label className="full-width">
            Training Area Categories (Select all that apply)
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {trainingAreas.map((area) => (
                <label key={area.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '6px', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={selectedAreaIds.includes(area.id)}
                    onChange={() => toggleAreaId(area.id)}
                    disabled={loading}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <strong>{area.name}</strong>
                    {area.description && <small style={{ display: 'block', color: '#64748b' }}>{area.description}</small>}
                  </span>
                </label>
              ))}
            </div>
          </label>

          <label>
            Certificates Offered (Comma separated)
            <input
              value={appForm.certificatesOffered}
              onChange={(e) => setAppForm({ ...appForm, certificatesOffered: e.target.value })}
              placeholder="e.g. Full-Stack Web Development, Frontend Engineering, UI/UX Design"
              required
              disabled={loading}
            />
          </label>

          <label>
            Delivery Methods (Comma separated)
            <input
              value={appForm.deliveryMethods}
              onChange={(e) => setAppForm({ ...appForm, deliveryMethods: e.target.value })}
              placeholder="e.g. Online, In-person, Hybrid"
              required
              disabled={loading}
            />
          </label>

          <label>
            Staffing / Trainer Count
            <input
              value={appForm.staffingCount}
              onChange={(e) => setAppForm({ ...appForm, staffingCount: e.target.value })}
              placeholder="e.g. 15"
              type="number"
              disabled={loading}
            />
          </label>

          <label>
            Pre-registration Token (Optional)
            <input
              value={appForm.preRegistrationToken}
              onChange={(e) => setAppForm({ ...appForm, preRegistrationToken: e.target.value })}
              placeholder="Leave empty if you don't have one"
              disabled={loading}
            />
          </label>

          <label className="full-width">
            Operational Information
            <textarea
              value={appForm.operationalInfo}
              onChange={(e) => setAppForm({ ...appForm, operationalInfo: e.target.value })}
              placeholder="Provide a brief overview of your software training programs, lab infrastructure, and operations..."
              rows={4}
              disabled={loading}
            />
          </label>
        </div>

        {error && <p className="status-message error full-width">{error}</p>}
        {message && <p className="status-message success full-width">{message}</p>}

        <button className={loading ? 'button primary full-width is-loading' : 'button primary full-width'} type="submit" disabled={loading}>
          {loading ? 'Processing draft...' : 'Create & Start Draft Application'}
        </button>
      </form>
    </main>
  );
}
