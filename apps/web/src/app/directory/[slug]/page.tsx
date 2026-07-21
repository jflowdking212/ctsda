import { notFound } from 'next/navigation';
import { PublicPage } from '../../../components/public-shell';

export const dynamic = 'force-dynamic';

async function getInstitution(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${baseUrl}/reviews/institutions`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const institution = Array.isArray(data) ? data.find((i: any) => i.slug === slug) : null;
    return institution || null;
  } catch {
    return null;
  }
}

export default async function InstitutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const institution = await getInstitution(slug);

  if (!institution) {
    notFound();
  }

  return (
    <PublicPage>
      <main className="content-page">
        <header className="content-header">
          <p className="eyebrow">Accredited institution</p>
          <h1>{institution.name}</h1>
          <p>{institution.country} - {institution.institutionType}</p>
        </header>

        <section className="content-panel">
          <h2>Institution profile</h2>
          <p>{institution.description || 'No public description has been provided yet.'}</p>
        </section>

        <section className="content-panel">
          <h2>Accreditations</h2>
          {institution.accreditations?.length > 0 ? (
            <div className="content-list">
              {institution.accreditations.map((acc: any) => (
                <div className="content-list-card" key={acc.id}>
                  <h3>{acc.accreditationCode}</h3>
                  <p className="meta-line">Valid until {new Date(acc.expiresAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No active accreditations.</p>
          )}
        </section>
      </main>
    </PublicPage>
  );
}
