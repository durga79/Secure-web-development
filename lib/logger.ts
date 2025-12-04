type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, metadata || '');
    }
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata);
  }

  security(message: string, metadata?: Record<string, unknown>) {
    this.log('security', message, metadata);
  }
}

export const logger = new Logger();

