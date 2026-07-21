import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

export interface PaymentJobData {
  invoiceId: string;
  applicationId?: string;
  userId?: string;
}

@Processor('payments')
export class PaymentProcessor extends WorkerHost {
  async process(job: Job<PaymentJobData>) {
    const { invoiceId } = job.data;
    if (job.name === 'generate-invoice-pdf') {
      console.log(`[PaymentProcessor] generate invoice pdf for invoice=${invoiceId}`);
      return { pdfUrl: `s3://pending/invoices/${invoiceId}.pdf` };
    }

    console.log(`[PaymentProcessor] checkout is handled synchronously for invoice=${invoiceId}`);
    return { invoiceId };
  }
}
