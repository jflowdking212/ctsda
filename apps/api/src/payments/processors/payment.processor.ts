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

    // In production, this would call Stripe/Paystack/Flutterwave SDK
    // and create a real checkout session URL.
    console.log(`[PaymentProcessor] create checkout for invoice=${invoiceId}`);
    return { checkoutUrl: `https://pay.example.com/invoice/${invoiceId}` };
  }
}
