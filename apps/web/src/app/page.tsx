import Link from 'next/link';
import { PublicFooter, PublicHeader } from '../components/public-shell';

export default function Home() {
  return (
    <div className="public-page">
      <PublicHeader />

      <main>
        <section className="home-hero">
          <div className="hero-overlay" />
          <div className="section-inner hero-content">
            <p className="eyebrow">Council for Training, Skills & Development America</p>
            <h1>Setting Global Standards in Education Excellence</h1>
            <p className="hero-lede">
              CTSDA provides comprehensive accreditation services for institutions, trainers, and
              educational service providers ready to demonstrate quality, accountability, and
              international readiness.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/portal/register">
                Start Accreditation
              </Link>
              <Link className="button secondary" href="/verify">
                Verify Certificate
              </Link>
            </div>
          </div>
        </section>

        <section className="stats-band" aria-label="CTSDA impact">
          <div className="section-inner stats-grid">
            {[
              ['2500+', 'Accredited Institutions'],
              ['150+', 'Countries Reached'],
              ['30K+', 'Programs Verified'],
              ['95%', 'Satisfaction Rate'],
            ].map(([value, label]) => (
              <div className="stat-item" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-inner split">
            <div>
              <p className="eyebrow">Why institutions choose CTSDA</p>
              <h2>Accreditation that reads as rigorous, transparent, and globally useful.</h2>
            </div>
            <div className="feature-grid">
              {[
                [
                  'Global Recognition',
                  'Support international collaboration, student mobility, and stronger institutional positioning.',
                ],
                [
                  'Rigorous Standards',
                  'Evaluate governance, curriculum, faculty qualifications, learner support, and outcomes.',
                ],
                [
                  'Expert Support',
                  'Guide teams through documentation, assessment readiness, and continuous improvement.',
                ],
                [
                  'Public Verification',
                  'Give students, employers, and partners a direct way to confirm active accreditation status.',
                ],
              ].map(([title, text]) => (
                <article className="feature-card" key={title}>
                  <span className="feature-dot" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Accreditation pathway</p>
              <h2>A clear route from application to recognized status.</h2>
            </div>
            <div className="process-grid">
              {[
                ['01', 'Application', 'Submit institutional profile and initial documentation.'],
                ['02', 'Self-Assessment', 'Complete a structured quality and readiness review.'],
                ['03', 'Evaluation', 'Proceed through expert assessment and site review where required.'],
                ['04', 'Decision', 'Receive accreditation outcome, guidance, and public listing.'],
              ].map(([step, title, text]) => (
                <article className="process-card" key={title}>
                  <span>{step}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section services-preview">
          <div className="section-inner split">
            <div>
              <p className="eyebrow">Services</p>
              <h2>Built for institutions, programs, trainers, and continuing education providers.</h2>
              <Link className="text-link" href="/services">
                View all services
              </Link>
            </div>
            <div className="service-list">
              <p>Institution Accreditation</p>
              <p>Program Accreditation</p>
              <p>Continuing Education Accreditation</p>
              <p>Accreditation Consulting</p>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="section-inner cta-content">
            <div>
              <p className="eyebrow">Start with confidence</p>
              <h2>Join institutions worldwide using CTSDA to demonstrate quality.</h2>
            </div>
            <div className="hero-actions">
              <Link className="button primary" href="/portal/register">
                Apply Now
              </Link>
              <Link className="button outline" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
