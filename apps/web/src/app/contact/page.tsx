import Link from 'next/link';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Contact Us | CTSDA',
  description: 'Get in touch with the Council for Training, Skills & Development America for accreditation support, institutional inquiries, and verification assistance.',
};

export default function ContactPage() {
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
              We are here to assist institutions, educators, applicants, and the public with accreditation, verification, and partnership inquiries.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '3.5rem 1.5rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* Form Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.02)',
                border: '1px solid #e2e8f0',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
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
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Direct Contact Channels Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Info Cards Grid */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                  Direct Contact Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Email */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      ✉️
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Email Inquiries
                      </div>
                      <a
                        href="mailto:management@ctsdamerica.com"
                        style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                      >
                        management@ctsdamerica.com
                      </a>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                        For general support, application guidance, and institutional inquiries.
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        United States Headquarters
                      </div>
                      <div style={{ fontSize: '0.975rem', fontWeight: 700, color: '#0f172a' }}>
                        The Green, STE A, Dover, Kent, Delaware, United States
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      🕒
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Business Hours
                      </div>
                      <div style={{ fontSize: '0.975rem', fontWeight: 600, color: '#334155' }}>
                        Monday to Friday: 9:00 AM – 5:00 PM (EST)
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
