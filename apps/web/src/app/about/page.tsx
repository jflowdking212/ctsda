import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'About CTSDA | Educational Accreditation Body',
  description: 'Empowering educational excellence through comprehensive accreditation services since 2010.',
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

export default async function AboutPage() {
  const settings = await getSettings();

  const heroSubtitle = settings.aboutHeroSubtitle || 'Empowering educational excellence through comprehensive accreditation services since 2010.';
  const missionText = settings.aboutMissionText || 'The Council For Training Skills and Development America (CTSDA) is dedicated to advancing excellence in education and training through comprehensive accreditation services. We strive to empower institutions, trainers and educational service providers to deliver high-quality programs that meet the evolving needs of learners and industries.';
  const visionText = settings.aboutVisionText || 'We envision a world where every learner has access to quality education and training, fostering personal growth, professional development, and societal progress. CTSDA aims to be the leading accreditation body, setting the gold standard for educational excellence and innovation.';

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

        {/* 1. HERO BANNER - Exact Contact Hero Gradient */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '4.75rem 1.5rem 4rem',
          }}
        >
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '0.75rem',
                lineHeight: 1.15,
              }}
            >
              About CTSDA
            </h1>
            <p
              style={{
                fontSize: '1.2rem',
                color: '#e2e8f0',
                maxWidth: '700px',
                lineHeight: 1.6,
                fontWeight: 400,
                margin: 0,
              }}
            >
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* 2. OUR MISSION */}
        <section style={{ backgroundColor: '#ffffff', padding: 'clamp(2.5rem, 5vw, 4.5rem) 1rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                  Our Mission
                </h2>
                <p style={{ fontSize: '1.025rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  {missionText}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    'Ensuring quality education frameworks',
                    'Supporting continuous improvement',
                    'Fostering innovation in education',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Logo Frame & Badge */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '1.25rem',
                    padding: '2.5rem 3rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '420px',
                  }}
                >
                  <img
                    src="/images/logo-ctsda.png"
                    alt="CTSDA Seal"
                    style={{ width: '100%', maxWidth: '240px', height: 'auto', objectFit: 'contain' }}
                  />
                </div>

                {/* Floating 13+ Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1.25rem',
                    left: '2rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.85rem 1.35rem',
                    borderRadius: '0.85rem',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.1 }}>13+</div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
                    Years of Excellence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. OUR VISION */}
        <section style={{ backgroundColor: '#f8fafc', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Our Vision
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.75, margin: 0 }}>
                {visionText}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  title: 'Global Reach',
                  text: 'Expanding our impact worldwide',
                  icon: (
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  ),
                },
                {
                  title: 'Continuous Growth',
                  text: 'Empowering institutions to thrive',
                  icon: (
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                },
                {
                  title: 'Strong Partnerships',
                  text: 'Building lasting relationships',
                  icon: (
                    <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '1.25rem',
                    padding: '2.25rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. OUR VALUES */}
        <section style={{ backgroundColor: '#ffffff', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                Our Values
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {[
                {
                  title: 'Integrity',
                  text: 'Maintaining the highest standards of integrity in all our accreditation processes',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0110 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: 'Continuous Improvement',
                  text: 'Commitment to continuous improvement in our methodologies and services',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                },
                {
                  title: 'Collaboration',
                  text: 'Working closely with educational institutions and industry partners',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Innovation',
                  text: 'Pioneering new approaches in accreditation methodologies',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                },
                {
                  title: 'Transparency',
                  text: 'Maintaining transparency in our operations and decision making',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                },
                {
                  title: 'Excellence',
                  text: 'Striving for excellence in everything we do',
                  icon: (
                    <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                },
              ].map((value) => (
                <div
                  key={value.title}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '2.75rem',
                      height: '2.75rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {value.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {value.title}
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. OUR IMPACT (Dark Navy Section with Trainee Image & 4 Stats) */}
        <section style={{ backgroundColor: '#0b172a', color: '#ffffff', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
                  Our Impact
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                  Since our inception, CTSDA has accredited over 500 institutions and 1,000 programs across the United States. Our rigorous accreditation process has helped improve educational standards, enhance student outcomes, and bridge the gap between education and industry needs.
                </p>

                {/* 2x2 Stat Counters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.75rem' }}>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      500+
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                      Institutions Accredited
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      1000+
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                      Programs Certified
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      50+
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                      States Represented
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                      95%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                      Satisfaction Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainee Image Frame */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    borderRadius: '1.25rem',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxWidth: '480px',
                    width: '100%',
                  }}
                >
                  <img
                    src="/images/hero_professional_trainee.png"
                    alt="CTSDA Accredited Trainee"
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. JOIN OUR NETWORK (CTA Band with Contact Gradient) */}
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
              Join Our Network
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: 1.65, marginBottom: '2.25rem' }}>
              Become part of our growing network of accredited institutions and programs. Enhance your credibility, attract more students, and contribute to the advancement of education and training standards.
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
                Apply Now
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
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </main>
    </PublicPage>
  );
}
