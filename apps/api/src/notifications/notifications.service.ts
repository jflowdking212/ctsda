import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../common/prisma.service';
import { EmailTemplateName, renderEmailTemplate } from './email-templates';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService, @InjectQueue('email') private emailQueue: Queue) {}

  async enqueueEmail(data: { to: string; subject: string; html: string; userId?: string }) {
    const isUuid =
      typeof data.userId === 'string' &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.userId);

    // 1. Attempt direct SMTP delivery first for immediate notification
    try {
      const siteSettings = await this.prisma.siteSetting.findMany();
      const getSetting = (k: string) => {
        const val = siteSettings.find(s => s.key === k)?.value;
        const strVal = val !== null && val !== undefined ? String(val).trim() : '';
        return strVal !== '' ? strVal : undefined;
      };

      const host = getSetting('smtpHost') || process.env.SMTP_HOST || 'mail.acecoterieconsulting.com';
      const port = Number(getSetting('smtpPort') || process.env.SMTP_PORT) || 587;
      const user = getSetting('smtpUser') || process.env.SMTP_USER || 'accounts@acecoterieconsulting.com';
      const pass = getSetting('smtpPassword') || process.env.SMTP_PASS || 'Preciouskey2030';
      const from = getSetting('smtpFrom') || process.env.SMTP_FROM || user;
      const rawSecure = getSetting('smtpSecure');

      let isSecure = false;
      if (rawSecure === 'true' || rawSecure === 'ssl') {
        isSecure = true;
      } else if (rawSecure === 'false' || rawSecure === 'tls') {
        isSecure = false;
      } else {
        isSecure = port === 465;
      }

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });

      const info = await transporter.sendMail({
        from: from,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      await this.prisma.emailDeliveryLog.create({
        data: {
          userId: isUuid ? data.userId : null,
          recipient: data.to,
          subject: data.subject,
          status: 'sent',
          providerMessageId: info.messageId,
          sentAt: new Date(),
        },
      });

      return { status: 'sent', messageId: info.messageId };
    } catch (err: any) {
      console.error('Direct SMTP delivery failed, queueing to worker:', err?.message || err);

      await this.prisma.emailDeliveryLog.create({
        data: {
          userId: isUuid ? data.userId : null,
          recipient: data.to,
          subject: data.subject,
          status: 'failed',
          errorMessage: err?.message || String(err),
        },
      });

      // 2. Fallback to BullMQ background queue
      try {
        const job = await this.emailQueue.add('send', data, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        return { jobId: job.id };
      } catch (qErr) {
        console.error('Queue fallback failed:', qErr);
        return { status: 'failed', error: err?.message };
      }
    }
  }

  async enqueueTemplateEmail(data: {
    to: string;
    userId?: string;
    template: EmailTemplateName;
    values?: Record<string, string>;
  }) {
    const rendered = renderEmailTemplate(data.template, data.values);
    return this.enqueueEmail({
      to: data.to,
      userId: data.userId,
      subject: rendered.subject,
      html: rendered.html,
    });
  }
}
