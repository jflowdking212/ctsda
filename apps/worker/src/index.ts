import { Worker, Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';
import { createPinoRedactOptions } from './logging';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: createPinoRedactOptions(),
});

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Queue definitions
export const emailQueue = new Queue('email', { connection });
export const pdfQueue = new Queue('pdf-generation', { connection });
export const reminderQueue = new Queue('reminders', { connection });

// Queue events
export const emailQueueEvents = new QueueEvents('email', { connection });
export const pdfQueueEvents = new QueueEvents('pdf-generation', { connection });
export const reminderQueueEvents = new QueueEvents('reminders', { connection });

// Email worker
const emailWorker = new Worker('email', async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing email job');
  // Email sending logic will be implemented in M7
}, { connection });

// PDF generation worker
const pdfWorker = new Worker('pdf-generation', async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing PDF generation job');
  // PDF generation logic will be implemented in M6
}, { connection });

// Reminder worker (cron-based)
const reminderWorker = new Worker('reminders', async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing reminder job');
  // Reminder logic will be implemented in M7
}, { connection });

logger.info('Worker service started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...');
  await emailWorker.close();
  await pdfWorker.close();
  await reminderWorker.close();
  await connection.quit();
  logger.info('Workers shutdown complete');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down workers...');
  await emailWorker.close();
  await pdfWorker.close();
  await reminderWorker.close();
  await connection.quit();
  logger.info('Workers shutdown complete');
  process.exit(0);
});
