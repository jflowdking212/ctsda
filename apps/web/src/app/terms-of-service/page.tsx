import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Terms of Service',
  description: 'CTSDA website, accreditation, payment, and certificate verification terms.',
};

export default function TermsOfServicePage() {
  return (
    <PublicPage>
      <main className="content-page">
        <header className="content-header">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
          <p>
            By using this website, creating an account, submitting an application, making a payment,
            using the certificate verification tool, or accessing CTSDA materials, you agree to
            these Terms of Service. Last updated July 17, 2026.
          </p>
        </header>

        <section className="content-panel">
          <h2>Use of CTSDA services</h2>
          <p>
            You may use CTSDA services only for lawful purposes and in accordance with these terms.
            You are responsible for ensuring that all information submitted by you or on behalf of
            your institution is accurate, current, complete, and authorized.
          </p>

          <h2>Accounts and access</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and
            for all activity under your account. CTSDA may suspend or restrict access if we believe
            an account is being misused, compromised, or used in violation of these terms.
          </p>

          <h2>Applications and accreditation decisions</h2>
          <p>
            Submitting an application does not guarantee accreditation, approval, listing, or any
            specific outcome. CTSDA may request additional information, conduct reviews, reject
            incomplete applications, approve applications with conditions, suspend or revoke
            accreditation, or remove directory listings when standards are not met or information is
            inaccurate.
          </p>

          <h2>Payments and manual processing</h2>
          <p>
            Fees are shown during the application or payment process. Payments may be processed
            online through supported payment gateways or manually where CTSDA approves an offline
            payment method. Manual payments are not considered complete until CTSDA verifies and
            records the payment. Unless a written agreement says otherwise, application and review
            fees are administrative fees and may be non-refundable once processing has begun.
          </p>

          <h2>Certificate verification and directory listings</h2>
          <p>
            Verification results and directory listings are provided for public confirmation of
            CTSDA records. A valid result confirms the information available at the time of the
            search. It does not replace the full accreditation record, guarantee future status, or
            authorize misuse of CTSDA marks or certificates.
          </p>

          <h2>Prohibited conduct</h2>
          <p>
            You may not submit false documents, impersonate another person or institution, interfere
            with platform security, scrape or overload the site, attempt unauthorized access, misuse
            CTSDA names or logos, reverse engineer platform code, or use CTSDA services for fraud,
            spam, unlawful discrimination, or misleading claims.
          </p>

          <h2>Intellectual property</h2>
          <p>
            CTSDA owns or licenses the website design, text, logos, processes, software, and
            accreditation materials. You may not copy, modify, distribute, or create derivative
            works from CTSDA materials except as permitted in writing. Institutions may reference
            their accreditation status only while it is active and only in a truthful, non-misleading
            way.
          </p>

          <h2>No professional advice</h2>
          <p>
            Information on this site is provided for accreditation and administrative purposes. It
            is not legal, tax, financial, immigration, employment, or regulatory advice. You should
            consult qualified advisers for advice specific to your institution or jurisdiction.
          </p>

          <h2>Disclaimers and limitation of liability</h2>
          <p>
            CTSDA services are provided on an "as available" basis. We work to maintain accurate
            and secure services, but we do not guarantee uninterrupted operation, error-free data,
            or any commercial result from accreditation. To the fullest extent permitted by law,
            CTSDA will not be liable for indirect, incidental, special, consequential, or punitive
            damages arising from use of the site or services.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update this page as services, laws, or operating practices change. The updated
            version will be posted here with a revised date. Continued use of CTSDA services after
            changes means you accept the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms may be sent to management@ctsdamerica.com or mailed to
            CTSDA, The Green, STE A, Dover, Kent, Delaware, United States.
          </p>
        </section>
      </main>
    </PublicPage>
  );
}
