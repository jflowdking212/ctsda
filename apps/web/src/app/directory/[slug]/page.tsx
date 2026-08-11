'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

// ── SVG Icon Set ──────────────────────────────────────────────────────────────
const Icon = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  Share: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Building: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Globe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  MapPin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Award: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  GradCap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Search: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Verify: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, delay = '0ms' }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '20px', border: '1px solid #e8eef5',
      boxShadow: '0 1px 8px rgba(15,23,42,.06)', overflow: 'hidden',
      animation: `fadeInUp .5s ${delay} ease both`,
    }}>
      <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: '#2563eb' }}>{icon}</div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: '22px 28px' }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{value}</span>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg,#eff6ff,#eef2ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb',
      }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 3px' }}>{label}</p>
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: 500, wordBreak: 'break-all' }}>
            {value}
          </a>
        ) : (
          <p style={{ fontSize: '14px', color: '#334155', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function InstitutionPage() {
  const { slug } = useParams();
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/institutions/public-accredited/${slug}`);
        setInstitution(res.ok ? await res.json() : null);
      } catch { setInstitution(null); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%,100%{opacity:.7} 50%{opacity:1} }
    .prog-item:hover { background:#eff6ff !important; border-color:#bfdbfe !important; }
    .share-btn:hover { background:#f1f5f9 !important; }
    .verify-btn:hover { background:#f0f9ff !important; }
    @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr !important; } }
  `;

  const pageWrap: React.CSSProperties = { fontFamily:"'Inter',system-ui,sans-serif", minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f4f6fb' };

  if (loading) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <PremiumHeader />
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
        <div style={{ width:'44px', height:'44px', border:'3px solid #e2e8f0', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
        <p style={{ color:'#64748b', fontWeight:500 }}>Loading profile...</p>
      </div>
      <PremiumFooter />
    </div>
  );

  if (!institution) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <PremiumHeader />
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'20px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'24px', color:'#94a3b8' }}>
          <Icon.Search />
        </div>
        <h1 style={{ fontSize:'28px', fontWeight:800, color:'#0f172a', marginBottom:'12px' }}>Institution Not Found</h1>
        <p style={{ color:'#64748b', fontSize:'16px', marginBottom:'32px', maxWidth:'420px', lineHeight:1.6 }}>
          The institution you are looking for does not exist or is no longer accredited by CTSDA.
        </p>
        <Link href="/directory" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', textDecoration:'none', borderRadius:'12px', padding:'13px 28px', fontWeight:700, fontSize:'15px', boxShadow:'0 4px 16px rgba(37,99,235,.35)' }}>
          <Icon.ArrowLeft /> Back to Directory
        </Link>
      </div>
      <PremiumFooter />
    </div>
  );

  const latestAcc = institution.accreditations?.[0];
  const validUntil = latestAcc?.expiresAt
    ? new Date(latestAcc.expiresAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : 'N/A';
  const approvedApp = institution.applications?.[0];
  const programs = approvedApp?.offeredCertificates || [];
  const trainingAreas = approvedApp?.trainingAreas?.map((ta: any) => ta.trainingArea?.name).filter(Boolean) || [];

  return (
    <div style={pageWrap}>
      <style>{css}</style>
      <PremiumHeader />

      {/* ── COVER BANNER ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #0b1428 0%, #0f2258 50%, #0a1a6e 100%)',
        height: '200px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.06) 1px, transparent 0)', backgroundSize:'28px 28px' }}/>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.3) 0%, transparent 70%)' }}/>
        {/* Breadcrumb */}
        <div style={{ position:'relative', zIndex:2, padding:'24px 32px' }}>
          <Link href="/directory" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'rgba(255,255,255,.7)', textDecoration:'none', fontSize:'13px', fontWeight:600, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'100px', padding:'6px 14px', backdropFilter:'blur(8px)', transition:'all .2s' }}>
            <Icon.ArrowLeft /> All Institutions
          </Link>
        </div>
      </div>

      {/* ── PROFILE HEADER CARD ──────────────────────────────────────────── */}
      <div style={{ maxWidth:'1140px', margin:'-80px auto 0', padding:'0 24px', position:'relative', zIndex:10, width:'100%' }}>
        <div style={{
          background:'#fff', borderRadius:'24px',
          boxShadow:'0 8px 48px rgba(15,23,42,.13)',
          border:'1px solid #e8eef5', overflow:'hidden',
          animation:'fadeInUp .5s ease both',
        }}>
          <div style={{ padding:'28px 36px 24px', display:'flex', alignItems:'flex-start', gap:'24px', flexWrap:'wrap' }}>

            {/* Logo */}
            <div style={{
              width:'96px', height:'96px', flexShrink:0, borderRadius:'20px',
              background:'#f8fafc', border:'2px solid #e2e8f0',
              boxShadow:'0 4px 16px rgba(0,0,0,.09)', overflow:'hidden',
              display:'flex', alignItems:'center', justifyContent:'center',
              marginTop:'-48px',
            }}>
              {institution.logoUrl ? (
                <img src={institution.logoUrl} alt={institution.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:'8px' }}/>
              ) : (
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#dbeafe,#e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', fontWeight:900, color:'#1d4ed8' }}>
                  {institution.name.substring(0,2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div style={{ flex:1, minWidth:'220px', paddingTop:'4px' }}>
              <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'8px' }}>
                <h1 style={{ fontSize:'clamp(22px,4vw,30px)', fontWeight:900, color:'#0f172a', letterSpacing:'-.02em' }}>{institution.name}</h1>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:'100px', padding:'4px 12px', fontSize:'12px', fontWeight:700, letterSpacing:'.03em' }}>
                  <Icon.Check /> ACCREDITED
                </span>
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:'16px', color:'#64748b', fontSize:'13px', fontWeight:500, marginBottom:'16px' }}>
                {institution.country && (
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <Icon.Pin /> {institution.country}
                  </span>
                )}
                {institution.institutionType && (
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', textTransform:'capitalize' }}>
                    <Icon.Building /> {institution.institutionType}
                  </span>
                )}
                {institution.yearEstablished && (
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <Icon.Calendar /> Est. {institution.yearEstablished}
                  </span>
                )}
              </div>

              {trainingAreas.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {trainingAreas.map((a: string, i: number) => (
                    <span key={i} style={{ background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'4px 12px', fontSize:'12px', fontWeight:500 }}>{a}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', paddingTop:'4px', flexWrap:'wrap' }}>
              <button className="share-btn" onClick={handleShare} style={{
                display:'inline-flex', alignItems:'center', gap:'7px',
                background:'#f8fafc', color:'#334155', border:'1px solid #e2e8f0',
                borderRadius:'10px', padding:'10px 18px', fontSize:'13px', fontWeight:600,
                cursor:'pointer', transition:'all .2s',
              }}>
                <Icon.Share /> {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Accreditation strip */}
          <div style={{
            margin:'0 24px 24px', borderRadius:'14px',
            background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            border:'1px solid #bbf7d0', padding:'14px 20px',
            display:'flex', alignItems:'center', gap:'14px',
          }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#16a34a,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff' }}>
              <Icon.Shield />
            </div>
            <div>
              <p style={{ fontWeight:700, color:'#15803d', fontSize:'14px', margin:'0 0 2px' }}>Officially Accredited by CTSDA</p>
              <p style={{ color:'#166534', fontSize:'13px', margin:0 }}>
                This institution meets all requirements of the Council For Training Skills & Development America. Valid until <strong>{validUntil}</strong>.
              </p>
            </div>
            <div style={{ marginLeft:'auto', textAlign:'right', flexShrink:0 }}>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#15803d', letterSpacing:'.05em', textTransform:'uppercase', margin:'0 0 2px' }}>Status</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#15803d', color:'#fff', borderRadius:'100px', padding:'3px 12px', fontSize:'12px', fontWeight:700 }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', animation:'shimmer 2s ease infinite' }}/> Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth:'1140px', margin:'28px auto 80px', padding:'0 24px', width:'100%' }}>
        <div className="profile-grid" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', alignItems:'start' }}>

          {/* ─ Left ─ */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px', minWidth:0 }}>

            {/* About */}
            <SectionCard title="About the Institution" icon={<Icon.GradCap />} delay="0ms">
              <p style={{ color: institution.description ? '#475569' : '#94a3b8', lineHeight:1.8, fontSize:'15px', fontStyle: institution.description ? 'normal' : 'italic' }}>
                {institution.description || 'No description has been provided for this institution yet.'}
              </p>
            </SectionCard>

            {/* Programs */}
            <SectionCard title="Programs & Certificates Offered" icon={<Icon.Award />} delay="80ms">
              {programs.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'10px' }}>
                  {programs.map((p: any, i: number) => (
                    <div key={i} className="prog-item" style={{
                      display:'flex', alignItems:'center', gap:'10px',
                      padding:'12px 14px', borderRadius:'12px',
                      background:'#f8fafc', border:'1px solid #e2e8f0',
                      transition:'all .2s',
                    }}>
                      <div style={{ width:'22px', height:'22px', borderRadius:'6px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                        <Icon.Check />
                      </div>
                      <span style={{ color:'#334155', fontSize:'13px', fontWeight:600, lineHeight:1.3 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color:'#94a3b8', fontStyle:'italic', fontSize:'14px' }}>No specific programs listed yet.</p>
              )}
            </SectionCard>

            {/* Training Areas */}
            {trainingAreas.length > 0 && (
              <SectionCard title="Areas of Training" icon={<Icon.GradCap />} delay="160ms">
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                  {trainingAreas.map((a: string, i: number) => (
                    <span key={i} style={{
                      background:'linear-gradient(135deg,#eff6ff,#eef2ff)', color:'#1d4ed8',
                      border:'1px solid #c7d2fe', borderRadius:'10px',
                      padding:'8px 16px', fontSize:'13px', fontWeight:600,
                    }}>{a}</span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ─ Right Sidebar ─ */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Quick Info */}
            <SectionCard title="Quick Info" icon={<Icon.Building />} delay="0ms">
              <InfoRow label="Founded" value={institution.yearEstablished || '—'} />
              <InfoRow label="Type" value={<span style={{ textTransform:'capitalize' }}>{institution.institutionType || '—'}</span>} />
              <InfoRow label="Reg. Number" value={institution.registrationNumber || '—'} />
              <InfoRow label="Country" value={institution.country || '—'} />
              <InfoRow label="Accred. Status" value={<span style={{ color:'#15803d', fontWeight:700, display:'flex', alignItems:'center', gap:'5px' }}><div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e' }}/> Active</span>} />
              {programs.length > 0 && <InfoRow label="Programs" value={programs.length} />}
            </SectionCard>

            {/* Contact */}
            <SectionCard title="Contact Information" icon={<Icon.Mail />} delay="80ms">
              {institution.email && <ContactRow icon={<Icon.Mail />} label="Email" value={institution.email} href={`mailto:${institution.email}`} />}
              {institution.website && <ContactRow icon={<Icon.Globe />} label="Website" value={institution.website} href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} />}
              {institution.phone && <ContactRow icon={<Icon.Phone />} label="Phone" value={institution.phone} href={`tel:${institution.phone}`} />}
              {institution.address && <ContactRow icon={<Icon.MapPin />} label="Address" value={`${institution.address}${institution.country ? `, ${institution.country}` : ''}`} />}
            </SectionCard>

            {/* Social Links */}
            {institution.socialLinks?.length > 0 && (
              <SectionCard title="Social Media" icon={<Icon.Globe />} delay="120ms">
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {institution.socialLinks.map((s: any) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                      display:'inline-flex', alignItems:'center', gap:'6px',
                      background:'#f8fafc', color:'#334155', border:'1px solid #e2e8f0',
                      borderRadius:'10px', padding:'8px 16px', fontSize:'13px',
                      fontWeight:600, textDecoration:'none', textTransform:'capitalize', transition:'all .2s',
                    }}>
                      {s.platform} <Icon.ExternalLink />
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Verify CTA */}
            <div style={{
              borderRadius:'20px', overflow:'hidden',
              boxShadow:'0 4px 20px rgba(29,78,216,.25)',
              animation:'fadeInUp .5s 200ms ease both',
            }}>
              <div style={{ background:'linear-gradient(160deg,#0f2258,#1d4ed8)', padding:'28px' }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', color:'#fff' }}>
                  <Icon.Verify />
                </div>
                <p style={{ color:'#93c5fd', fontSize:'11px', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', margin:'0 0 8px' }}>Certificate Verification</p>
                <h3 style={{ color:'#fff', fontSize:'17px', fontWeight:800, margin:'0 0 10px', lineHeight:1.3 }}>Verify a Certificate</h3>
                <p style={{ color:'rgba(255,255,255,.65)', fontSize:'13px', margin:'0 0 20px', lineHeight:1.6 }}>
                  Authenticate certificates issued by this institution through CTSDA's official verification portal.
                </p>
                <Link href="/verify-certificate" className="verify-btn" style={{
                  display:'block', textAlign:'center',
                  background:'#fff', color:'#1d4ed8',
                  borderRadius:'12px', padding:'12px',
                  fontSize:'14px', fontWeight:700, textDecoration:'none',
                  transition:'all .2s',
                }}>
                  🔍 Verify Certificate
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
