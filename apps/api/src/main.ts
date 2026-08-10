import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    bodyLimit: 10 * 1024 * 1024, // 10MB
    logger: false, // We use pino via nestjs-pino
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { bufferLogs: true, rawBody: true },
  );

  const configService = app.get(ConfigService);

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", configService.get('FRONTEND_URL')],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // CORS
  await app.register(fastifyCors, {
    origin: [configService.get('FRONTEND_URL', 'http://localhost:3000')],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'X-Session-Id'],
    exposedHeaders: ['X-Trace-Id'],
  });

  // Cookie parser
  await app.register(fastifyCookie, {
    secret: configService.get<string>('SESSION_SECRET', 'change-me-in-production'),
  });

  // CSRF protection (double-submit cookie pattern)
  await app.register(fastifyCsrf, {
    cookieOpts: {
      signed: true,
      httpOnly: true,
      secure: configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    },
  });

  // File upload parsing
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max
      files: 10,
    },
  });

  // Static file serving for uploads (logos, documents)
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  const fs = await import('fs');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Global pipes
  app.useGlobalPipes(new ZodValidationPipe());

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TraceIdInterceptor());

  // Logger
  app.useLogger(app.get(Logger));

  const port = configService.get('API_PORT', 4000);
  const host = configService.get('API_HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`API running on http://${host}:${port}`);
}

bootstrap();
