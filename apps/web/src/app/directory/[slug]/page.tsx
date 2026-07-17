import { notFound } from 'next/navigation';

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
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>{institution.name}</h1>
      <p style={{ color: '#4a5568' }}>{institution.country} · {institution.institutionType}</p>
      <p>{institution.description}</p>
      <div style={{ marginTop: '1rem' }}>
        <h3>Accreditations</h3>
        {institution.accreditations?.length > 0 ? (
          <ul>
            {institution.accreditations.map((acc: any) => (
              <li key={acc.id}>
                {acc.accreditationCode} (valid until {new Date(acc.expiresAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        ) : (
          <p>No active accreditations.</p>
        )}
      </div>
    </div>
  );
}
