import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/accreditation-info', label: 'Accreditation' },
  { href: '/directory', label: 'Directory' },
  { href: '/verify', label: 'Verify' },
  { href: '/contact', label: 'Contact' },
];

export function PublicHeader() {
  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="CTSDA home">
        <span className="brand-seal">C</span>
        <span>
          <strong>CTSDA</strong>
          <small>Council for Training, Skills & Development America</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="header-action" href="/portal/register">
        Apply
      </Link>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link className="brand-mark footer-brand" href="/">
            <span className="brand-seal">C</span>
            <span>
              <strong>CTSDA</strong>
              <small>Global standards in education excellence</small>
            </span>
          </Link>
          <p>
            Independent accreditation services for institutions, trainers, and educational service
            providers committed to quality, transparency, and continuous improvement.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/services">Services</Link>
          <Link href="/directory">Accredited directory</Link>
          <Link href="/verify">Certificate verification</Link>
          <Link href="/legal">Legal & policy</Link>
        </div>
        <div>
          <h2>Contact</h2>
          <p>management@ctsdamerica.com</p>
          <p>The Green, STE A, Dover, Kent, Delaware, United States</p>
          <p>Mon - Fri, 9:00 - 17:00</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright {new Date().getFullYear()} CTSDA. All rights reserved.</span>
        <span>Private, independent international accreditation body.</span>
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="section-inner narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="page-hero-copy">{children}</div>
      </div>
    </section>
  );
}
