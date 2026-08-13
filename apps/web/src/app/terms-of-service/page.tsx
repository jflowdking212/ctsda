import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Terms of Service | CTSDA - Global Standards in Education Excellence',
  description: 'Official Terms of Service, institutional agreement, payment rules, and certificate verification terms for the Council For Training Skills & Development America (CTSDA).',
};

const sections = [
  {
    id: 'use-of-services',
    title: '1. Use of CTSDA Services',
    icon: '📋',
    content: `The Council For Training Skills and Development America (CTSDA) provides international accreditation, institutional evaluation, certificate verification, and educational governance services.

By accessing our website (ctsdamerica.com / ctsdamerica.com), creating an account, submitting an accreditation application, making a fee payment, or using our public verification tools, you agree to comply with these Terms of Service.

You may use CTSDA services solely for lawful, authorized purposes. You represent and warrant that all information submitted by you or on behalf of your institution is accurate, current, complete, and legally authorized.`
  },
  {
    id: 'accounts-access',
    title: '2. Accounts & Access Control',
    icon: '🔑',
    content: `Institutional and applicant portal accounts are provided to authorized representatives of educational and training institutions.

• Security Responsibilities: You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.
• Unauthorized Access: You must notify CTSDA immediately at management@ctsdamerica.com if you suspect unauthorized access or a security breach.
• Account Suspension: CTSDA reserves the right to suspend, restrict, or terminate account access if we detect fraudulent activity, credential sharing, or non-compliance with our governance policies.`
  },
  {
    id: 'accreditation-decisions',
    title: '3. Applications & Accreditation Decisions',
    icon: '🎓',
    content: `Submitting an accreditation application initiates a formal evaluation process conducted by CTSDA peer reviewers and quality assurance officers.

• No Automatic Approval: Application submission or fee payment does not guarantee accreditation, approval, or listing in the public registry.
• Additional Documentation: CTSDA reserves the right to request supplementary evidence, conduct site audits, or request curriculum modifications before making a final determination.
• Revocation & Suspension: CTSDA reserves the right to suspend or revoke accreditation if an institution fails to maintain quality standards, submits false credentials, or breaches ethical benchmarks.`
  },
  {
    id: 'payments-fees',
    title: '4. Fees, Payments & Manual Processing',
    icon: '💳',
    content: `All fees associated with accreditation applications, review processing, and annual institutional subscriptions are specified in the official CTSDA fee schedule (e.g. $500 USD annual accreditation fee).

• Payment Methods: Payments may be processed online via integrated payment gateways (Stripe) or via approved manual bank transfers.
• Manual Transfer Verification: Manual wire/bank transfers are not considered complete until CTSDA finance officers verify and confirm the funds in our accounts.
• Non-Refundability: Unless stated otherwise in a formal written agreement, application, evaluation, and review fees are administrative fees and are non-refundable once review processing has commenced.`
  },
  {
    id: 'verification-directory',
    title: '5. Certificate Verification & Directory Registry',
    icon: '🔍',
    content: `CTSDA operates a public searchable directory of accredited institutions and an automated certificate verification portal.

• Public Confirmation: Verification results and public directory listings reflect official CTSDA records at the time of the lookup.
• Record Validity: A valid verification result confirms that a certificate or institution was officially recorded by CTSDA. It does not authorize third parties to alter or misuse CTSDA credentials.
• Misrepresentation: Falsifying CTSDA certificate numbers or displaying unearned verification badges is strictly prohibited.`
  },
  {
    id: 'prohibited-conduct',
    title: '6. Prohibited Conduct & System Integrity',
    icon: '🚫',
    content: `When utilizing CTSDA platforms or representing CTSDA credentials, you must NOT:

• Submit fraudulent documents, forged credentials, or misleading institutional profiles.
• Impersonate another institution, officer, student, or CTSDA representative.
• Reverse engineer, scrape, overload, or attempt unauthorized access to CTSDA server infrastructure.
• Display the CTSDA accreditation seal or logo if your institution is not actively accredited or if accreditation has expired.`
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property & Brand Usage',
    icon: '⚖️',
    content: `All content, evaluation frameworks, accreditation seals, badges, software code, design tokens, and trademarks are the exclusive intellectual property of CTSDA.

• License for Accredited Providers: Active accredited institutions are granted a non-exclusive, non-transferable license to display the official CTSDA Accreditation Seal solely during their valid accreditation term.
• Trademark Protection: Unauthorized reproduction of CTSDA logos or misleading claims of partnership will result in immediate legal action and public registry notice.`
  },
  {
    id: 'disclaimers-liability',
    title: '8. Disclaimers & Limitation of Liability',
    icon: '🛡️',
    content: `CTSDA services, public directories, and certificate verification portals are provided on an "as available" basis.

• Operational Continuity: While we strive for 100% uptime and precise records, CTSDA does not guarantee uninterrupted website availability or error-free transmissions.
• Limitation of Liability: To the maximum extent permitted by applicable law, CTSDA and its board members shall not be liable for direct, indirect, incidental, or consequential damages resulting from the use of or inability to use our services.`
  },
  {
    id: 'amendments',
    title: '9. Amendments & Policy Updates',
    icon: '🔄',
    content: `CTSDA reserves the right to update these Terms of Service as international standards, statutory regulations, or operational practices evolve.

• Notice of Updates: Revised terms will be published on this page with an updated revision date.
• Continued Acceptance: Continued access to or use of CTSDA portals, directory listings, or verification tools following an update constitutes acceptance of the modified Terms of Service.`
  },
  {
    id: 'contact',
    title: '10. Contact & Legal Support',
    icon: '✉️',
    content: `For legal inquiries, accreditation disputes, or questions regarding these Terms of Service, contact the CTSDA Legal Office:

Council For Training Skills and Development America (CTSDA)
Address: The Green, STE A, Dover, Kent, Delaware, United States
Email: management@ctsdamerica.com
Official Portal: https://ctsdamerica.com`
  }
];

export default function TermsOfServicePage() {
  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Banner Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
            color: '#ffffff',
            padding: '5rem 2rem 4.5rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fbbf24',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Legal & Governance Framework
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.15,
              }}
            >
              Terms of Service
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
              Official terms governing institutional accreditation, portal usage, fee payments, certificate verification, and intellectual property.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#93c5fd', fontWeight: 600 }}>
              Last updated: July 2026 • Valid for all CTSDA services worldwide
            </div>
          </div>
        </section>

        {/* Content Body */}
        <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '3.5rem 1.5rem 0' }}>
          
          {/* Quick Jump Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              padding: '1.25rem 1.75rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              marginBottom: '3rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Quick Navigation
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: '2.5rem 2.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                  scrollMarginTop: '6rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                  <span
                    style={{
                      fontSize: '1.5rem',
                      width: '2.75rem',
                      height: '2.75rem',
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {section.icon}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {section.title}
                  </h2>
                </div>

                <div
                  style={{
                    color: '#334155',
                    fontSize: '1.025rem',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Callout */}
          <div
            style={{
              marginTop: '3.5rem',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: '1.25rem',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              Have questions about our Terms of Service?
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
              Our compliance and legal team is available to assist applicants, accredited providers, and public verifiers.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/contact"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  padding: '0.85rem 1.75rem',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                Contact Legal Support
              </Link>
              <Link
                href="/privacy-policy"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  fontWeight: 700,
                  padding: '0.85rem 1.75rem',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                View Privacy Policy
              </Link>
            </div>
          </div>

        </div>
      </main>
    </PublicPage>
  );
}
