import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1a365d', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700 }}>CTSDA</Link>
        <nav>
          <Link href="/portal/applications" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>My Applications</Link>
          <Link href="/auth/logout" style={{ color: 'white', textDecoration: 'none' }}>Logout</Link>
        </nav>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}