import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const routes = [
    '',
    '/about',
    '/services',
    '/contact',
    '/legal',
    '/privacy-policy',
    '/terms-of-service',
    '/accreditation-info',
    '/verify',
    '/directory',
  ];

  const entries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  try {
    const response = await fetch(`${apiUrl}/reviews/institutions`, { cache: 'no-store' });
    if (response.ok) {
      const institutions = await response.json();
      if (Array.isArray(institutions)) {
        for (const institution of institutions) {
          entries.push({
            url: `${siteUrl}/directory/${institution.slug}`,
            lastModified: new Date(),
          });
        }
      }
    }
  } catch {
    // API can be offline during local builds.
  }

  return entries;
}
