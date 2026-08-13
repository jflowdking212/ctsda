'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/training', label: 'Training' },
  { href: '/directory', label: 'Directory' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function PremiumHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Use a completely transparent background on top, glassmorphism when scrolled
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled 
      ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg py-3' 
      : 'bg-transparent py-5'
  }`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform duration-300">
            <img src="/images/logo-ctsda.png" alt="CTSDA Logo" loading="eager" className="w-full h-full object-contain" />
          </div>
          <span className="flex flex-col">
            <strong className="text-white text-xl font-black tracking-tight leading-none group-hover:text-blue-400 transition-colors">CTSDA</strong>
            <small className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden md:block">Accreditation Council</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'text-white bg-blue-600 shadow-lg shadow-blue-500/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="/portal/login" 
            className="hidden md:inline-flex items-center text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Portal Login
          </Link>
          <Link 
            href="/apply" 
            className="inline-flex items-center bg-white text-slate-900 hover:bg-slate-100 px-6 py-2.5 rounded-full text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
          >
            Apply Now
          </Link>

          <button
            type="button"
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-40 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full px-6 pt-24 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-4 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-black transition-colors ${pathname === item.href ? 'text-blue-400' : 'text-white hover:text-blue-300'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/portal/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 text-center rounded-xl bg-white/10 text-white font-bold text-lg"
            >
              Portal Login
            </Link>
            <Link
              href="/apply"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 text-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20"
            >
              Apply for Accreditation
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
