import { PageHero, PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'About CTSDA',
  description: 'Learn about CTSDA and our international accreditation mission',
};

export default function AboutPage() {
  return (
    <PublicPage>
      <main>
        <PageHero eyebrow="About CTSDA" title="A private, independent accreditation body for modern education providers.">
          <p>
            CTSDA evaluates institutions and programs against structured standards for quality,
            governance, learner support, curriculum delivery, and continuous improvement.
          </p>
        </PageHero>
        <section className="section">
          <div className="section-inner split">
            <div>
              <p className="eyebrow">Our role</p>
              <h2>Helping credible institutions prove quality with confidence.</h2>
            </div>
            <div className="feature-grid">
              {[
                ['Mission', 'Advance educational excellence through rigorous, transparent accreditation.'],
                ['Recognition', 'Support institutions seeking stronger global credibility and partner trust.'],
                ['Independence', 'Maintain clear standards and impartial review practices.'],
                ['Improvement', 'Turn assessment into a practical roadmap for institutional growth.'],
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
