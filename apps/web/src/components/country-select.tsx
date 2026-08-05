'use client';

import React, { useState, useRef, useEffect } from 'react';

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'Nigeria',
  'Kenya',
  'Ghana',
  'Egypt',
  'India',
  'China',
  'Japan',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Belgium',
  'Austria',
  'Ireland',
  'New Zealand',
  'Poland',
  'Portugal',
  'Greece',
  'Turkey',
  'Malaysia',
  'Thailand',
  'Indonesia',
  'Philippines',
  'Vietnam',
  'Pakistan',
  'Bangladesh',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Morocco',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Zambia',
  'Zimbabwe',
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Armenia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Barbados',
  'Belarus',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Gabon',
  'Gambia',
  'Georgia',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'Iraq',
  'Israel',
  'Ivory Coast',
  'Jamaica',
  'Jordan',
  'Kazakhstan',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Maldives',
  'Mali',
  'Malta',
  'Mauritania',
  'Mauritius',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nepal',
  'Nicaragua',
  'Niger',
  'North Macedonia',
  'Oman',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Qatar',
  'Romania',
  'Russia',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Korea',
  'South Sudan',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Tajikistan',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkmenistan',
  'Tuvalu',
  'Ukraine',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Yemen'
];

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function CountrySelect({ value, onChange, disabled, required }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input type="text" value={value} required={required} readOnly style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '100%', height: '100%' }} tabIndex={-1} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: '1px solid #cbd5e1',
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
          backgroundColor: '#ffffff',
          color: value ? '#0f172a' : '#94a3b8',
          outline: 'none',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span>{value || 'Select Country...'}</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <input
              type="text"
              placeholder="🔍 Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }}>
            {filteredCountries.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                No country found
              </div>
            ) : (
              filteredCountries.map((c) => (
                <div
                  key={c}
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    fontSize: '0.875rem',
                    color: value === c ? '#2563eb' : '#334155',
                    fontWeight: value === c ? 700 : 400,
                    backgroundColor: value === c ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== c) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (value !== c) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {c}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
