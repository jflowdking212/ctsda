export type EmailTemplateName =
  | 'account_created'
  | 'application_submitted'
  | 'reviewer_assigned'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'certificate_issued'
  | 'expiry_reminder';

export function renderEmailTemplate(name: EmailTemplateName, data: Record<string, string> = {}) {
  const appName = 'CTSDA';
  const subjectByName: Record<EmailTemplateName, string> = {
    account_created: 'Welcome to CTSDA',
    application_submitted: 'Application submitted',
    reviewer_assigned: 'Application assigned for review',
    changes_requested: 'Changes requested',
    approved: 'Application approved',
    rejected: 'Application decision',
    certificate_issued: 'Certificate issued',
    expiry_reminder: 'Accreditation expiry reminder',
  };

  const subject = subjectByName[name];
  const body = data.body || subject;

  return {
    subject,
    html: `<main><h1>${appName}</h1><p>${body}</p></main>`,
  };
}
