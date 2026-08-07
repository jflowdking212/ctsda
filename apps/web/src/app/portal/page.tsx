'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal/applications');
  }, [router]);

  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
      Redirecting to applicant portal...
    </div>
  );
}
