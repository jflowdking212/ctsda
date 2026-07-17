import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'CTSDA | Council for Training, Skills & Development America',
    template: '%s | CTSDA',
  },
  description:
    'Council for Training, Skills & Development America accreditation, public directory, and certificate verification platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
