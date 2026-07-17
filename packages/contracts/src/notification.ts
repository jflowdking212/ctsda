import { z } from 'zod';
import { NotificationType } from './enums';

export const NotificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationType,
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
});

export type NotificationResponseSchema = z.infer<typeof NotificationResponseSchema>;

export const EmailDeliveryLogSchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid().nullable(),
  recipient: z.string().email(),
  subject: z.string(),
  status: z.enum(['pending', 'sent', 'delivered', 'bounced', 'failed']),
  providerMessageId: z.string().nullable(),
  errorMessage: z.string().nullable(),
  retryCount: z.number().int().default(0),
  sentAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EmailDeliveryLogSchema = z.infer<typeof EmailDeliveryLogSchema>;