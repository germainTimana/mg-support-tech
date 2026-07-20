import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { WsException } from '@nestjs/websockets';
import { AppLogger } from '../logger/app-logger.service';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
  traceId: string;
  path?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url?: string; method?: string; user?: { id?: string; role?: string } }>();

    const traceId = this.generateTraceId();
    const path = request?.url;
    const method = request?.method;
    const userId = request?.user?.id;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'Error interno del servidor';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        errorCode = (r.error as string) ?? exception.name;
        if (Array.isArray(r.message)) {
          message = (r.message as string[]).join(', ');
          details = r.message;
        } else {
          message = (r.message as string) ?? exception.message;
          details = r.details;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof WsException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = 'WS_ERROR';
    }

    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    this.logger[level](
      `[${method ?? 'HTTP'}] ${path ?? ''} -> ${status} ${errorCode}`,
      {
        context: 'GlobalExceptionFilter',
        traceId,
        userId,
        statusCode: status,
        errorCode,
        exception: exception instanceof Error ? exception.stack : String(exception),
      },
    );

    const body: ErrorBody = {
      statusCode: status,
      error: errorCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      traceId,
      path,
    };

    response.status(status).json(body);
  }

  private generateTraceId(): string {
    return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
