'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PremiumHeader } from '../../components/premium-header';
import { PremiumFooter } from '../../components/premium-footer';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

export default function DirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countries = new Set(institutions.map(i => i.country).filter(Boolean)).size;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .dir-card { animation: fadeInUp .5s ease both; transition: transform .25s ease, box-shadow .25s ease; }
        .dir-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(15,23,42,.14) !important; }
        .dir-card:hover .card-cta { background: linear-gradient(135deg,#2563eb,#4f46e5) !important; color: #fff !important; }
        .search-input { transition: all .2s ease; }
        .search-input:focus { outline: none; border-color: rgba(255,255,255,.5) !important; box-shadow: 0 0 0 4px rgba(255,255,255,.1) !important; background: rgba(255,255,255,.18) !important; }
        .search-input::placeholder { color: rgba(255,255,255,.4); }
        .stat-pill:hover { transform: scale(1.02); }
      `}</style>

      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6fb' }}>
        <PremiumHeader />

        {/* ── HERO ── */}
        <section style={{
          background: 'linear-gradient(160deg, #0b1428 0%, #0f2258 45%, #0a1a6e 100%)',
          padding: '72px 24px 120px',
          position: 'relative', overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* animated orbs */}
          <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)', pointerEvents:'none' }}/>
          {/* dot grid */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.07) 1px, transparent 0)', backgroundSize:'30px 30px', pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:2, maxWidth:'700px', margin:'0 auto' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', borderRadius:'100px', padding:'6px 18px', marginBottom:'28px', color:'#93c5fd', fontSize:'12px', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', animation:'shimmer 2s ease infinite' }}/>
              Official CTSDA Accredited Directory
            </div>

            <h1 style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:900, color:'#fff', lineHeight:1.08, letterSpacing:'-.03em', marginBottom:'20px' }}>
              Accredited<br /><span style={{ background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Institutions</span> Directory
            </h1>
            <p style={{ fontSize:'18px', color:'rgba(255,255,255,.65)', lineHeight:1.7, marginBottom:'44px', fontWeight:400 }}>
              Discover verified training providers and institutions that meet<br />CTSDA's rigorous international quality standards.
            </p>

            {/* Search */}
            <div style={{ position:'relative', maxWidth:'520px', margin:'0 auto' }}>
              <div style={{ position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.5)', pointerEvents:'none' }}>
                <SearchIcon />
              </div>
              <input
                className="search-input"
                type="text"
                placeholder="Search by institution name or country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width:'100%', padding:'16px 20px 16px 52px', fontSize:'15px', fontWeight:500,
                  background:'rgba(255,255,255,.12)', border:'1.5px solid rgba(255,255,255,.2)',
                  borderRadius:'14px', color:'#fff', backdropFilter:'blur(12px)',
                }}
              />
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <main style={{ flex:1, maxWidth:'1200px', width:'100%', margin:'-56px auto 0', padding:'0 24px 80px', zIndex:10, position:'relative' }}>

          {/* Stats row */}
          {!loading && (
            <div style={{ display:'flex', gap:'12px', marginBottom:'32px', flexWrap:'wrap' }}>
              {[
                { value: institutions.length, label: 'Accredited Institutions', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                { value: countries, label: 'Countries Represented', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
                { value: 'Active', label: 'All Statuses', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
              ].map((s, i) => (
                <div key={i} className="stat-pill" style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  background:'#fff', border:`1px solid ${s.border}`, borderRadius:'14px',
                  padding:'14px 22px', boxShadow:'0 2px 12px rgba(0,0,0,.06)',
                  transition:'transform .2s',
                }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:s.color, boxShadow:`0 0 0 4px ${s.bg}` }}/>
                  <div>
                    <p style={{ fontSize:'22px', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{s.value}</p>
                    <p style={{ fontSize:'12px', color:'#64748b', fontWeight:500, marginTop:'3px' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section header */}
          {!loading && filtered.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:700, color:'#0f172a' }}>
                {searchTerm ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchTerm}"` : 'All Accredited Institutions'}
              </h2>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ background:'none', border:'none', color:'#2563eb', cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'300px', gap:'16px' }}>
              <div style={{ width:'44px', height:'44px', border:'3px solid #e2e8f0', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
              <p style={{ color:'#64748b', fontSize:'15px', fontWeight:500 }}>Loading accredited institutions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:'20px', border:'1px dashed #cbd5e1' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:'#f1f5f9', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SearchIcon />
              </div>
              <h3 style={{ fontSize:'20px', fontWeight:700, color:'#0f172a', marginBottom:'10px' }}>No institutions found</h3>
              <p style={{ color:'#64748b', marginBottom:'24px' }}>No results matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:'10px', padding:'11px 28px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Clear Search</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px' }}>
              {filtered.map((inst, idx) => (
                <Link key={inst.id} href={`/directory/${inst.slug || inst.id}`} style={{ textDecoration:'none', color:'inherit' }}>
                  <article className="dir-card" style={{ background:'#fff', borderRadius:'20px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)', border:'1px solid #e8eef5', animationDelay:`${idx*55}ms` }}>
                    {/* Card top banner */}
                    <div style={{ height:'72px', background:'linear-gradient(135deg, #0f2258 0%, #1d4ed8 100%)', position:'relative' }}>
                      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.08) 1px, transparent 0)', backgroundSize:'16px 16px' }}/>
                    </div>

                    <div style={{ padding:'0 24px 24px' }}>
                      {/* Logo floating over banner */}
                      <div style={{
                        width:'72px', height:'72px', borderRadius:'16px',
                        background:'#fff', border:'3px solid #fff',
                        boxShadow:'0 4px 20px rgba(0,0,0,.12)',
                        marginTop:'-36px', marginBottom:'16px',
                        overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={inst.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:'6px' }}/>
                        ) : (
                          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#dbeafe,#e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:800, color:'#1d4ed8' }}>
                            {inst.name.substring(0,2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Badge */}
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:'100px', padding:'3px 10px', fontSize:'11px', fontWeight:700, letterSpacing:'.02em', marginBottom:'10px' }}>
                        <CheckIcon /> ACCREDITED
                      </div>

                      <h3 style={{ fontSize:'17px', fontWeight:700, color:'#0f172a', lineHeight:1.3, marginBottom:'10px' }}>{inst.name}</h3>

                      {inst.country && (
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#64748b', fontSize:'13px', fontWeight:500 }}>
                          <MapPinIcon /> {inst.country}
                        </div>
                      )}
                    </div>

                    {/* CTA footer */}
                    <div className="card-cta" style={{ margin:'0 16px 16px', borderRadius:'12px', padding:'12px 16px', background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all .25s ease' }}>
                      <span style={{ fontSize:'13px', fontWeight:600, color:'inherit' }}>View Full Profile</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </main>

        <PremiumFooter />
      </div>
    </>
  );
}
