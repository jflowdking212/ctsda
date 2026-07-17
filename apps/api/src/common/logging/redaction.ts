export const LOG_REDACTION_CENSOR = '[REDACTED]';

export const LOG_REDACTION_PATHS = [
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'secret',
  'authorization',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-csrf-token"]',
  'body.password',
  'body.newPassword',
  'body.currentPassword',
  'body.token',
  'body.secret',
  'body.totpCode',
  'data.password',
  'data.token',
  'data.secret',
  'data.authorization',
  'job.data.password',
  'job.data.token',
  'job.data.secret',
  'job.data.authorization',
];

export function createPinoRedactOptions() {
  return {
    paths: LOG_REDACTION_PATHS,
    censor: LOG_REDACTION_CENSOR,
  };
}
