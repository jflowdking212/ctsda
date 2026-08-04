import { IsolatedCertificateVerifier } from '../../components/isolated-certificate-verifier';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Verify Certificate | CTSDA',
  description: 'Enter the CTSDA assigned Certificate number to check its validity and official accreditation status.',
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
            color: '#ffffff',
            padding: '5rem 2rem 4rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 1.2rem',
                background: 'rgba(255,255,255,0.12)',
                color: '#93c5fd',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Verification Services
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                marginBottom: '1rem',
                lineHeight: 1.15,
                color: '#ffffff',
              }}
            >
              Verify Certificate
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Enter the CTSDA assigned Certificate number to check its validity and official accreditation status.
            </p>
          </div>
        </section>

        {/* Content Area */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
          {/* Form Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
              padding: '2.5rem 2rem',
              maxWidth: '560px',
              margin: '0 auto 4rem',
              border: '1px solid #e2e8f0',
            }}
          >
            <IsolatedCertificateVerifier initialToken={params.token || ''} />
          </div>

          {/* Two-Column Info & FAQ Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* How to Verify Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                How to Verify a Certificate
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                      Locate the Certificate Number
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                      Find the CTSDA certificate number on your physical or digital certificate.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                      Enter the Number
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                      Input the complete number including the CTSDA prefix (e.g. CTSDA-125346-AB).
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                      View Results
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                      Check the instant verification result, institution name, and validity details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                    What is a CTSDA Certificate Number?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    A unique identifier assigned to each accredited institution or program, following the format CTSDA-XXXXXX-XX.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                    How long is a certificate valid?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    CTSDA certificates are typically valid for 3-5 years, subject to regular reviews and compliance checks.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                    What if my certificate is invalid?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    Contact our support team for assistance in resolving any verification issues or concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicPage>
  );
}
