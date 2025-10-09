import { env, isDevelopment, isProduction } from "@/env";

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  serviceName: string;
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  service: string;
  environment: string;
  userAgent?: string;
  url?: string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: isProduction,
  serviceName: "forge-frontend",
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${levelName}: ${message}${contextStr}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error : undefined,
      service: this.config.serviceName,
      environment: env.NODE_ENV,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't log remote logging errors to avoid infinite loops
      console.error("Failed to send log to remote:", error);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(level, message, context);
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, error || context);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, context);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, context);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage, context);
          break;
      }
    }

    // Remote logging (async, don't await)
    this.sendToRemote(entry);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }

  // Group logging
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  // Update configuration
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Create a child logger with additional context
  child(serviceName: string): Logger {
    return new Logger({
      ...this.config,
      serviceName: `${this.config.serviceName}:${serviceName}`,
    });
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Export logger class for custom instances
export { Logger };

// Utility functions for common logging patterns
export const logError = (error: Error, context?: Record<string, unknown>): void => {
  logger.error(error.message, context, error);
};

export const logPerformance = (operation: string, duration: number, context?: Record<string, unknown>): void => {
  logger.info(`Performance: ${operation} took ${duration}ms`, context);
};

export const logApiCall = (method: string, url: string, status?: number, duration?: number): void => {
  logger.info(`API ${method} ${url}`, { status, duration });
};

export const logUserAction = (action: string, context?: Record<string, unknown>): void => {
  logger.info(`User action: ${action}`, context);
};

// Initialize logger with environment-specific settings
if (isDevelopment) {
  logger.updateConfig({
    level: LogLevel.DEBUG,
    enableRemote: false,
  });
} else if (isProduction) {
  logger.updateConfig({
    level: LogLevel.INFO,
    enableRemote: true,
  });
}
