'use client';

import React from 'react';
import { AuthProvider } from '../../components/auth-provider';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // All authenticated portal pages now use the PortalDashboard component which manages its own
  // layout, sidebar, and header (matching the admin aesthetics).
  // Public pages (login, register) manage their own layout with PremiumHeader.
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
