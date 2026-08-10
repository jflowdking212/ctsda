'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid #f1f5f9',
    }}>
      <span style={{ color: '#64748b', fontSize: '14px' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', textAlign: 'right' as const, maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function ContactItem({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 3px' }}>{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' as const }}>
            {value}
          </a>
        ) : (
          <p style={{ color: '#334155', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

export default function InstitutionPage() {
  const { slug } = useParams();
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchInstitution() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/institutions/public-accredited/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setInstitution(data);
        } else {
          setInstitution(null);
        }
      } catch {
        setInstitution(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchInstitution();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    background: '#f0f4f8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <PremiumHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#64748b' }}>Loading institution profile...</p>
        </div>
        <PremiumFooter />
      </div>
    );
  }

  if (!institution) {
    return (
      <div style={pageStyle}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        <PremiumHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏛️</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Institution Not Found</h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 28px', maxWidth: '400px' }}>
            The institution you are looking for does not exist or is no longer accredited.
          </p>
          <Link href="/directory" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#2563eb', color: '#fff', textDecoration: 'none',
            borderRadius: '12px', padding: '12px 28px', fontWeight: 600, fontSize: '15px',
          }}>
            ← Back to Directory
          </Link>
        </div>
        <PremiumFooter />
      </div>
    );
  }

  const latestAccreditation = institution.accreditations?.[0];
  const validUntil = latestAccreditation?.expiresAt
    ? new Date(latestAccreditation.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const approvedApp = institution.applications?.[0];
  const programs = approvedApp?.offeredCertificates || [];
  const trainingAreas = approvedApp?.trainingAreas?.map((ta: any) => ta.trainingArea?.name).filter(Boolean) || [];

  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .prog-item:hover { background: #eff6ff !important; border-color: #bfdbfe !important; }
        .share-btn:hover { background: #f8fafc !important; }
      `}</style>
      <PremiumHeader />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        padding: '60px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        {/* Breadcrumb */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', marginBottom: '12px' }}>
          <Link href="/directory" style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← All Accredited Institutions
          </Link>
        </div>
      </div>

      {/* Profile Card overlapping hero */}
      <div style={{ maxWidth: '1100px', margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff', borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          border: '1px solid #e8eef5', overflow: 'hidden',
          animation: 'fadeUp 0.5s ease both',
        }}>
          {/* Header inside card */}
          <div style={{ padding: '32px 36px', display: 'flex', alignItems: 'flex-start', gap: '28px', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{
              width: '100px', height: '100px', flexShrink: 0,
              borderRadius: '20px', background: '#f8fafc',
              border: '2px solid #e8eef5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {institution.logoUrl ? (
                <img src={institution.logoUrl} alt={`${institution.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                  fontSize: '28px', fontWeight: 800, color: '#1d4ed8',
                }}>
                  {institution.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {institution.name}
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                  borderRadius: '100px', padding: '4px 14px', fontSize: '13px', fontWeight: 600,
                }}>
                  ✓ Accredited
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                {institution.country && <span>📍 {institution.country}</span>}
                {institution.institutionType && <span>🏢 {institution.institutionType}</span>}
                {institution.yearEstablished && <span>📅 Est. {institution.yearEstablished}</span>}
                <span style={{ color: latestAccreditation ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                  🛡️ Valid until: {validUntil}
                </span>
              </div>

              {/* Training Area Tags */}
              {trainingAreas.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {trainingAreas.map((area: string, idx: number) => (
                    <span key={idx} style={{
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      borderRadius: '100px', padding: '4px 12px', fontSize: '12px', fontWeight: 500,
                    }}>{area}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                className="share-btn"
                onClick={handleShare}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0',
                  borderRadius: '10px', padding: '10px 20px', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#f1f5f9', margin: '0 36px' }} />

          {/* Accreditation Banner */}
          <div style={{
            margin: '20px 36px',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #bbf7d0', borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ fontSize: '28px' }}>🏆</div>
            <div>
              <p style={{ fontWeight: 700, color: '#15803d', margin: '0 0 3px', fontSize: '15px' }}>
                Officially Accredited by CTSDA
              </p>
              <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>
                This institution has met all requirements set by the Council For Training Skills & Development America.
                Accreditation valid until {validUntil}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '28px auto 60px', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '24px' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

            {/* About */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
              animation: 'fadeUp 0.5s 0.1s ease both',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📖</span> About the Institution
              </h2>
              <p style={{ color: institution.description ? '#475569' : '#94a3b8', lineHeight: 1.8, margin: 0, fontStyle: institution.description ? 'normal' : 'italic' }}>
                {institution.description || 'No description has been provided for this institution yet.'}
              </p>
            </div>

            {/* Programs */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
              animation: 'fadeUp 0.5s 0.2s ease both',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🎓</span> Programs & Certificates Offered
              </h2>
              {programs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {programs.map((prog: any, idx: number) => (
                    <div
                      key={idx}
                      className="prog-item"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 16px', borderRadius: '12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ color: '#2563eb', fontSize: '16px', flexShrink: 0 }}>✓</span>
                      <span style={{ color: '#334155', fontSize: '14px', fontWeight: 500 }}>{prog.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No specific programs have been listed yet.</p>
              )}
            </div>

            {/* Training Areas (if any separate from tags) */}
            {trainingAreas.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: '20px', padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
                animation: 'fadeUp 0.5s 0.3s ease both',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>📚</span> Training Areas
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {trainingAreas.map((area: string, idx: number) => (
                    <span key={idx} style={{
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                      borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                    }}>{area}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Quick Info */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
              animation: 'fadeUp 0.5s 0.1s ease both',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ℹ️</span> Quick Info
              </h2>
              <InfoRow label="Founded" value={institution.yearEstablished || 'N/A'} />
              <InfoRow label="Institution Type" value={<span style={{ textTransform: 'capitalize' }}>{institution.institutionType || 'N/A'}</span>} />
              <InfoRow label="Reg. Number" value={institution.registrationNumber || 'N/A'} />
              <InfoRow label="Country" value={institution.country || 'N/A'} />
              <InfoRow label="Accred. Status" value={
                <span style={{ color: '#15803d', fontWeight: 700 }}>● Active</span>
              } />
              {programs.length > 0 && <InfoRow label="No. of Programs" value={programs.length} />}
            </div>

            {/* Contact Information */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
              animation: 'fadeUp 0.5s 0.2s ease both',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📬</span> Contact Information
              </h2>
              {institution.email && (
                <ContactItem icon="✉️" label="Email" value={institution.email} href={`mailto:${institution.email}`} />
              )}
              {institution.website && (
                <ContactItem
                  icon="🌐" label="Website"
                  value={institution.website}
                  href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`}
                />
              )}
              {institution.phone && (
                <ContactItem icon="📞" label="Phone" value={institution.phone} href={`tel:${institution.phone}`} />
              )}
              {institution.address && (
                <ContactItem
                  icon="📍" label="Address"
                  value={`${institution.address}${institution.country ? `, ${institution.country}` : ''}`}
                />
              )}
            </div>

            {/* Social Links */}
            {institution.socialLinks && institution.socialLinks.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: '20px', padding: '28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e8eef5',
                animation: 'fadeUp 0.5s 0.3s ease both',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>🌐 Social Media</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {institution.socialLinks.map((social: any) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0',
                        borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
                        fontWeight: 600, textDecoration: 'none', textTransform: 'capitalize',
                        transition: 'all 0.2s',
                      }}
                    >
                      {social.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Verify Credentials CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
              borderRadius: '20px', padding: '28px',
              boxShadow: '0 4px 20px rgba(29,78,216,0.3)',
              animation: 'fadeUp 0.5s 0.4s ease both',
            }}>
              <p style={{ color: '#bfdbfe', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Certificate Verification
              </p>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>
                Verify a Certificate
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.6 }}>
                Verify the authenticity of certificates issued by this institution through CTSDA's official verification system.
              </p>
              <Link href="/verify-certificate" style={{
                display: 'block', textAlign: 'center',
                background: '#fff', color: '#1d4ed8',
                borderRadius: '10px', padding: '11px',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                🔍 Verify Certificate
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
