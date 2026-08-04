'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyCertificatePage() {
  const [certNumber, setCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber) return;

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/accreditations/verify/${encodeURIComponent(certNumber)}`);
      if (!res.ok) {
        throw new Error('Certificate not found or invalid');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCertNumber('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Section */}
      <div className="bg-[#0b1b3d] text-white py-16 px-4 relative overflow-hidden">
        {/* Faint Shield Watermark could go here if we had the asset */}
        <div className="absolute right-10 top-10 opacity-10 pointer-events-none">
          <svg width="200" height="240" viewBox="0 0 100 120" fill="currentColor">
             <path d="M50 0L0 20V50C0 80 20 100 50 120C80 100 100 80 100 50V20L50 0ZM50 105C28 88 15 72 15 50V30L50 15L85 30V50C85 72 72 88 50 105Z"/>
             <text x="50%" y="55%" textAnchor="middle" fontSize="30" fontWeight="bold">CTSD</text>
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {!result ? (
            <>
              <h1 className="text-4xl font-bold mb-4">Verify Your Certificate</h1>
              <p className="text-slate-300 max-w-xl mx-auto text-lg">
                Enter your certificate number to verify its authenticity and confirm it was issued by the Council for Training Skills and Development America.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-slate-400 mb-4 justify-center md:justify-start">
                <Link href="/" className="hover:text-white">Home</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-white">Verify Certificate</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-left">Certificate Verification Result</h1>
              <p className="text-slate-300 text-left">
                Your certificate has been successfully verified.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full px-4 -mt-8 relative z-20 pb-20">
        {!result ? (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto text-center border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto -mt-16 mb-6 shadow-sm border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Certificate Verification</h2>
            <p className="text-slate-500 mb-6 text-sm">Enter the certificate number exactly as it appears on your certificate.</p>
            
            <form onSubmit={handleVerify}>
              <div className="text-left mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Certificate Number</label>
                <input 
                  type="text" 
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. CTSD-2024-123456" 
                  className="w-full border border-slate-300 rounded-md py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-slate-900"
                  required
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0b1b3d] hover:bg-blue-900 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    Verify Certificate
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your information is secure and will not be shared.</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-4 mb-8">
              <div className="bg-green-500 text-white rounded-full p-2 mt-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">Valid Certificate</h3>
                <p className="text-green-700 text-sm mt-1">This certificate is authentic and was issued by the Council for Training Skills and Development America.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Certificate Details</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Certificate Number</span>
                    <span className="font-semibold text-slate-900">{result.certificateNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Institution Name</span>
                    <span className="font-semibold text-slate-900 text-right max-w-[200px]">{result.accreditation?.institution?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Course / Program</span>
                    <span className="font-semibold text-blue-600 text-right max-w-[200px]">
                      {result.accreditation?.application?.offeredCertificates?.[0]?.name || 'Accredited Institution'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Date Issued</span>
                    <span className="font-semibold text-slate-900">{new Date(result.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Expiration Date</span>
                    <span className="font-semibold text-slate-900">{new Date(result.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Certificate Status</span>
                    <span className={`font-semibold ${result.status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-0.5 rounded-full text-xs uppercase tracking-wider`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-center border border-slate-200">
                {result.pdfUrl ? (
                  <div className="relative shadow-md border bg-white p-2">
                    {/* Placeholder for PDF thumbnail. You might want to use a real image if available */}
                    <div className="text-center p-8 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>View Certificate Document</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <p>No document preview available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mb-8 text-blue-800 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>This verification confirms that the certificate above is valid and was issued by the Council for Training Skills and Development America.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-slate-100 pt-8">
              <button onClick={handleReset} className="flex items-center justify-center gap-2 px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verify Another Certificate
              </button>
              {result.pdfUrl && (
                <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Verification
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {!result && (
        <div className="max-w-4xl mx-auto px-4 w-full py-12 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-8">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-blue-200 text-blue-600 flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 1</h4>
              <p className="text-sm text-slate-500">Enter your certificate number in the field above.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-blue-200 text-blue-600 flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 2</h4>
              <p className="text-sm text-slate-500">Our system will verify the certificate in our secure database.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-blue-200 text-blue-600 flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 3</h4>
              <p className="text-sm text-slate-500">Instantly view your verification result and certificate details.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
