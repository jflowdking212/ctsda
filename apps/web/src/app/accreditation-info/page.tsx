import { PageHero, PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Accreditation Information',
  description: 'Learn about the CTSDA accreditation process',
};

export default function AccreditationInfoPage() {
  return (
    <PublicPage>
      <main>
        <PageHero eyebrow="Accreditation information" title="A disciplined review process with a clear outcome.">
          <p>
            Accreditation confirms that an institution meets defined CTSDA expectations for
            training delivery, assessment, staff qualifications, governance, and learner support.
          </p>
        </PageHero>
        <section className="section process-section">
          <div className="container">
            <div className="process-grid">
              {[
                ['01', 'Apply', 'Create your applicant account and submit the institutional profile.'],
                ['02', 'Document', 'Upload evidence covering programs, policies, staffing, and facilities.'],
                ['03', 'Review', 'CTSDA reviewers assess readiness, request clarification, and complete evaluation.'],
                ['04', 'Publish', 'Approved institutions receive accreditation records and public verification.'],
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
      </main>
    </PublicPage>
  );
}
