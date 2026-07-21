import { PageHero, PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Services',
  description: 'CTSDA accreditation and verification services',
};

const services = [
  ['Institution Accreditation', 'Comprehensive review for institutions seeking recognized quality status.'],
  ['Program Accreditation', 'Evaluation of individual programs, courses, and training pathways.'],
  ['Continuing Education Accreditation', 'Support for professional development and lifelong learning providers.'],
  ['Accreditation Consulting', 'Readiness support, gap review, and improvement planning.'],
  ['Certificate Verification', 'Public validation for issued credentials and accredited status.'],
  ['Directory Listing', 'Searchable visibility for active accredited institutions.'],
];

export default function ServicesPage() {
  return (
    <PublicPage>
      <main>
        <PageHero eyebrow="Services" title="Accreditation services built for trust, visibility, and growth.">
          <p>
            CTSDA combines structured review, public verification, and practical institutional
            guidance to help education providers demonstrate quality.
          </p>
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(([title, text]) => (
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
