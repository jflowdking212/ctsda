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

        {/* Features Section - Premium Redesign */}
        <section className="section">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5">
                <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm mb-4">Why institutions choose CTSDA</p>
                <h2 className="section-title">Accreditation that reads as rigorous, transparent, and globally useful.</h2>
              </div>
              <div className="feature-grid lg:col-span-7">
                {[
                  { 
                    title: 'Global Recognition', 
                    text: 'Support international collaboration, student mobility, and stronger institutional positioning.',
                    icon: '🌐'
                  },
                  { 
                    title: 'Rigorous Standards', 
                    text: 'Evaluate governance, curriculum, faculty qualifications, learner support, and outcomes.',
                    icon: '📊'
                  },
                  { 
                    title: 'Expert Support', 
                    text: 'Guide teams through documentation, assessment readiness, and continuous improvement.',
                    icon: '🎓'
                  },
                  { 
                    title: 'Public Verification', 
                    text: 'Give students, employers, and partners a direct way to confirm active accreditation status.',
                    icon: '✅'
                  },
                ].map((feature) => (
                  <article className="feature-card" key={feature.title}>
                    <span className="feature-card-icon">{feature.icon}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </article>
                ))}
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
