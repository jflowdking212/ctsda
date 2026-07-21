'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalPreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('Loading...');
  const activeRequests = useRef(0);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(false);
    activeRequests.current = 0;
    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      activeRequests.current += 1;
      setLabel('Processing request...');
      setVisible(true);

      try {
        return await originalFetch(...args);
      } finally {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        if (activeRequests.current === 0) {
          setVisible(false);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target || link.hasAttribute('download')) return;

      const nextUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.hash) return;

      setLabel('Loading page...');
      setVisible(true);
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      navigationTimer.current = setTimeout(() => setVisible(false), 8000);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  if (!visible) return null;

  return (
    <div className="global-preloader" role="status" aria-live="polite" aria-label={label}>
      <div className="global-preloader-panel">
        <img src="/images/logo-ctsda.png" alt="" />
        <span className="global-preloader-spinner" />
        <strong>{label}</strong>
      </div>
    </div>
  );
}
