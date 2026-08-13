import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Privacy Policy & Legal Framework | CTSDA',
  description: 'Comprehensive Privacy Policy, Legal Framework, and Data Governance standards of the Council For Training Skills & Development America (CTSDA).',
};

const sections = [
  {
    id: 'overview',
    title: '1. Overview & Scope',
    icon: '📋',
    content: `The Council For Training Skills and Development America (CTSDA) is committed to protecting the privacy, confidentiality, and security of all personal and institutional data entrusted to us. This Privacy Policy & Legal Framework applies to all interactions with CTSDA, including our website (ctsdamerica.com / ctsdamerica.com), applicant portal, public accreditation directory, certificate verification services, training programs, and communication channels.

By accessing our services, submitting accreditation applications, or utilizing our public verification system, you acknowledge and agree to the practices outlined in this policy.`
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    icon: '📥',
    content: `CTSDA collects information necessary to fulfill our core mandate of educational quality assurance, institutional review, certificate verification, and public accountability:

• Institutional & Representative Data: Institution name, legal registration details, campus addresses, official contact persons, titles, emails, and telephone numbers.
• Accreditation Application Materials: Self-assessment documentation, curriculum frameworks, faculty qualifications, operational policies, and evaluation records.
• Credential & Verification Records: Graduate and trainee details submitted by accredited institutions for public certificate validation (including certificate serial numbers, issue dates, program names, and recipient identifiers).
• Account & Portal Credentials: Authentication details, roles, permission levels, and submission history within the CTSDA portal.
• Communication & Payment Records: Inquiries, correspondence, support tickets, fee payment transaction IDs (CTSDA does not store full credit card numbers; payments are processed securely through certified gateways).
• Technical & Diagnostic Data: IP address, browser type, operating system, timestamped access logs, audit trails, and security diagnostics to prevent unauthorized access.`
  },
  {
    id: 'usage',
    title: '3. How We Use Information',
    icon: '⚡',
    content: `We process collected data exclusively for legitimate operational, educational, and legal purposes:

• Evaluation & Accreditation: Conducting institutional readiness reviews, gap assessments, peer evaluations, and issuing official accreditation decisions.
• Public Registry & Verification: Operating the searchable CTSDA directory and public certificate verification registry so employers, students, and institutions can confirm authentic status.
• Service Operations & Support: Managing portal access, responding to inquiries, processing renewals, and sending administrative notifications.
• Continuous Quality Improvement: Analyzing institutional trends to improve evaluation criteria and educational standards.
• Legal Compliance & Security: Safeguarding our network against fraud, maintaining audit logs, and fulfilling statutory requirements.`
  },
  {
    id: 'disclosure',
    title: '4. Public Verification & Data Sharing',
    icon: '🌐',
    content: `Public Disclosure of Accredited Status:
As an international accreditation body, CTSDA maintains a public directory of accredited institutions and an automated certificate verification portal. The following details are publicly accessible:
- Institution Name, Country, Accredited Category, and Validity Period.
- Certificate Serial Numbers and verification status.

Third-Party Service Sharing:
CTSDA does NOT sell, rent, or trade personal data to third parties. We share data only under strict confidentiality agreements with:
- Peer Evaluators & Assessment Panels appointed by CTSDA.
- Secure Infrastructure Providers (cloud hosting, database management, transactional email services).
- Regulatory Authorities or Legal Process when mandated by applicable law.`
  },
  {
    id: 'security',
    title: '5. Data Security & Storage Integrity',
    icon: '🔒',
    content: `We implement robust technical and organizational security measures to protect data against loss, unauthorized access, alteration, or disclosure:

• Encryption in transit (TLS/HTTPS) and at rest (AES-256 encryption for database repositories).
• Strict role-based access control (RBAC) ensuring only authorized CTSDA reviewers access non-public documentation.
• Routine vulnerability scans, daily backups, and isolated database clusters on secure server infrastructure.
• Audit logs tracking all administrative modifications, verification lookups, and portal activities.`
  },
  {
    id: 'rights',
    title: '6. Institutional & Individual Rights',
    icon: '🛡️',
    content: `Depending on your jurisdiction, institutional representatives and individuals have the right to:

• Request Access: Review personal or institutional records held by CTSDA.
• Request Rectification: Update outdated or inaccurate information.
• Request Restriction or Deletion: Ask for deletion of non-essential account data, subject to legal and accreditation archive requirements.
• Certificate Audit Inquiries: Request verification records regarding credentials issued under accredited programs.

To exercise any of these rights, contact us at management@ctsdamerica.com.`
  },
  {
    id: 'cookies',
    title: '7. Cookies & Web Analytics',
    icon: '🍪',
    content: `Our website utilizes essential session cookies and performance analytics to ensure smooth navigation, maintain secure portal sessions, and analyze traffic patterns. You may control cookie preferences through your browser settings; however, disabling essential cookies may impact portal functionality.`
  },
  {
    id: 'legal-terms',
    title: '8. Legal Terms & Intellectual Property',
    icon: '⚖️',
    content: `• Ownership: All CTSDA logos, accreditation marks, verification seals, evaluation frameworks, and website content are the exclusive intellectual property of CTSDA.
• Authorized Use: Accredited institutions are granted a non-transferable license to display the CTSDA accreditation seal solely during their active accreditation term.
• Misuse & Revocation: Unauthorized display of CTSDA marks or false representation of accreditation will result in immediate public disclaimer, seal revocation, and legal action.`
  },
  {
    id: 'contact',
    title: '9. Contact & Support Information',
    icon: '✉️',
    content: `If you have questions regarding this Privacy Policy & Legal Framework or wish to submit a privacy inquiry:

Council For Training Skills and Development America (CTSDA)
Address: The Green, STE A, Dover, Kent, Delaware, United States
Email: management@ctsdamerica.com
Official Verification Portal: https://ctsdamerica.com/verify`
  }
];

export default function PrivacyPolicyPage() {
  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0f172a 100%)',
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
              Legal & Privacy Governance
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
              Privacy Policy & Legal Framework
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
              Comprehensive guidelines governing data privacy, institutional documentation, public verification, and regulatory compliance at CTSDA.
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
              Have questions about our Legal & Privacy policies?
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
                href="/terms-of-service"
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
                View Terms of Service
              </Link>
            </div>
          </div>

        </div>
      </main>
    </PublicPage>
  );
}
