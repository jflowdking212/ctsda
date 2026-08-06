'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PortalHeader } from '../../components/portal-header';
import { AuthProvider } from '../../components/auth-provider';

/**
 * Public portal routes that manage their own header/footer (PremiumHeader + PremiumFooter).
 * For these routes, skip the authenticated portal shell entirely so they are not
 * nested inside <PortalHeader> + <main class="portal-main">.
 */
const PUBLIC_PORTAL_PATHS = [
  '/portal/login',
  '/portal/register',
  '/portal/verify-email',
  '/portal/setup-account',
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PORTAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // Public pages (login, register, etc.) render their own PremiumHeader/Footer.
  // Return children directly — no portal shell, no PortalHeader.
  if (isPublic) {
    return <>{children}</>;
  }

  // Authenticated portal pages get the full portal shell with PortalHeader.
  return (
    <AuthProvider>
      <div className="portal-shell">
        <PortalHeader />
        <main className="portal-main">{children}</main>
      </div>
    </AuthProvider>
  );
}
