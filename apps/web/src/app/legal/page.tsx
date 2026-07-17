export const metadata = {
  title: 'Legal',
  description: 'Privacy Policy and Terms of Service',
};

export default function LegalPage() {
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Legal</h1>
      <h2>Privacy Policy</h2>
      <p>We respect your privacy and protect your personal data.</p>
      <h2>Terms of Service</h2>
      <p>By using this site, you agree to these terms.</p>
    </div>
  );
}