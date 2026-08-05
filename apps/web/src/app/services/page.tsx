import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Our Services | CTSDA Accreditation & Quality Evaluation',
  description: 'Comprehensive accreditation solutions designed to elevate educational standards and ensure excellence in learning.',
};

async function getSettings() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/settings/public`, { next: { revalidate: 30 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function ServicesPage() {
  const settings = await getSettings();
  const heroSubtitle = settings.servicesHeroSubtitle || 'Comprehensive accreditation solutions designed to elevate educational standards and ensure excellence in learning.';

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* 1. HERO BANNER - Contact Hero Gradient & Centered Text */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '5rem 1.5rem 4.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fbbf24',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
              }}
            >
              CTSDA Services
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.15,
                textAlign: 'center',
                width: '100%',
              }}
            >
              Our Services
            </h1>
            <p
              style={{
                fontSize: '1.2rem',
                color: '#cbd5e1',
                maxWidth: '680px',
                lineHeight: 1.6,
                fontWeight: 400,
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* 2. MAIN SERVICES GRID (2x2 Grid) */}
        <section style={{ backgroundColor: '#ffffff', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
              
              {/* Institution Accreditation */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.25rem',
                  padding: '2.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0-4h.01M9 11h.01M15 11h.01M15 7h.01M9 7h.01M9 15h.01M15 15h.01" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Institution Accreditation
                  </h3>
                  <p style={{ fontSize: '0.975rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    Comprehensive evaluation of educational institutions to ensure they meet CTSDA's rigorous standards for quality education and administration.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      "Thorough review of institution's mission and governance",
                      "Assessment of faculty qualifications and resources",
                      "Evaluation of student outcomes and support services",
                    ].map((bullet) => (
                      <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '0.15rem' }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.925rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Link href="/apply" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.975rem' }}>
                    Learn More →
                  </Link>
                </div>
              </div>

              {/* Program Accreditation */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.25rem',
                  padding: '2.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Program Accreditation
                  </h3>
                  <p style={{ fontSize: '0.975rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    In-depth assessment of specific educational programs to verify their alignment with industry standards and educational best practices.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      "Curriculum design and learning outcomes evaluation",
                      "Faculty qualifications assessment",
                      "Student support services review",
                    ].map((bullet) => (
                      <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '0.15rem' }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.925rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Link href="/apply" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.975rem' }}>
                    Learn More →
                  </Link>
                </div>
              </div>

              {/* Continuing Education Accreditation */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.25rem',
                  padding: '2.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Continuing Education Accreditation
                  </h3>
                  <p style={{ fontSize: '0.975rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    Evaluation and accreditation of professional development and continuing education programs to ensure they meet the evolving needs of various industries.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      "Program relevance assessment",
                      "Instructional methods evaluation",
                      "Learning outcomes measurement",
                    ].map((bullet) => (
                      <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '0.15rem' }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.925rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Link href="/apply" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.975rem' }}>
                    Learn More →
                  </Link>
                </div>
              </div>

              {/* Accreditation Consulting */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.25rem',
                  padding: '2.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Accreditation Consulting
                  </h3>
                  <p style={{ fontSize: '0.975rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    Expert guidance and support for institutions and programs seeking to navigate the accreditation process successfully.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      "Gap analysis and strategic planning",
                      "Documentation review and preparation",
                      "Personalized guidance and support",
                    ].map((bullet) => (
                      <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '0.15rem' }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.925rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Link href="/contact" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.975rem' }}>
                    Learn More →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. OUR ACCREDITATION PROCESS (5 Step Horizon) */}
        <section style={{ backgroundColor: '#f8fafc', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                Our Accreditation Process
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
              {[
                {
                  step: 'Application',
                  desc: 'Submit initial documentation',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
                {
                  step: 'Review',
                  desc: 'Initial assessment',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                },
                {
                  step: 'Evaluation',
                  desc: 'On-site visit',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  step: 'Feedback',
                  desc: 'Recommendations',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                },
                {
                  step: 'Accreditation',
                  desc: 'Final decision',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {item.step}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. BENEFITS OF CTSDA ACCREDITATION - Exact Replica with Blue SVGs & Graduate Picture */}
        <section style={{ backgroundColor: '#ffffff', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>
                  Benefits of CTSDA Accreditation
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {/* Benefit 1 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <svg style={{ width: '22px', height: '22px', color: '#2563eb' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                        Enhanced Credibility
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
                        Gain recognition as a quality education provider
                      </p>
                    </div>
                  </div>

                  {/* Benefit 2 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <svg style={{ width: '22px', height: '22px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                        Global Recognition
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
                        Access international opportunities and partnerships
                      </p>
                    </div>
                  </div>

                  {/* Benefit 3 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <svg style={{ width: '22px', height: '22px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                        Student Confidence
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
                        Attract more students with validated quality
                      </p>
                    </div>
                  </div>

                  {/* Benefit 4 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <svg style={{ width: '22px', height: '22px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                        Continuous Improvement
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
                        Regular feedback for ongoing development
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Exact Old Graduate Picture Card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e2e8f0',
                    maxWidth: '520px',
                    width: '100%',
                  }}
                >
                  <img
                    src="/images/girl_grad_happy.jpeg"
                    alt="CTSDA Accredited Graduate"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. JOIN OUR NETWORK (CTA Band) */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              Ready to elevate your educational standards?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: 1.65, marginBottom: '2.25rem' }}>
              Start your accreditation journey with CTSDA today and join our network of excellence in education.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/apply"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.9rem 2rem',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }}
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.9rem 2rem',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

      </main>
    </PublicPage>
  );
}
