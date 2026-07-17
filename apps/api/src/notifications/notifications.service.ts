import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../common/prisma.service';
import { EmailTemplateName, renderEmailTemplate } from './email-templates';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService, @InjectQueue('email') private emailQueue: Queue) {}

  async enqueueEmail(data: { to: string; subject: string; html: string; userId: string }) {
    const job = await this.emailQueue.add('send', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    await this.prisma.emailDeliveryLog.create({
      data: {
        userId: data.userId,
        recipient: data.to,
        subject: data.subject,
        status: 'pending',
      },
    });

    return { jobId: job.id };
  }

  async enqueueTemplateEmail(data: {
    to: string;
    userId: string;
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
