import Link from 'next/link';
import { PublicFooter } from '../components/public-shell';
import { PremiumHeader } from '../components/premium-header';
import { AccreditedLogosCarousel } from '../components/accredited-logos-carousel';

export default function Home() {
  return (
    <div className="public-page">
      {/* Premium Header */}
      <PremiumHeader />

      <main>
        {/* Hero Section - Executive 2-Column Redesign */}
        <section
          style={{
            position: 'relative',
            minHeight: '85vh',
            backgroundColor: '#021a42',
            backgroundImage: 'linear-gradient(135deg, rgba(2, 26, 66, 0.95) 0%, rgba(2, 26, 66, 0.88) 50%, rgba(2, 26, 66, 0.65) 100%), url("/images/hero_professional_trainee.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            padding: '5rem 0',
            overflow: 'hidden',
          }}
        >
          <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem', width: '100%', position: 'relative', zIndex: 10 }}>
            {/* Responsive Hero Grid: 1 col on mobile, 12 cols on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column (7 cols on desktop): Hero Copy & Primary CTAs */}
              <div className="col-span-1 lg:col-span-7">
                
                {/* Top Pill Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '0.45rem 1.1rem', borderRadius: '50px', backdropFilter: 'blur(10px)', marginBottom: '1.5rem' }}>
                  <svg style={{ color: '#fbbf24', width: '1.1rem', height: '1.1rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0110 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Official International Accreditation Body
                  </span>
                </div>

                {/* Main Headline */}
                <h1 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.25rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                  Council For Training Skills &amp; Development America <span style={{ color: '#60a5fa' }}>(CTSDA)</span>
                </h1>

                {/* Subtitle / Value Statement */}
                <p style={{ fontSize: '1.125rem', color: '#cbd5e1', lineHeight: 1.65, maxWidth: '640px', marginBottom: '2rem', fontWeight: 400 }}>
                  Empowering global education and workforce training providers with rigorous quality standards, international recognition, and 100% verifiable digital credentials.
                </p>

                {/* CTAs Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <Link
                    href="/apply"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.95rem 1.85rem',
                      borderRadius: '0.625rem',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Start Accreditation Process
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>

                  <Link
                    href="/verify"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1.5px solid rgba(255, 255, 255, 0.3)',
                      padding: '0.95rem 1.65rem',
                      borderRadius: '0.625rem',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      textDecoration: 'none',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Verify Certificate
                  </Link>
                </div>

                {/* Trust Pill Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    150+ Countries Reached
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    2,500+ Accredited Institutions
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    95% Satisfaction Rate
                  </div>
                </div>

              </div>

              {/* Right Column: Accreditation Framework Showcase Card */}
              <div className="col-span-1 lg:col-span-5 w-full">
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a'
                }}>
                  {/* Card Header Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb', boxShadow: '0 0 8px #2563eb' }}></span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Accreditation Framework
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '1rem' }}>
                      ISO Aligned
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Global Quality Benchmark
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                    CTSDA sets international standards for vocational, technical, and executive training providers worldwide.
                  </p>

                  {/* 3 Core Pillar Item Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>🛡️</span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Institutional Quality Audit</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Rigorously evaluated curriculum &amp; faculty standards</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>🌐</span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight 700, color: '#0f172a' }}>Cross-Border Recognition</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Accepted across 150+ countries worldwide</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>📜</span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Verifiable Digital Credentials</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>100% tamper-proof digital certificates &amp; QR validation</div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: '#eff6ff', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>2,500+</div>
                      <div style={{ fontSize: '0.725rem', color: '#1e40af', fontWeight: 700 }}>Accredited Institutions</div>
                    </div>
                    <div style={{ backgroundColor: '#ecfdf5', padding: '0.85rem', borderRadius: '0.625rem', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>95%</div>
                      <div style={{ fontSize: '0.725rem', color: '#065f46', fontWeight: 700 }}>Satisfaction Rate</div>
                    </div>
                  </div>

                </div>
              </div>

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
            {/* Responsive Feature Grid: 1 col on mobile, 12 cols on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column (5 cols on desktop): Heading & Value Proposition */}
              <div className="col-span-1 lg:col-span-5">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.85rem', borderRadius: '50px', marginBottom: '1.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Why Institutions Choose CTSDA
                  </span>
                </div>
                
                <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
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

              {/* Right Column (7 cols on desktop): 2x2 Feature Cards Grid */}
              <div className="col-span-1 lg:col-span-7 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
