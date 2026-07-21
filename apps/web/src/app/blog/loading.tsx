export default function BlogLoading() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header skeleton */}
      <div style={{ height: '72px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }} />

      {/* Hero skeleton */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="skeleton" style={{ height: '14px', width: '120px', borderRadius: '999px', margin: '0 auto 1rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div className="skeleton" style={{ height: '48px', width: '70%', borderRadius: '8px', margin: '0 auto 1rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div className="skeleton" style={{ height: '20px', width: '55%', borderRadius: '8px', margin: '0 auto', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* Image skeleton */}
              <div
                className="skeleton"
                style={{ height: '200px', backgroundColor: '#e2e8f0', width: '100%' }}
              />
              <div style={{ padding: '1.5rem' }}>
                {/* Badge + date row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '999px', backgroundColor: '#e2e8f0' }} />
                  <div className="skeleton" style={{ height: '16px', width: '90px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} />
                </div>
                {/* Title */}
                <div className="skeleton" style={{ height: '22px', width: '90%', borderRadius: '6px', backgroundColor: '#e2e8f0', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '22px', width: '70%', borderRadius: '6px', backgroundColor: '#e2e8f0', marginBottom: '1rem' }} />
                {/* Excerpt lines */}
                <div className="skeleton" style={{ height: '14px', width: '100%', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '0.4rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '85%', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '0.4rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '1.5rem' }} />
                {/* Button */}
                <div className="skeleton" style={{ height: '40px', width: '130px', borderRadius: '8px', backgroundColor: '#e2e8f0' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .skeleton {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
