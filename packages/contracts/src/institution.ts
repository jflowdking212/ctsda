import { z } from 'zod';

export const InstitutionContactSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(20),
  isPrimary: z.boolean().default(false),
});

export type InstitutionContactSchema = z.infer<typeof InstitutionContactSchema>;

export const InstitutionSocialLinkSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z.string().min(1).max(50),
  url: z.string().url(),
});

export type InstitutionSocialLinkSchema = z.infer<typeof InstitutionSocialLinkSchema>;

export const CreateInstitutionSchema = z.object({
  name: z.string().min(1).max(300),
  registrationNumber: z.string().min(1).max(100),
  institutionType: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  phone: z.string().max(20),
  email: z.string().email(),
  website: z.string().url().optional(),
  yearEstablished: z.number().int().min(1800).max(2100).optional(),
  description: z.string().max(2000).optional(),
  contacts: z.array(InstitutionContactSchema).min(1).max(10),
  socialLinks: z.array(InstitutionSocialLinkSchema).max(20).optional(),
  trainingAreaIds: z.array(z.string().uuid()).min(1).optional(),
});

export type CreateInstitutionSchema = z.infer<typeof CreateInstitutionSchema>;

export const UpdateInstitutionSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  institutionType: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  yearEstablished: z.number().int().min(1800).max(2100).optional(),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateInstitutionSchema = z.infer<typeof UpdateInstitutionSchema>;

export const InstitutionResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  registrationNumber: z.string(),
  institutionType: z.string(),
  country: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  yearEstablished: z.number().int().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  accreditationStatus: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type InstitutionResponseSchema = z.infer<typeof InstitutionResponseSchema>;

export const InstitutionDetailResponseSchema = InstitutionResponseSchema.extend({
  contacts: z.array(InstitutionContactSchema),
  socialLinks: z.array(InstitutionSocialLinkSchema),
  trainingAreas: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
  })),
});

export type InstitutionDetailResponseSchema = z.infer<typeof InstitutionDetailResponseSchema>;

export const TrainingAreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
});

export type TrainingAreaSchema = z.infer<typeof TrainingAreaSchema>;