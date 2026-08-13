'use client';

import React, { useEffect, useState } from 'react';
import { PageHero, PublicPage } from '../../components/public-shell';

export default function AccreditationInfoPage() {
  const [accreditationFee, setAccreditationFee] = useState<string>('500');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/settings/public`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.accreditationFee) {
          setAccreditationFee(data.accreditationFee);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <PublicPage>
      <main>
        <PageHero eyebrow="Accreditation information" title="A disciplined review process with a clear outcome.">
          <p>
            Accreditation confirms that an institution meets defined CTSDA expectations for
            training delivery, assessment, staff qualifications, governance, and learner support.
          </p>
        </PageHero>
        <section className="section process-section">
          <div className="container">
            <div className="process-grid">
              {[
                ['01', 'Apply', 'Create your applicant profile and submit the institutional form.'],
                ['02', 'Document', 'Upload evidence covering programs, policies, staffing, and facilities.'],
                ['03', 'Review', 'CTSDA reviewers assess readiness, request clarification, and complete evaluation.'],
                ['04', 'Publish', 'Approved institutions receive accreditation records and public verification.'],
              ].map(([step, title, text]) => (
                <article className="process-card" key={title}>
                  <span>{step}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            {/* ACCREDITATION FEES & PRICING STRUCTURE */}
            <div style={{ marginTop: '3.5rem', backgroundColor: '#f8fafc', padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🏷️</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Accreditation Fee Structure</h2>
              </div>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                CTSDA maintains a transparent pricing model to ensure accessible, high-quality accreditation for corporate training providers, technical institutes, software academies, and educational institutions worldwide.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Application Submission</h3>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem 0' }}>FREE ($0)</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Submitting your institution application and completing initial email verification incurs no cost.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Accreditation & Certification</h3>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', margin: '0 0 0.5rem 0' }}>${accreditationFee} USD</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Payable only after your institution is reviewed and approved by the CTSDA Board. Includes certificate issuance and public registry listing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}
