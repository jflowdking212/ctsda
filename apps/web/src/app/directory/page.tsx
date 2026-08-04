import { PublicPage } from '../../components/public-shell';

export const dynamic = 'force-dynamic';

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string }>;
}) {
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
    const matchesQuery =
      !query ||
      inst.name?.toLowerCase().includes(query) ||
      inst.institutionType?.toLowerCase().includes(query);
    const matchesCountry = !country || inst.country?.toLowerCase() === country;
    return matchesQuery && matchesCountry;
  });

  return (
    <PublicPage>
      <main className="content-page">
        <header className="content-header">
          <p className="eyebrow">Directory</p>
          <h1>Institution Directory</h1>
          <p>Search accredited institutions and review their public CTSDA recognition details.</p>
        </header>

        <form className="content-panel content-form grid md:grid-cols-2 gap-4">
          <label>
            Search
            <input name="q" defaultValue={filters.q || ''} placeholder="Institution name or type" />
          </label>
          <label>
            Country
            <input name="country" defaultValue={filters.country || ''} placeholder="Country" />
          </label>
          <button className="button primary full-width md:col-span-2" type="submit">
            Filter directory
          </button>
        </form>

        {institutions.length === 0 ? (
          <section className="content-panel">
            <p>No institutions found.</p>
          </section>
        ) : (
          <section className="content-list" aria-label="Institutions">
            {institutions.map((inst) => (
              <a key={inst.id} href={`/directory/${inst.slug}`} className="content-list-card">
                <h3>{inst.name}</h3>
                <p className="meta-line">{inst.country} - {inst.institutionType}</p>
              </a>
            ))}
          </section>
        )}
      </main>
    </PublicPage>
  );
}
