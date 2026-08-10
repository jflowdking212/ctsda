'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { MapPin, Mail, Globe, Calendar, Building, CheckCircle2, ShieldCheck, Share2, Star } from 'lucide-react';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

export default function InstitutionPage() {
  const { slug } = useParams();
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstitution() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/institutions/public-accredited/${slug}`);
        if (!response.ok) {
          setInstitution(null);
        } else {
          const data = await response.json();
          setInstitution(data);
        }
      } catch (err) {
        console.error('Failed to load institution', err);
        setInstitution(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchInstitution();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PremiumHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PremiumHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <Building className="h-16 w-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Institution Not Found</h1>
          <p className="text-slate-500 mt-2">The institution you are looking for does not exist or is no longer accredited.</p>
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
  const trainingAreas = approvedApp?.trainingAreas?.map((ta: any) => ta.trainingArea.name) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PremiumHeader />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Header Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>
            
            <div className="px-6 sm:px-10 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 mb-6 gap-6 relative z-10">
                {/* Logo */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center p-4 overflow-hidden shrink-0">
                  {institution.logoUrl ? (
                    <img
                      src={institution.logoUrl}
                      alt={`${institution.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-300 font-bold text-4xl">
                      {institution.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Title & Badge */}
                <div className="flex-grow pb-2">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl font-bold text-slate-900">{institution.name}</h1>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Accredited
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Valid until: {validUntil}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        <Star className="w-4 h-4 mr-2" />
                        Review / Evaluate
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-2 text-slate-400" />
                        Share Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badges row for training areas (instead of certificates to keep it clean) */}
              {trainingAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {trainingAreas.map((area: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (About & Programs) */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">About the Institute</h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  {institution.description ? (
                    <p>{institution.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">No description provided.</p>
                  )}
                </div>
              </div>

              {/* Programs Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Programs & Certificates Offered</h2>
                {programs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {programs.map((prog: any, idx: number) => (
                      <div key={idx} className="flex items-start p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-800">{prog.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No specific programs listed.</p>
                )}
              </div>
            </div>

            {/* Right Column (Quick Info & Contact) */}
            <div className="space-y-8">
              {/* Quick Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Quick Info</h2>
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-500">Founded</span>
                    <span className="font-semibold text-slate-900">{institution.yearEstablished || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-500">Type</span>
                    <span className="font-semibold text-slate-900 capitalize">{institution.institutionType || 'Institute'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-500">Reg. Number</span>
                    <span className="font-semibold text-slate-900">{institution.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Programs</span>
                    <span className="font-semibold text-slate-900">{programs.length > 0 ? programs.length : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Contact Information</h2>
                <div className="space-y-6">
                  {institution.email && (
                    <div className="flex items-start">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-4">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-1">Email</p>
                        <a href={`mailto:${institution.email}`} className="text-slate-600 hover:text-blue-600 transition-colors">
                          {institution.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {institution.website && (
                    <div className="flex items-start">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-4">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-1">Website</p>
                        <a href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">
                          {institution.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Address</p>
                      <p className="text-slate-600 leading-relaxed">
                        {institution.address}
                        {institution.country && <><br/>{institution.country}</>}
                      </p>
                    </div>
                  </div>
                  
                  {/* Social Media Links (if any) */}
                  {institution.socialLinks && institution.socialLinks.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 mb-3">Social Media</p>
                      <div className="flex gap-3">
                        {institution.socialLinks.map((social: any) => (
                          <a 
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors capitalize text-xs font-medium"
                          >
                            {social.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
}
