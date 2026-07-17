import { z } from 'zod';
import { ApplicationStatus, DocumentType, DocumentStatus } from './enums';
import { InstitutionContactSchema, InstitutionSocialLinkSchema } from './institution';

export const CreateApplicationSchema = z.object({
  institutionId: z.string().uuid(),
  trainingAreaIds: z.array(z.string().uuid()).min(1),
  certificatesOffered: z.array(z.string().min(1)).min(1),
  deliveryMethods: z.array(z.string().min(1)).min(1),
  staffingCount: z.number().int().positive().optional(),
  operationalInfo: z.string().max(2000).optional(),
});

export type CreateApplicationSchema = z.infer<typeof CreateApplicationSchema>;

export const UpdateApplicationSchema = z.object({
  trainingAreaIds: z.array(z.string().uuid()).min(1).optional(),
  certificatesOffered: z.array(z.string().min(1)).min(1).optional(),
  deliveryMethods: z.array(z.string().min(1)).min(1).optional(),
  staffingCount: z.number().int().positive().optional(),
  operationalInfo: z.string().max(2000).optional(),
});

export type UpdateApplicationSchema = z.infer<typeof UpdateApplicationSchema>;

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  institutionId: z.string().uuid(),
  institutionName: z.string(),
  status: ApplicationStatus,
  submittedAt: z.string().datetime().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  reviewedBy: z.string().uuid().nullable(),
  reviewerNotes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ApplicationResponseSchema = z.infer<typeof ApplicationResponseSchema>;

export const ApplicationDetailResponseSchema = ApplicationResponseSchema.extend({
  trainingAreas: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
  })),
  certificatesOffered: z.array(z.string()),
  deliveryMethods: z.array(z.string()),
  staffingCount: z.number().int().nullable(),
  operationalInfo: z.string().nullable(),
  documents: z.array(z.object({
    id: z.string().uuid(),
    documentType: DocumentType,
    fileName: z.string(),
    fileSize: z.number(),
    status: DocumentStatus,
    version: z.number(),
    uploadedAt: z.string().datetime(),
  })),
  checklistItems: z.array(z.object({
    id: z.string().uuid(),
    label: z.string(),
    isCompleted: z.boolean(),
    completedBy: z.string().uuid().nullable(),
    completedAt: z.string().datetime().nullable(),
  })),
  statusHistory: z.array(z.object({
    id: z.string().uuid(),
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    changedBy: z.string().uuid(),
    reason: z.string().nullable(),
    createdAt: z.string().datetime(),
  })),
});

export type ApplicationDetailResponseSchema = z.infer<typeof ApplicationDetailResponseSchema>;

export const ApplicationStatusHistorySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  changedBy: z.string().uuid(),
  reason: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type ApplicationStatusHistorySchema = z.infer<typeof ApplicationStatusHistorySchema>;

export const ApplicationReviewSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  decision: ApplicationStatus,
  comments: z.string().max(2000),
  isInternal: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type ApplicationReviewSchema = z.infer<typeof ApplicationReviewSchema>;

export const CreateApplicationCommentSchema = z.object({
  applicationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  isInternal: z.boolean().default(false),
});

export type CreateApplicationCommentSchema = z.infer<typeof CreateApplicationCommentSchema>;

export const ApplicationCommentResponseSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorRole: z.string(),
  content: z.string(),
  isInternal: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ApplicationCommentResponseSchema = z.infer<typeof ApplicationCommentResponseSchema>;

export const ApplicationFilterSchema = z.object({
  status: ApplicationStatus.optional(),
  reviewerId: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'submittedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ApplicationFilterSchema = z.infer<typeof ApplicationFilterSchema>;