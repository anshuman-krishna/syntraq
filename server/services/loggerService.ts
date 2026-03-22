type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
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

  // structured output — production log collectors parse json
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(entry))
  } else {
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](formatEntry(entry))
  }
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
}
