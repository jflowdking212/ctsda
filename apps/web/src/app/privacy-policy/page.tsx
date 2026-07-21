import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Privacy Policy',
  description: 'CTSDA privacy practices for applicants, institutions, reviewers, and visitors.',
};

export default function PrivacyPolicyPage() {
  return (
    <PublicPage>
      <main className="content-page">
        <header className="content-header">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>
            This policy explains how CTSDA handles information submitted through this website,
            applicant portal, verification tools, directory listings, and accreditation services.
            Last updated July 17, 2026.
          </p>
        </header>

        <section className="content-panel">
          <p>
            Council for Training, Skills & Development America, or CTSDA, respects the privacy of
            visitors, applicants, institutional representatives, reviewers, and people who use our
            certificate verification tools. This policy describes the personal information we
            collect, how we use it, when we share it, and the choices available to you.
          </p>

          <h2>Information we collect</h2>
          <p>
            We collect information you provide directly, including name, email address, phone
            number, account credentials, institution details, accreditation application materials,
            training areas, operational information, supporting documents, payment references, and
            messages sent through contact or support channels.
          </p>
          <p>
            We also collect limited technical information for security and service operation, such
            as IP address, browser type, device information, pages visited, session identifiers,
            login activity, audit logs, and error diagnostics.
          </p>

          <h2>How we use information</h2>
          <p>
            We use information to create and secure accounts, process accreditation applications,
            review documents, communicate with applicants, manage payments, maintain audit trails,
            verify certificates, publish approved directory information, prevent abuse, comply with
            legal obligations, and improve the reliability of CTSDA services.
          </p>

          <h2>Public accreditation information</h2>
          <p>
            If an institution is accredited or listed in the CTSDA directory, we may publish
            institution name, country, institution type, accreditation code, certificate number,
            accreditation status, issue date, expiration date, and other non-confidential
            accreditation details needed for public verification.
          </p>

          <h2>Payments and service providers</h2>
          <p>
            Online payments may be processed by third-party payment providers such as Stripe. CTSDA
            does not need to store full card numbers on its own systems. Payment processors,
            hosting providers, email providers, storage providers, analytics/security tools, and
            professional advisers may process information only as needed to provide services,
            protect the platform, or satisfy legal requirements.
          </p>

          <h2>Cookies and security logs</h2>
          <p>
            We use cookies or similar technologies for login sessions, security, preferences, and
            service diagnostics. You can control cookies through your browser, but disabling
            required cookies may prevent secure portal features from working correctly.
          </p>

          <h2>How we share information</h2>
          <p>
            We do not sell personal information. We may share information with service providers,
            payment processors, reviewers, authorized CTSDA staff, regulators or law enforcement
            when required, and parties involved in a business transfer or legal claim. We may also
            share public accreditation information through the directory and verification tools.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep information for as long as needed to provide accreditation services, maintain
            records, prevent fraud, comply with legal or accounting obligations, resolve disputes,
            and preserve audit history. Some accreditation, payment, and audit records may be kept
            after an account is closed where required for integrity, compliance, or public
            verification.
          </p>

          <h2>Your privacy choices</h2>
          <p>
            Depending on where you live, including certain U.S. states, you may have rights to
            request access, correction, deletion, portability, or restriction of certain personal
            information. You may also ask whether we share personal information for targeted
            advertising or sales. CTSDA does not sell personal information, but we will respond to
            valid privacy requests as required by applicable law.
          </p>

          <h2>Children</h2>
          <p>
            CTSDA services are intended for institutions, adult applicants, and professional
            representatives. We do not knowingly collect personal information from children under
            13. If you believe a child has submitted information to us, contact us so we can review
            and delete it where appropriate.
          </p>

          <h2>Security</h2>
          <p>
            We use administrative, technical, and organizational safeguards designed to protect
            personal information. No online system can be guaranteed completely secure, so users
            should protect account credentials, use strong passwords, and notify CTSDA of suspected
            unauthorized access.
          </p>

          <h2>Contact for privacy requests</h2>
          <p>
            For privacy questions or requests, contact management@ctsdamerica.com or write to
            CTSDA, The Green, STE A, Dover, Kent, Delaware, United States.
          </p>
        </section>
      </main>
    </PublicPage>
  );
}
