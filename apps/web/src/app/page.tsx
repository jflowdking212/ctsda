import Link from 'next/link';
import { CertificateVerifier } from '../components/certificate-verifier';
import { PublicFooter } from '../components/public-shell';
import { PremiumHeader } from '../components/premium-header';
import { AccreditedLogosCarousel } from '../components/accredited-logos-carousel';

export default function Home() {
  return (
    <div className="public-page">
      {/* Premium Header */}
      <PremiumHeader />

      <main>
        {/* Hero Section - Premium Redesign */}
        <section className="home-hero">
          {/* Animated Particles Background */}
          <div className="hero-particles">
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
            <span className="particle" />
          </div>
          
          <div className="container relative z-10">
            <div className="hero-content">
              {/* Badge with explicit WHITE text */}
              <span
                className="hero-badge"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  marginBottom: '1.25rem',
                }}
              >
                <svg className="hero-badge-icon" style={{ color: '#fbbf24', width: '1.1rem', height: '1.1rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0110 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem' }}>
                  Setting Global Standards in Education
                </span>
              </span>
              
              <h1 className="hero-title" style={{ color: '#ffffff', fontWeight: 800 }}>
                Council for Training Skills and Development America (CTSDA)
              </h1>
              
              <p className="hero-description" style={{ color: '#cbd5e1' }}>
                The Council for Training, Skills, and Development, America (CTSDA) is a leading American accreditation body, renowned for providing comprehensive accreditation services to institutions, trainers, and educational and training service providers.
              </p>
              <p className="hero-description text-sm opacity-90 mt-3" style={{ color: '#e2e8f0' }}>
                By gaining CTSDA accreditation, you can strengthen your professional skills, enhance your reputation, and bolster your professional practice.
              </p>
              
              <div className="hero-actions">
                <Link className="button primary" href="/apply" style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700 }}>
                  Start Accreditation Process
                </Link>
                <Link className="button secondary" href="/verify" style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  Verify Certificate
                </Link>
              </div>
            </div>
            
            {/* Floating Hero Cards - Visual Enhancement */}
            <div className="hero-cards">
              <div className="hero-card">
                <svg className="hero-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.692A3.001 3.001 0 004 7.97v8.05a3 3 0 003.807 2.807 9.002 9.002 0 016.331-5.197V7.97a3 3 0 00-3.807-2.807 9.002 9.002 0 01-6.331 5.197z" />
                </svg>
                <h3>Global Recognition</h3>
                <p>2500+ Accredited Institutions</p>
              </div>
              <div className="hero-card">
                <svg className="hero-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 0v3M8 8v13m-4-6h16M3 3h18v18H3z" />
                </svg>
                <h3>Satisfaction Rate</h3>
                <p>95% Client Retention</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certificate Verification */}
        <section className="home-verify-section" aria-labelledby="home-verify-title">
          <div className="container">
            <div className="home-verify-panel">
              <div>
                <p className="eyebrow">Public verification</p>
                <h2 id="home-verify-title">Verify a Certificate</h2>
                <p>
                  Enter a CTSDA certificate token to confirm accreditation status and certificate
                  details.
                </p>
              </div>
              <CertificateVerifier compact />
            </div>
          </div>
        </section>

        {/* Stats Band - Enhanced */}
        <section className="stats-band" aria-label="CTSDA impact">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">2,500+</div>
                <div className="stat-label">Accredited Institutions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">150+</div>
                <div className="stat-label">Countries Reached</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">30K+</div>
                <div className="stat-label">Programs Verified</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">95%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Executive Redesign */}
        <section className="section" style={{ backgroundColor: '#f8fafc', padding: '6rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background glow circle */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }}></div>

          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3rem', alignItems: 'center' }}>
              
              {/* Left Column: Heading & Value Proposition */}
              <div style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 5' } } as any} className="lg:col-span-5">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.85rem', borderRadius: '50px', marginBottom: '1.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Why Institutions Choose CTSDA
                  </span>
                </div>
                
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                  Accreditation that reads as <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>rigorous</span>, transparent, and globally useful.
                </h2>
                
                <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                  Our international quality framework empowers educational academies, universities, and specialized training providers with instant global credibility and tamper-proof verification.
                </p>

                {/* Quick Trust Highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.25rem' }}>
                  {[
                    '100% Verifiable Digital Credentials & QR Codes',
                    'Comprehensive Governance & Quality Audits',
                    'Recognized Across International Jurisdictions'
                  ].map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.925rem', fontWeight: 600, color: '#1e293b' }}>{point}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/accreditation-info"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    backgroundColor: '#00204a',
                    color: '#ffffff',
                    padding: '0.85rem 1.65rem',
                    borderRadius: '0.625rem',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0, 32, 74, 0.2)',
                    transition: 'transform 0.2s, background-color 0.2s',
                  }}
                >
                  Explore Framework
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>

              {/* Right Column: 2x2 Feature Cards Grid */}
              <div style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 7' } } as any} className="lg:col-span-7">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { 
                      title: 'Global Recognition', 
                      text: 'Support international collaboration, student mobility, and stronger institutional positioning across international markets.',
                      badge: 'Global Mobility',
                      bg: '#eff6ff',
                      iconColor: '#2563eb',
                      borderColor: '#dbeafe',
                      iconSvg: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      )
                    },
                    { 
                      title: 'Rigorous Standards', 
                      text: 'Evaluate governance, curriculum, faculty qualifications, learner support, and measurable educational outcomes.',
                      badge: 'Quality Audit',
                      bg: '#ecfdf5',
                      iconColor: '#059669',
                      borderColor: '#a7f3d0',
                      iconSvg: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      )
                    },
                    { 
                      title: 'Expert Support', 
                      text: 'Guide teams step-by-step through documentation, self-assessment readiness, and continuous quality improvement.',
                      badge: 'Dedicated Mentorship',
                      bg: '#fffbeb',
                      iconColor: '#d97706',
                      borderColor: '#fde68a',
                      iconSvg: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                      )
                    },
                    { 
                      title: 'Public Verification', 
                      text: 'Give students, employers, and regulatory partners a direct, real-time way to confirm active accreditation status.',
                      badge: 'Instant Lookup',
                      bg: '#eef2ff',
                      iconColor: '#4f46e5',
                      borderColor: '#c7d2fe',
                      iconSvg: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          <path d="m9 12 2 2 4-4"></path>
                        </svg>
                      )
                    },
                  ].map((feature) => (
                    <article
                      key={feature.title}
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '1.85rem 1.65rem',
                        borderRadius: '1rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      className="executive-feature-card"
                    >
                      {/* Top Accent Line */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: feature.iconColor, opacity: 0.85 }}></div>

                      <div>
                        {/* Icon Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '12px',
                              backgroundColor: feature.bg,
                              color: feature.iconColor,
                              border: `1px solid ${feature.borderColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 10px rgba(0,0,0,0.03)`
                            }}
                          >
                            {feature.iconSvg}
                          </div>
                          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: feature.iconColor, backgroundColor: feature.bg, padding: '0.2rem 0.6rem', borderRadius: '50px', border: `1px solid ${feature.borderColor}` }}>
                            {feature.badge}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.175rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>
                          {feature.title}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
                          {feature.text}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Process Section - Enhanced */}
        <section className="process-section">
          <div className="container">
            <div className="text-center mb-16">
              <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm mb-4">Accreditation pathway</p>
              <h2 className="section-title">A clear route from application to recognized status.</h2>
            </div>
            <div className="process-grid">
              {[
                { step: '01', title: 'Application', text: 'Submit institutional profile and initial documentation.' },
                { step: '02', title: 'Self-Assessment', text: 'Complete a structured quality and readiness review.' },
                { step: '03', title: 'Evaluation', text: 'Proceed through expert assessment and site review where required.' },
                { step: '04', title: 'Decision', text: 'Receive accreditation outcome, guidance, and public listing.' },
              ].map((item) => (
                <article className="process-card" key={item.title}>
                  <span className="process-number" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 800 }}>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Services Preview - Premium Redesign */}
        <section className="services-preview">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div>
                <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm mb-4">Services</p>
                <h2 className="section-title">Built for institutions, programs, trainers, and continuing education providers.</h2>
                <Link className="text-link inline-flex items-center gap-2 mt-6" href="/services">
                  View all services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="service-list">
                {[
                  'Institution Accreditation',
                  'Program Accreditation',
                  'Continuing Education Accreditation',
                  'Accreditation Consulting',
                ].map((service) => (
                  <div className="service-item" key={service}>
                    <svg className="service-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="service-item-text">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Band Before Footer - Enhanced with Old Services Picture (girl_eng.jpeg) */}
        <section className="cta-band" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff', padding: '4.5rem 1.5rem' }}>
          <div className="container" style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <p className="font-semibold uppercase tracking-wider text-sm mb-3" style={{ color: '#fbbf24' }}>Start with confidence</p>
                <h2 className="cta-title" style={{ color: '#ffffff', fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', lineHeight: 1.2, marginBottom: '1rem' }}>
                  Join institutions worldwide using CTSDA to demonstrate quality.
                </h2>
                <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Start your accreditation journey with CTSDA today and join our network of excellence in education.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link className="cta-button primary" href="/apply" style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, padding: '0.875rem 1.75rem', borderRadius: '0.625rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)' }}>
                    Apply Now
                  </Link>
                  <Link className="cta-button outline" href="/contact" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1.5px solid rgba(255, 255, 255, 0.7)', color: '#ffffff', fontWeight: 700, padding: '0.875rem 1.75rem', borderRadius: '0.625rem', textDecoration: 'none' }}>
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Replicated Graduate Image Card from old Services page */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)', maxWidth: '440px', width: '100%' }}>
                  <img src="/images/girl_eng.jpeg" alt="CTSDA Accredited Graduate" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Accredited Institutions Logo Carousel */}
        <AccreditedLogosCarousel />
      </main>

      <PublicFooter />
    </div>
  );
}
