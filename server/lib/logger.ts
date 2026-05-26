/**
 * Structured logging for Victor Collective API
 *
 * JSON in production, pretty console in development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = process.env.NODE_ENV === 'production';
const minLevel = LEVELS[process.env.LOG_LEVEL as LogLevel] ?? LEVELS.info;

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    if (value instanceof Error) return value.message;
    return JSON.stringify(value);
  }
  return String(value);
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVELS[level] < minLevel) return;

  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (isProduction) {
    // Structured JSON for production
    console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
  } else {
    // Pretty console for development
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[90m',
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    const color = levelColors[level];

    const contextStr = context
      ? ' ' + Object.entries(context)
          .map(([k, v]) => `${k}=${formatValue(v)}`)
          .join(' ')
      : '';

    console[level === 'debug' ? 'log' : level](
      `${color}[${level.toUpperCase()}]${reset} ${message}${contextStr}`
    );
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

export type { LogContext, LogLevel };
