import type { Metadata } from 'next';
import './globals.css';
import './styles/premium.css';

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, any> = {};
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/settings/public`, { next: { revalidate: 60 } });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (err) {
    console.error('Failed to load global settings for metadata', err);
  }

  const title = settings.siteTitle || 'CTSDA - Global Standards in Education Excellence';
  const description = settings.siteDescription || settings.metaDescription || 'CTSDA provides comprehensive accreditation services for institutions, trainers, and educational service providers worldwide.';
  const keywords = settings.metaKeywords ? settings.metaKeywords.split(',').map((k: string) => k.trim()) : ['accreditation', 'education', 'training', 'skills development', 'quality assurance'];

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    keywords,
    authors: [{ name: 'CTSDA' }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://ctsda.org',
      title: title,
      description,
      siteName: title,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description,
    },
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var patterns = [/^bis_/i, /^processed_/i];
                function clean(node) {
                  if (!node || node.nodeType !== 1) return;
                  for (var i = node.attributes.length - 1; i >= 0; i -= 1) {
                    var name = node.attributes[i].name;
                    if (patterns.some(function (pattern) { return pattern.test(name); })) {
                      node.removeAttribute(name);
                    }
                  }
                }
                function cleanAll() {
                  clean(document.documentElement);
                  if (document.body) clean(document.body);
                  document.querySelectorAll('*').forEach(clean);
                }
                cleanAll();
                new MutationObserver(function (mutations) {
                  mutations.forEach(function (mutation) {
                    clean(mutation.target);
                    mutation.addedNodes.forEach(clean);
                  });
                }).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="premium-layout" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
