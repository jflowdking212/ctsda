import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'About CTSDA',
  description: 'Learn about CTSDA and our international accreditation mission',
};

export default function AboutPage() {
  return (
    <PublicPage>
      <main>
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container-narrow">
            <p className="eyebrow">About CTSDA</p>
            <h1>A private, independent accreditation body for modern education providers.</h1>
            <div className="page-hero-copy">
              <p>
                CTSDA evaluates institutions and programs against structured standards for quality,
                governance, learner support, curriculum delivery, and continuous improvement.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div>
                <p className="text-emerald-600 font-semibold uppercase tracking-wider text-sm mb-4">Our mission</p>
                <h2 className="section-title">Advancing educational excellence through rigorous, transparent accreditation.</h2>
                <p className="section-description mt-6">
                  We believe in the power of education to transform lives and communities. Our mission is to 
                  provide credible, internationally recognized accreditation services that help institutions 
                  demonstrate their commitment to quality and continuous improvement.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: '2500+', label: 'Institutions Accredited' },
                  { value: '150+', label: 'Countries Reached' },
                  { value: '30K+', label: 'Programs Verified' },
                  { value: '95%', label: 'Client Satisfaction' },
                ].map((stat) => (
                  <div className="text-center p-6 bg-white rounded-xl border border-line" key={stat.label}>
                    <div className="text-3xl font-bold text-navy mb-2">{stat.value}</div>
                    <div className="text-sm text-muted uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="process-section">
          <div className="container">
            <div className="text-center mb-16">
              <p className="text-emerald-600 font-semibold uppercase tracking-wider text-sm mb-4">Our values</p>
              <h2 className="section-title">The principles that guide our work</h2>
            </div>
            <div className="feature-grid">
              {[
                { 
                  title: 'Excellence', 
                  text: 'We maintain the highest standards in all our accreditation processes, ensuring quality and rigor.',
                  icon: '⭐'
                },
                { 
                  title: 'Transparency', 
                  text: 'Our processes are open, fair, and clearly communicated to all stakeholders.',
                  icon: '🔍'
                },
                { 
                  title: 'Integrity', 
                  text: 'We operate independently and ethically, maintaining trust in all our evaluations.',
                  icon: '🛡️'
                },
                { 
                  title: 'Impact', 
                  text: 'We focus on outcomes that matter for students, institutions, and society.',
                  icon: '🎯'
                },
              ].map((value) => (
                <article className="feature-card" key={value.title}>
                  <span className="feature-card-icon">{value.icon}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-band">
          <div className="container">
            <div className="cta-content">
              <div>
                <p className="text-emerald-400 font-semibold uppercase tracking-wider text-sm mb-4">Ready to get started?</p>
                <h2 className="cta-title">Let us help you demonstrate your commitment to educational excellence.</h2>
              </div>
              <div className="cta-actions">
                <Link className="cta-button primary" href="/portal/register">
                  Apply for Accreditation
                </Link>
                <Link className="cta-button outline" href="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}
