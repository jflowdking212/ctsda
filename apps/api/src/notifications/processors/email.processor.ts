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
    const { to, subject, html, userId } = job.data;

    try {
      console.log(`[Email queued] to=${to} subject="${subject}" user=${userId} htmlLength=${html.length}`);
      await this.updateDeliveryLog(userId, to, subject, 'sent');
      return { status: 'sent' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateDeliveryLog(userId, to, subject, 'failed', errorMessage);
      throw error;
    }
  }

  private async updateDeliveryLog(
    userId: string,
    to: string,
    subject: string,
    status: string,
    error?: string,
  ) {
    await this.prisma.emailDeliveryLog.updateMany({
      where: {
        userId,
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

    console.log(`[Email ${status}] to=${to} subject="${subject}" user=${userId}`, error || '');
  }
}
