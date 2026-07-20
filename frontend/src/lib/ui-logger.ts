type FrontendLogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface FrontendLogMeta {
  scope?: string;
  status?: number;
  traceId?: string;
  url?: string;
  [key: string]: unknown;
}

const STYLES: Record<FrontendLogLevel, string> = {
  error: 'color:#fff;background:#c0392b;padding:2px 6px;border-radius:3px',
  warn: 'color:#000;background:#f39c12;padding:2px 6px;border-radius:3px',
  info: 'color:#fff;background:#2980b9;padding:2px 6px;border-radius:3px',
  debug: 'color:#fff;background:#7f8c8d;padding:2px 6px;border-radius:3px',
};

const MIN_LEVEL: Record<FrontendLogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function enabled(level: FrontendLogLevel): boolean {
  const current = (process.env.NEXT_PUBLIC_LOG_LEVEL as FrontendLogLevel) || 'info';
  return MIN_LEVEL[level] <= MIN_LEVEL[current];
}

export const uiLogger = {
  error(message: string, meta?: FrontendLogMeta) {
    if (!enabled('error')) return;
    // eslint-disable-next-line no-console
    console.error(`%cUI-ERR`, STYLES.error, message, meta ?? '');
  },
  warn(message: string, meta?: FrontendLogMeta) {
    if (!enabled('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(`%cUI-WARN`, STYLES.warn, message, meta ?? '');
  },
  info(message: string, meta?: FrontendLogMeta) {
    if (!enabled('info')) return;
    // eslint-disable-next-line no-console
    console.info(`%cUI-INFO`, STYLES.info, message, meta ?? '');
  },
  debug(message: string, meta?: FrontendLogMeta) {
    if (!enabled('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(`%cUI-DEBUG`, STYLES.debug, message, meta ?? '');
  },
};
