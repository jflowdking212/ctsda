import { z } from 'zod';
import { AccreditationStatus } from './enums';

export const AccreditationResponseSchema = z.object({
  id: z.string().uuid(),
  institutionId: z.string().uuid(),
  applicationId: z.string().uuid(),
  accreditationCode: z.string(),
  status: AccreditationStatus,
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  suspendedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AccreditationResponseSchema = z.infer<typeof AccreditationResponseSchema>;

export const CertificateResponseSchema = z.object({
  id: z.string().uuid(),
  accreditationId: z.string().uuid(),
  certificateNumber: z.string(),
  verificationToken: z.string(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  status: AccreditationStatus,
  pdfUrl: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CertificateResponseSchema = z.infer<typeof CertificateResponseSchema>;

export const CertificateVerificationResponseSchema = z.object({
  isValid: z.boolean(),
  certificateNumber: z.string(),
  institutionName: z.string(),
  institutionCountry: z.string(),
  accreditationCode: z.string(),
  status: AccreditationStatus,
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  trainingAreas: z.array(z.string()),
  verifiedAt: z.string().datetime(),
});

export type CertificateVerificationResponseSchema = z.infer<typeof CertificateVerificationResponseSchema>;

export const VerificationEventSchema = z.object({
  id: z.string().uuid(),
  certificateId: z.string().uuid(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  verifiedAt: z.string().datetime(),
});

export type VerificationEventSchema = z.infer<typeof VerificationEventSchema>;

export const InstitutionDirectoryFilterSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  trainingArea: z.string().optional(),
  accreditationStatus: AccreditationStatus.optional(),
  institutionType: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type InstitutionDirectoryFilterSchema = z.infer<typeof InstitutionDirectoryFilterSchema>;