import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    const traceId = (request.headers['x-trace-id'] as string) || uuidv4();
    request.headers['x-trace-id'] = traceId;
    reply.header('X-Trace-Id', traceId);

    return next.handle().pipe(
      tap(() => {
        // Response is being sent
      }),
    );
  }
}