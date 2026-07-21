import { PortalHeader } from '../../components/portal-header';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-shell">
      <PortalHeader />
      <main className="portal-main">{children}</main>
    </div>
  );
}
