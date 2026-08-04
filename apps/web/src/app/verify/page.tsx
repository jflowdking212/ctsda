import { IsolatedCertificateVerifier } from '../../components/isolated-certificate-verifier';
import { PublicPage } from '../../components/public-shell';

export const metadata = {
  title: 'Verify Certificate | CTSDA',
  description: 'Enter the CTSDA assigned Certificate number to check its validity and official accreditation status.',
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <PublicPage>
      <IsolatedCertificateVerifier initialToken={params.token || ''} />
    </PublicPage>
  );
}
