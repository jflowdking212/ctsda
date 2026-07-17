import pino from 'pino';
import { createPinoRedactOptions as createApiRedactOptions } from '../src/common/logging/redaction';
import { createPinoRedactOptions as createWorkerRedactOptions } from '../../worker/src/logging';

function logLineFor(redact: ReturnType<typeof createApiRedactOptions>) {
  const lines: string[] = [];
  const logger = pino({ redact }, { write: (line) => lines.push(line) });

  logger.info({
    password: 'plain-password',
    token: 'plain-token',
    secret: 'plain-secret',
    authorization: 'Bearer plain-auth',
    body: {
      password: 'body-password',
      token: 'body-token',
      secret: 'body-secret',
      totpCode: '123456',
    },
    data: {
      password: 'data-password',
      token: 'data-token',
      secret: 'data-secret',
      authorization: 'data-auth',
    },
  });

  return lines.join('\n');
}

describe('log redaction', () => {
  it('redacts sensitive API log fields', () => {
    const line = logLineFor(createApiRedactOptions());

    expect(line).toContain('[REDACTED]');
    expect(line).not.toContain('plain-password');
    expect(line).not.toContain('plain-token');
    expect(line).not.toContain('plain-secret');
    expect(line).not.toContain('plain-auth');
    expect(line).not.toContain('body-password');
    expect(line).not.toContain('body-token');
    expect(line).not.toContain('body-secret');
    expect(line).not.toContain('123456');
    expect(line).not.toContain('data-password');
    expect(line).not.toContain('data-token');
    expect(line).not.toContain('data-secret');
    expect(line).not.toContain('data-auth');
  });

  it('redacts sensitive worker job data fields', () => {
    const line = logLineFor(createWorkerRedactOptions());

    expect(line).toContain('[REDACTED]');
    expect(line).not.toContain('plain-password');
    expect(line).not.toContain('plain-token');
    expect(line).not.toContain('plain-secret');
    expect(line).not.toContain('plain-auth');
    expect(line).not.toContain('data-password');
    expect(line).not.toContain('data-token');
    expect(line).not.toContain('data-secret');
    expect(line).not.toContain('data-auth');
  });
});
