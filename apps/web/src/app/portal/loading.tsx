export default function PortalLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Portal header skeleton */}
      <div
        style={{
          height: '64px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1.5rem',
        }}
      >
        <div className="skeleton" style={{ height: '28px', width: '120px', borderRadius: '6px', backgroundColor: '#e2e8f0' }} />
        <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '4px', backgroundColor: '#f1f5f9', marginLeft: 'auto' }} />
        <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
        <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
      </div>

      {/* Content area */}
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.5rem',
          flex: 1,
        }}
      >
        {/* Page header skeleton */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="skeleton" style={{ height: '12px', width: '80px', borderRadius: '4px', backgroundColor: '#e2e8f0', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: '36px', width: '260px', borderRadius: '8px', backgroundColor: '#e2e8f0', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: '16px', width: '420px', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '40px', width: '180px', borderRadius: '8px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Cards skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <div className="skeleton" style={{ height: '6px', backgroundColor: '#dde6f0' }} />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70px', borderRadius: '999px', backgroundColor: '#e2e8f0' }} />
                  <div className="skeleton" style={{ height: '16px', width: '80px', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
                </div>
                <div className="skeleton" style={{ height: '22px', width: '85%', borderRadius: '6px', backgroundColor: '#e2e8f0', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '95%', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '0.35rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px', backgroundColor: '#f1f5f9', marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: '#e2e8f0' }} />
                  <div className="skeleton" style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9' }} />
                </div>
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
    </div>
  );
}
