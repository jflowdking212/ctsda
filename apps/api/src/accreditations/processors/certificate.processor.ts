import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('certificates')
export class CertificateProcessor extends WorkerHost {
  async process(job: Job) {
    return {
      status: 'queued',
      jobId: job.id,
      message: 'Certificate PDF generation is not implemented yet.',
    };
  }
}
