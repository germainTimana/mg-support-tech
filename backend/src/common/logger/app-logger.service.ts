import { Injectable, LoggerService, Scope } from '@nestjs/common';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export interface LogMeta {
  context?: string;
  traceId?: string;
  userId?: string;
  [key: string]: unknown;
}

@Injectable({ scope: Scope.DEFAULT })
export class AppLogger implements LoggerService {
  private readonly service = 'mg-support-tech';
  private levelWeight: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
  };
  private minLevel: LogLevel = 'info';

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  private reassemble(message: unknown): string {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      if (message.length && typeof message[0] === 'string' && message[0].length === 1) {
        return message.join('');
      }
      try {
        return message.join(' ');
      } catch {
        return String(message);
      }
    }
    if (message instanceof Error) return message.message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private write(level: LogLevel, message: unknown, meta?: LogMeta) {
    if (this.levelWeight[level] > this.levelWeight[this.minLevel]) return;

    const text = this.reassemble(message);
    const entry = {
      level,
      service: this.service,
      time: new Date().toISOString(),
      message: text,
      ...meta,
    };
    const line = JSON.stringify(entry);

    if (level === 'error' || level === 'warn') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }

  error(message: unknown, meta?: LogMeta): void {
    this.write('error', message, meta);
  }

  warn(message: unknown, meta?: LogMeta): void {
    this.write('warn', message, meta);
  }

  info(message: unknown, meta?: LogMeta): void {
    this.write('info', message, meta);
  }

  verbose(message: unknown, meta?: LogMeta): void {
    this.write('verbose', message, meta);
  }

  debug(message: unknown, meta?: LogMeta): void {
    this.write('debug', message, meta);
  }

  log(message: unknown, meta?: LogMeta): void {
    this.write('info', message, meta);
  }
}
