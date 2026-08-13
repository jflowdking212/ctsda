'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CheckCircle2, Building, ShieldCheck, ArrowRight, Filter, ChevronDown } from 'lucide-react';

export default function DirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  useEffect(() => {
    async function fetchDirectory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/institutions/public-accredited`);
        if (res.ok) setInstitutions(await res.json());
      } catch (err) {
        console.error('Failed to load directory', err);
      } finally { setLoading(false); }
    }
    fetchDirectory();
  }, []);

  const countries = ['All', ...Array.from(new Set(institutions.map(i => i.country).filter(Boolean)))];

  const filtered = institutions.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || i.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PremiumHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 pt-24 pb-48">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold tracking-wide uppercase mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Official Accredited Directory
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
          >
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Accredited</span><br />Institutions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Discover verified training providers globally that have met CTSDA's rigorous quality assurance standards and criteria.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 w-full"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by institution name or keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/15 backdrop-blur-md transition-all text-base"
              />
            </div>
            
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Filter size={20} />
              </div>
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/10 border border-white/20 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/15 backdrop-blur-md transition-all text-base cursor-pointer"
              >
                {countries.map(country => (
                  <option key={country} value={country} className="text-slate-900">{country}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={20} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 -mt-24 relative z-20 pb-24 flex-1">
        
        {/* Stats Row */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {[
              { value: institutions.length, label: 'Accredited Institutions', icon: <Building className="text-blue-600" size={24} />, bg: 'bg-blue-50', border: 'border-blue-100' },
              { value: countries.length - 1, label: 'Countries Represented', icon: <MapPin className="text-emerald-600" size={24} />, bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { value: 'Active', label: 'Network Status', icon: <ShieldCheck className="text-indigo-600" size={24} />, bg: 'bg-indigo-50', border: 'border-indigo-100' },
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl bg-white border ${stat.border} p-6 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow`}>
                <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Directory Grid */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-bold text-slate-900">
            {searchTerm || selectedCountry !== 'All' 
              ? `Search Results (${filtered.length})` 
              : 'All Accredited Institutions'}
          </h2>
          {(searchTerm || selectedCountry !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCountry('All'); }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-medium text-slate-500 animate-pulse">Loading global directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No institutions found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't find any accredited institutions matching your current search criteria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCountry('All'); }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-200"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map((inst, idx) => (
                <motion.div
                  key={inst.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Link href={`/directory/${inst.slug || inst.id}`} className="group block h-full">
                    <div className="h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                      {/* Card Header Banner */}
                      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                      </div>
                      
                      <div className="relative px-6 pb-6 pt-14 flex-1 flex flex-col">
                        {/* Logo Box */}
                        <div className="absolute top-0 left-6 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden z-10 shrink-0">
                          {inst.logoUrl ? (
                            <img src={inst.logoUrl} alt={inst.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600">
                              {inst.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide border border-emerald-200">
                            <CheckCircle2 size={14} /> CTSDA ACCREDITED
                          </span>
                        </div>

                        {/* Title & Info */}
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                          {inst.name}
                        </h3>

                        {inst.country && (
                          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-auto pt-4">
                            <MapPin size={16} className="text-slate-400" /> {inst.country}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-white transition-colors">View Profile</span>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <PremiumFooter />
    </div>
  );
}
