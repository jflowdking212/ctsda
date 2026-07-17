import Link from 'next/link';
import { PageHero, PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with CTSDA',
};

export default function ContactPage() {
  return (
    <PublicPage>
      <main>
        <PageHero eyebrow="Contact" title="Speak with CTSDA about accreditation, verification, or partnerships.">
          <p>
            Contact the CTSDA team for applicant support, institutional questions, or public
            verification assistance.
          </p>
        </PageHero>
        <section className="section">
          <div className="section-inner split">
            <div>
              <p className="eyebrow">Get in touch</p>
              <h2>We will route your inquiry to the right team.</h2>
              <Link className="text-link" href="/portal/register">
                Begin an application
              </Link>
            </div>
            <div className="feature-grid">
              {[
                ['Email', 'management@ctsdamerica.com'],
                ['Address', 'The Green, STE A, Dover, Kent, Delaware, United States'],
                ['Hours', 'Monday to Friday, 9:00 - 17:00'],
                ['Verification', 'Use the public verification page for certificate checks.'],
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
      </main>
    </PublicPage>
  );
}
