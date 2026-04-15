import type { H3Event } from 'h3'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

function consoleFor(level: LogLevel): (msg: string) => void {
  // eslint-disable-next-line no-console
  if (level === 'error') return console.error
  // eslint-disable-next-line no-console
  if (level === 'warn') return console.warn
  // eslint-disable-next-line no-console
  return console.log
}

function formatEntry(entry: LogEntry): string {
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${ctx}`
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  const write = consoleFor(level)
  if (process.env.NODE_ENV === 'production') {
    write(JSON.stringify(entry))
  } else {
    write(formatEntry(entry))
  }
}

function withEvent(event: H3Event | undefined, context?: Record<string, unknown>): Record<string, unknown> | undefined {
  const requestId = event?.context?.requestId
  if (!requestId && !context) return undefined
  return { ...(requestId ? { requestId } : {}), ...context }
}

export const loggerService = {
  info(message: string, context?: Record<string, unknown>) {
    log('info', message, context)
  },

  warn(message: string, context?: Record<string, unknown>) {
    log('warn', message, context)
  },

  error(message: string, context?: Record<string, unknown>) {
    log('error', message, context)
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', message, context)
    }
  },

  // scoped logger that auto-attaches request id
  forEvent(event: H3Event | undefined) {
    return {
      info: (m: string, c?: Record<string, unknown>) => log('info', m, withEvent(event, c)),
      warn: (m: string, c?: Record<string, unknown>) => log('warn', m, withEvent(event, c)),
      error: (m: string, c?: Record<string, unknown>) => log('error', m, withEvent(event, c)),
      debug: (m: string, c?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'production') log('debug', m, withEvent(event, c))
      },
    }
  },
}
