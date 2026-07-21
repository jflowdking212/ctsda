import { AdminDashboard } from '../../../components/admin-dashboard';

export const metadata = {
  title: 'Billing & Orders | CTSDA Admin',
};

export default function AdminBillingPage() {
  return <AdminDashboard section="billing" />;
}
