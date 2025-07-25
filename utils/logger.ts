
// Production-ready logging system
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    const currentLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
    return levels[level] >= levels[currentLevel];
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Implement your logging service integration here
    // e.g., Sentry, LogRocket, or custom endpoint
    console.error('Production Error:', entry);
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, data);
      this.addLog(entry);
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, data);
      this.addLog(entry);
      console.info(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, data);
      this.addLog(entry);
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const entry = this.createLogEntry('error', message, error);
      this.addLog(entry);
      console.error(`[ERROR] ${message}`, error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
export default logger;
