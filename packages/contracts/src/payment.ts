import { z } from 'zod';
import { PaymentStatus, InvoiceStatus } from './enums';

export const CreateInvoiceSchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime(),
});

export type CreateInvoiceSchema = z.infer<typeof CreateInvoiceSchema>;

export const InvoiceResponseSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  invoiceNumber: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: InvoiceStatus,
  description: z.string().nullable(),
  dueDate: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type InvoiceResponseSchema = z.infer<typeof InvoiceResponseSchema>;

export const PaymentResponseSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatus,
  provider: z.string(),
  providerPaymentId: z.string().nullable(),
  providerEventId: z.string().nullable(),
  idempotencyKey: z.string(),
  refundedAmount: z.number().default(0),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PaymentResponseSchema = z.infer<typeof PaymentResponseSchema>;

export const CreatePaymentIntentSchema = z.object({
  invoiceId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CreatePaymentIntentSchema = z.infer<typeof CreatePaymentIntentSchema>;

export const PaymentIntentResponseSchema = z.object({
  sessionId: z.string(),
  sessionUrl: z.string().url(),
  invoiceId: z.string().uuid(),
});

export type PaymentIntentResponseSchema = z.infer<typeof PaymentIntentResponseSchema>;

export const RefundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

export type RefundPaymentSchema = z.infer<typeof RefundPaymentSchema>;