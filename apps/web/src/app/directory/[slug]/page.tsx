'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Share2, CheckCircle2, ShieldCheck, Calendar, Building, 
  MapPin, Mail, Globe, Phone, Award, GraduationCap, Search, ExternalLink 
} from 'lucide-react';

// Sub-components
function SectionCard({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <h2 className="text-lg font-bold text-slate-900 m-0">{title}</h2>
      </div>
      <div className="px-7 py-6">{children}</div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
      <span className="text-slate-500 text-sm font-medium">{label}</span>
      <span className="font-bold text-slate-900 text-sm text-right">{value}</span>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">{label}</p>
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-slate-700 m-0 leading-snug">{value}</p>
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

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PremiumHeader />
      <div className="flex-1 flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-medium text-slate-500 animate-pulse">Loading profile...</p>
      </div>
      <PremiumFooter />
    </div>
  );

  if (!institution) return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PremiumHeader />
      <div className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-8 text-slate-400">
          <Search size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Institution Not Found</h1>
        <p className="text-slate-500 text-lg mb-8 max-w-md leading-relaxed">
          The institution you are looking for does not exist or is no longer accredited by CTSDA.
        </p>
        <Link href="/directory" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5">
          <ArrowLeft size={18} /> Back to Directory
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PremiumHeader />

      {/* Hero Cover */}
      <div className="h-64 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10 pt-8">
          <Link href="/directory" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold transition-all">
            <ArrowLeft size={16} /> All Institutions
          </Link>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="container mx-auto px-6 -mt-24 relative z-20 w-full mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 relative"
        >
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            
            {/* Logo */}
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden -mt-24 md:-mt-28 z-10 relative">
              {institution.logoUrl ? (
                <img src={institution.logoUrl} alt={institution.name} className="w-full h-full object-contain p-3" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-4xl font-black text-blue-600">
                  {institution.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{institution.name}</h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold tracking-wide">
                  <CheckCircle2 size={14} /> ACCREDITED
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-slate-500 text-sm font-medium mb-5">
                {institution.country && (
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {institution.country}</span>
                )}
                {institution.institutionType && (
                  <span className="flex items-center gap-1.5 capitalize"><Building size={16} /> {institution.institutionType}</span>
                )}
                {institution.yearEstablished && (
                  <span className="flex items-center gap-1.5"><Calendar size={16} /> Est. {institution.yearEstablished}</span>
                )}
              </div>

              {trainingAreas.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {trainingAreas.map((a: string, i: number) => (
                    <span key={i} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-semibold">{a}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 md:mt-2">
              <button onClick={handleShare} className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                <Share2 size={16} /> {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Accreditation Banner */}
          <div className="mx-6 md:mx-10 mb-8 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center gap-5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck size={24} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-emerald-800 mb-1">Officially Accredited by CTSDA</h4>
              <p className="text-sm text-emerald-700 m-0">This institution meets all requirements of the Council For Training Skills & Development America. Valid until <strong className="font-bold">{validUntil}</strong>.</p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Status</p>
              <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div> Active
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Body Content */}
      <main className="container mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <SectionCard title="About the Institution" icon={<GraduationCap size={20} />} delay={0.1}>
            <p className={`text-[15px] leading-relaxed ${institution.description ? 'text-slate-600' : 'text-slate-400 italic'}`}>
              {institution.description || 'No description has been provided for this institution yet.'}
            </p>
          </SectionCard>

          <SectionCard title="Programs & Certificates Offered" icon={<Award size={20} />} delay={0.2}>
            {programs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {programs.map((p: any, i: number) => (
                  <div key={i} className="flex items-start sm:items-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors">
                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 leading-tight">{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No specific programs listed yet.</p>
            )}
          </SectionCard>

          {trainingAreas.length > 0 && (
            <SectionCard title="Areas of Training" icon={<GraduationCap size={20} />} delay={0.3}>
              <div className="flex flex-wrap gap-2.5">
                {trainingAreas.map((a: string, i: number) => (
                  <span key={i} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-4 py-2 text-sm font-semibold">{a}</span>
                ))}
              </div>
            </SectionCard>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-8">
          
          <SectionCard title="Quick Info" icon={<Building size={20} />} delay={0.1}>
            <InfoRow label="Founded" value={institution.yearEstablished || '—'} />
            <InfoRow label="Type" value={<span className="capitalize">{institution.institutionType || '—'}</span>} />
            <InfoRow label="Reg. Number" value={institution.registrationNumber || '—'} />
            <InfoRow label="Country" value={institution.country || '—'} />
            {programs.length > 0 && <InfoRow label="Programs" value={programs.length} />}
          </SectionCard>

          <SectionCard title="Contact Information" icon={<Mail size={20} />} delay={0.2}>
            {institution.email && <ContactRow icon={<Mail size={18} />} label="Email" value={institution.email} href={`mailto:${institution.email}`} />}
            {institution.website && <ContactRow icon={<Globe size={18} />} label="Website" value={institution.website} href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} />}
            {institution.phone && <ContactRow icon={<Phone size={18} />} label="Phone" value={institution.phone} href={`tel:${institution.phone}`} />}
            {institution.address && <ContactRow icon={<MapPin size={18} />} label="Address" value={`${institution.address}${institution.country ? `, ${institution.country}` : ''}`} />}
          </SectionCard>

          {institution.socialLinks?.length > 0 && (
            <SectionCard title="Social Media" icon={<Globe size={20} />} delay={0.3}>
              <div className="flex flex-wrap gap-2">
                {institution.socialLinks.map((s: any) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors">
                    {s.platform} <ExternalLink size={14} className="text-slate-400" />
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Verification CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-[1.5rem] bg-gradient-to-br from-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/20">
                <ShieldCheck size={24} className="text-blue-300" />
              </div>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">Certificate Verification</p>
              <h3 className="text-xl font-bold mb-3">Verify a Certificate</h3>
              <p className="text-blue-100/70 text-sm mb-6 leading-relaxed">
                Authenticate certificates issued by this institution through CTSDA's official verification portal.
              </p>
              <Link href="/verify-certificate" className="block w-full text-center bg-white hover:bg-blue-50 text-blue-700 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-lg">
                Verify Now
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}
