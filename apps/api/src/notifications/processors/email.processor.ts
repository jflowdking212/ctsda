import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../common/prisma.service';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  userId: string;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    const { to, subject, html } = job.data;
    const nodemailer = require('nodemailer');

    try {
      const settings = await this.prisma.siteSetting.findMany();
      const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;

      const smtpHost = getSetting('smtpHost');
      const smtpPort = Number(getSetting('smtpPort')) || 587;
      const smtpUser = getSetting('smtpUser');
      const smtpPass = getSetting('smtpPassword');
      const smtpSecureSetting = getSetting('smtpSecure');
      const supportEmail = getSetting('supportEmail') || 'management@ctsdamerica.com';

      if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn(`[Email Skipped] SMTP credentials not configured in Admin Settings. Target: ${to}`);
        await this.updateDeliveryLog(to, subject, 'sent');
        return { status: 'skipped', reason: 'SMTP not configured' };
      }

      let isSecure = false;
      if (smtpSecureSetting === 'true' || smtpSecureSetting === true || smtpSecureSetting === 'ssl') {
        isSecure = true;
      } else if (smtpSecureSetting === 'false' || smtpSecureSetting === false || smtpSecureSetting === 'tls') {
        isSecure = false;
      } else {
        isSecure = smtpPort === 465;
      }

      const transporter = nodemailer.createTransport({
        host: String(smtpHost),
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: String(smtpUser),
          pass: String(smtpPass),
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
      });

      await transporter.sendMail({
        from: `"CTSDA" <${smtpUser || supportEmail}>`,
        to,
        subject,
        html,
      });

      console.log(`[Email Sent via SMTP] to=${to} subject="${subject}"`);
      await this.updateDeliveryLog(to, subject, 'sent');
      return { status: 'sent' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error';
      console.error(`[Email Failed] to=${to} error="${errorMessage}"`);
      await this.updateDeliveryLog(to, subject, 'failed', errorMessage);
      throw error;
    }
  }

  private async updateDeliveryLog(
    to: string,
    subject: string,
    status: string,
    error?: string,
  ) {
    await this.prisma.emailDeliveryLog.updateMany({
      where: {
        recipient: to,
        subject,
        status: 'pending',
      },
      data: {
        status: status === 'sent' ? 'sent' : 'failed',
        errorMessage: error,
        sentAt: status === 'sent' ? new Date() : undefined,
      },
    });
  }
}
