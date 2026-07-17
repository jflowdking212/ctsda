import { z } from 'zod';

export const ApplicationStatus = z.enum([
  'draft',
  'submitted',
  'initial_screening',
  'payment_pending',
  'under_review',
  'changes_requested',
  'resubmitted',
  'final_review',
  'approved',
  'rejected',
  'withdrawn',
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const AccreditationStatus = z.enum([
  'active',
  'suspended',
  'expired',
  'revoked',
]);
export type AccreditationStatus = z.infer<typeof AccreditationStatus>;

export const UserRole = z.enum([
  'super_admin',
  'reviewer',
  'finance_officer',
  'support_officer',
  'content_manager',
  'auditor',
  'applicant',
]);
export type UserRole = z.infer<typeof UserRole>;

export const DocumentType = z.enum([
  'certificate_of_incorporation',
  'business_license',
  'tax_clearance',
  'accreditation_certificate',
  'financial_statement',
  'staff_qualification',
  'curriculum',
  'facility_document',
  'insurance_certificate',
  'other',
]);
export type DocumentType = z.infer<typeof DocumentType>;

export const DocumentStatus = z.enum([
  'pending',
  'clean',
  'quarantined',
  'rejected',
]);
export type DocumentStatus = z.infer<typeof DocumentStatus>;

export const PaymentStatus = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const InvoiceStatus = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
  'refunded',
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

export const NotificationType = z.enum([
  'account_created',
  'email_verified',
  'application_submitted',
  'application_status_changed',
  'reviewer_assigned',
  'changes_requested',
  'approved',
  'rejected',
  'certificate_issued',
  'payment_received',
  'payment_failed',
  'expiry_reminder',
  'password_changed',
  'security_alert',
]);
export type NotificationType = z.infer<typeof NotificationType>;

export const AuditAction = z.enum([
  'login',
  'login_failed',
  'logout',
  'password_change',
  'role_change',
  'user_created',
  'user_deactivated',
  'application_created',
  'application_submitted',
  'application_status_changed',
  'reviewer_assigned',
  'document_uploaded',
  'document_deleted',
  'payment_processed',
  'refund_issued',
  'certificate_issued',
  'certificate_revoked',
  'institution_created',
  'institution_updated',
  'export_performed',
]);
export type AuditAction = z.infer<typeof AuditAction>;