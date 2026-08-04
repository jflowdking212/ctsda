import { z } from 'zod';
import { UserRole } from './enums';

export const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  role: UserRole.default('applicant'),
});

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;

export const RegisterApplicantSchema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
});

export type RegisterApplicantSchema = z.infer<typeof RegisterApplicantSchema>;

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().length(6).optional(),
});

export type LoginSchema = z.infer<typeof LoginSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export const SetupTotpSchema = z.object({
  token: z.string().min(1),
});

export type SetupTotpSchema = z.infer<typeof SetupTotpSchema>;

export const VerifyTotpSchema = z.object({
  code: z.string().length(6),
});

export type VerifyTotpSchema = z.infer<typeof VerifyTotpSchema>;

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  role: UserRole,
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isTotpEnabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserResponseSchema = z.infer<typeof UserResponseSchema>;

export const SessionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type SessionResponseSchema = z.infer<typeof SessionResponseSchema>;

export const RequestOtpSchema = z.object({
  email: z.string().email().max(255),
});
export type RequestOtpSchema = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email().max(255),
  otp: z.string().length(6),
});
export type VerifyOtpSchema = z.infer<typeof VerifyOtpSchema>;