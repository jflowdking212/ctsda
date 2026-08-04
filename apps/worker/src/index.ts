import { Worker, Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';
import nodemailer from 'nodemailer';
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

const port = Number(process.env.SMTP_PORT) || 587;
const isSecure = port === 465;

// Nodemailer SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.acecoterieconsulting.com',
  port: port,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER || 'accounts@acecoterieconsulting.com',
    pass: process.env.SMTP_PASS || 'Preciouskey2030',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    logger.error({ error: error.message }, 'SMTP connection failed');
  } else {
    logger.info('SMTP connection verified successfully');
  }
});

// Queue definitions
export const emailQueue = new Queue('email', { connection });
export const pdfQueue = new Queue('pdf-generation', { connection });
export const reminderQueue = new Queue('reminders', { connection });

// Queue events
export const emailQueueEvents = new QueueEvents('email', { connection });
export const pdfQueueEvents = new QueueEvents('pdf-generation', { connection });
export const reminderQueueEvents = new QueueEvents('reminders', { connection });

// Email worker — actually sends emails via SMTP
const emailWorker = new Worker('email', async (job) => {
  const { to, subject, html, text } = job.data as {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    userId?: string;
  };

  logger.info({ jobId: job.id, to, subject }, 'Sending email via SMTP');

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'accounts@acecoterieconsulting.com',
    to,
    subject,
    html,
    text,
  });

  logger.info({ jobId: job.id, messageId: info.messageId, to, response: info.response }, 'Email sent successfully via SMTP');
  return { status: 'sent', messageId: info.messageId, response: info.response };
}, { connection });

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Email job failed');
});

// PDF generation worker
const pdfWorker = new Worker('pdf-generation', async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing PDF generation job');
}, { connection });

// Reminder worker (cron-based)
const reminderWorker = new Worker('reminders', async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing reminder job');
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
