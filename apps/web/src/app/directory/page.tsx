export const dynamic = 'force-dynamic';

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; country?: string }> }) {
  const filters = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  let institutions: any[] = [];

  try {
    const res = await fetch(`${baseUrl}/reviews/institutions`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      institutions = Array.isArray(data) ? data : [];
    }
  } catch {
    // offline/dev fallback
  }

  const query = (filters.q || '').toLowerCase();
  const country = (filters.country || '').toLowerCase();
  institutions = institutions.filter((inst) => {
    const matchesQuery = !query || inst.name?.toLowerCase().includes(query) || inst.institutionType?.toLowerCase().includes(query);
    const matchesCountry = !country || inst.country?.toLowerCase() === country;
    return matchesQuery && matchesCountry;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Institution Directory</h1>
      <form style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <input name="q" defaultValue={filters.q || ''} placeholder="Search institutions" style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: 4, flex: '1 1 220px' }} />
        <input name="country" defaultValue={filters.country || ''} placeholder="Country" style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: 4, flex: '1 1 160px' }} />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#1a365d', color: 'white', border: 'none', borderRadius: 4 }}>Filter</button>
      </form>
      {institutions.length === 0 ? (
        <p>No institutions found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {institutions.map((inst) => (
            <a
              key={inst.id}
              href={`/directory/${inst.slug}`}
              style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: 'inherit' }}
            >
              <h3 style={{ margin: '0 0 0.25rem' }}>{inst.name}</h3>
              <p style={{ margin: 0, color: '#4a5568' }}>{inst.country} · {inst.institutionType}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
