import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Legal',
  description: 'CTSDA legal policies, privacy practices, and website terms.',
};

export default function LegalPage() {
  return (
    <PublicPage>
      <main className="content-page">
        <header className="content-header">
          <p className="eyebrow">Legal</p>
          <h1>Legal policies</h1>
          <p>
            Review the policies that govern CTSDA privacy practices, applicant obligations,
            payment terms, verification tools, and website use.
          </p>
        </header>

        <section className="content-panel">
          <h2>Policy documents</h2>
          <p>
            These pages explain how CTSDA handles information submitted through this website,
            applicant portal, verification tools, directory listings, and accreditation services.
          </p>
          <div className="legal-link-grid">
            <Link href="/privacy-policy">
              <span>Privacy Policy</span>
              <small>How CTSDA collects, uses, shares, protects, and retains information.</small>
            </Link>
            <Link href="/terms-of-service">
              <span>Terms of Service</span>
              <small>Rules for using CTSDA services, applications, payments, and certificates.</small>
            </Link>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}
