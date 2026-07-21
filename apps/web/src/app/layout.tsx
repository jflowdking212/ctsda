import type { Metadata } from 'next';
import { GlobalPreloader } from '../components/global-preloader';
import './globals.css';
import './styles/premium.css';

export const metadata: Metadata = {
  title: {
    template: '%s | CTSDA - Council for Training, Skills & Development America',
    default: 'CTSDA - Global Standards in Education Excellence',
  },
  description: 'CTSDA provides comprehensive accreditation services for institutions, trainers, and educational service providers worldwide. Setting global standards in education excellence.',
  keywords: ['accreditation', 'education', 'training', 'skills development', 'quality assurance'],
  authors: [{ name: 'CTSDA' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ctsda.org',
    title: 'CTSDA - Council for Training, Skills & Development America',
    description: 'Global standards in education excellence',
    siteName: 'CTSDA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CTSDA - Council for Training, Skills & Development America',
    description: 'Global standards in education excellence',
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
        <GlobalPreloader />
        {children}
      </body>
    </html>
  );
}
