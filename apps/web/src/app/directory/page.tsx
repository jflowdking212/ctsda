'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';

export default function DirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchDirectory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/institutions/public-accredited`);
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
        }
      } catch (err) {
        console.error('Failed to load directory', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDirectory();
  }, []);

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PremiumHeader />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Accredited Institutions Directory
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Discover training providers and institutions that meet our rigorous quality standards.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-lg border-slate-300 rounded-full py-3"
                placeholder="Search by institution name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredInstitutions.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInstitutions.map((institution) => (
                <Link key={institution.id} href={`/directory/${institution.slug || institution.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col overflow-hidden group">
                    <div className="p-8 flex flex-col items-center flex-grow">
                      <div className="w-24 h-24 mb-6 relative rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                        {institution.logoUrl ? (
                          <img
                            src={institution.logoUrl}
                            alt={`${institution.name} logo`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold text-2xl">
                            {institution.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 text-center mb-3 line-clamp-2">
                        {institution.name}
                      </h3>
                      {institution.country && (
                        <div className="flex items-center text-slate-500 mt-auto">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          <span className="text-sm font-medium">{institution.country}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-blue-600 font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      View Full Profile &rarr;
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No institutions found</h3>
              <p className="mt-2 text-slate-500">
                We couldn't find any accredited institutions matching "{searchTerm}".
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-blue-600 font-medium hover:text-blue-500"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
}
