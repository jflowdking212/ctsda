import { CertificateVerifier } from '../../components/certificate-verifier';
import { PublicPage } from '../../components/public-shell';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <PublicPage>
      <main className="content-page narrow">
        <header className="content-header">
          <p className="eyebrow">Verification</p>
          <h1>Verify a Certificate</h1>
          <p>Confirm whether a CTSDA certificate or accreditation token is valid.</p>
        </header>

        <CertificateVerifier initialToken={params.token || ''} />
      </main>
    </PublicPage>
  );
}
