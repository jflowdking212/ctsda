import React from 'react';
import { PremiumHeader } from '../../../components/premium-header';
import { PremiumFooter } from '../../../components/premium-footer';

/**
 * Dedicated layout for the portal login page.
 * This overrides the parent portal/layout.tsx for the login route only,
 * replacing the authenticated PortalHeader with the public PremiumHeader.
 */
export default function PortalLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <PremiumHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <PremiumFooter />
    </div>
  );
}
