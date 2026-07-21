import React from 'react';
import { PortalHeader } from '../../components/portal-header';
import { AuthProvider } from '../../components/auth-provider';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="portal-shell">
        <PortalHeader />
        <main className="portal-main">{children}</main>
      </div>
    </AuthProvider>
  );
}
