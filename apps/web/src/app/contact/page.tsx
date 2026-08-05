import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Contact Us | CTSDA',
  description: 'Get in touch with the Council For Training Skills & Development America for accreditation support, institutional inquiries, and verification assistance.',
};

async function getSettings() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_BASE}/settings/public`, { next: { revalidate: 30 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getSettings();

  const heroSubtitle = settings.contactHeroSubtitle || 'We are here to assist institutions, educators, applicants, and the public with accreditation, verification, and partnership inquiries.';
  const introText = settings.contactIntroText || 'Reach out directly to our dedicated support team for assistance.';
  const email = settings.supportEmail || settings.contactEmail || 'support@ctsdamerica.com';
  const legalEmail = settings.contactLegalEmail || 'management@ctsdamerica.com';
  const phone = settings.contactPhone || '+1 (302) 555-0199';
  const address = settings.contactAddress || 'The Green, STE A, Dover, Kent, Delaware, United States';
  const hours = settings.contactHours || 'Monday - Friday: 9:00 AM - 5:00 PM EST';

  return (
    <PublicPage>
      <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* Clean Hero Header - Classic CTSDA style with modern vibrant blue */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '4.5rem 2rem 4rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Get In Touch
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: 1.15,
              }}
            >
              Speak with the CTSDA Team
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3.5rem) 1rem 0', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* Form Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1.25rem',
                padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 2rem)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.02)',
                border: '1px solid #e2e8f0',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Send Us a Message
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                Fill out the form below and our inquiries team will respond within 24 business hours.
              </p>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jane Smith"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="jane@institution.edu"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Institution / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Global Academy of Science"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Subject / Topic <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select a subject...</option>
                    <option value="accreditation">Institutional Accreditation Inquiry</option>
                    <option value="verification">Certificate Verification Assistance</option>
                    <option value="training">Training Program Accreditation</option>
                    <option value="partnership">Partnership & Collaboration</option>
                    <option value="other">General Question</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Your Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="How can our team help you?"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '0.5rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '0.95rem 1.75rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Direct Contact Channels Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
              
              {/* Info Cards Grid */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1rem, 3.5vw, 1.5rem)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.25rem)', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  Direct Contact Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Email */}
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0,
                      }}
                    >
                      ✉️
                    </div>
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Email Inquiries
                      </div>
                      <a
                        href={`mailto:${email}`}
                        style={{
                          fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                          fontWeight: 700,
                          color: '#2563eb',
                          textDecoration: 'none',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        {email}
                      </a>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                        For general support, application guidance, and institutional inquiries.
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        United States Headquarters
                      </div>
                      <div style={{ fontSize: 'clamp(0.875rem, 3.5vw, 0.975rem)', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
                        {address}
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0,
                      }}
                    >
                      🕒
                    </div>
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Business Hours
                      </div>
                      <div style={{ fontSize: 'clamp(0.875rem, 3.5vw, 0.975rem)', fontWeight: 600, color: '#334155', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
                        {hours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Action Card */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  Ready to apply for accreditation?
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Start your institutional profile and self-assessment documentation online in our secure portal.
                </p>
                <Link
                  href="/apply"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.85rem 1.25rem',
                    borderRadius: '0.625rem',
                    textDecoration: 'none',
                  }}
                >
                  Begin Institutional Application &rarr;
                </Link>
              </div>

            </div>

          </div>
        </div>
      </main>
    </PublicPage>
  );
}
