// Comprehensive logging utility for debugging network issues
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  requestId?: string;
  page?: string;
  component?: string;
  userId?: string;
}

interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: string;
  page?: string;
  component?: string;
  headers?: Record<string, string>;
  payload?: any;
  response?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private requestLogs: Map<string, RequestLog> = new Map();
  private currentLogLevel: LogLevel = LogLevel.INFO;
  private maxLogs = 1000; // Keep only last 1000 logs

  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentPageInfo() {
    if (typeof window !== 'undefined') {
      return {
        page: window.location.pathname,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
    }
    return {};
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...this.getCurrentPageInfo(),
        ...context,
      },
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with colors
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    const colors = ['color: red', 'color: orange', 'color: blue', 'color: gray'];
    
    if (typeof window !== 'undefined') {
      console.log(
        `%c[${levelNames[level]}] ${logEntry.timestamp} - ${message}`,
        colors[level],
        context
      );
    }
  }

  error(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  // Network request logging
  logRequestStart(config: AxiosRequestConfig, context?: { page?: string; component?: string }): string {
    const requestId = this.generateRequestId();
    const startTime = performance.now();
    
    const requestLog: RequestLog = {
      requestId,
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || 'unknown',
      startTime,
      page: context?.page || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      component: context?.component,
      headers: config.headers as Record<string, string>,
      payload: config.data,
    };

    this.requestLogs.set(requestId, requestLog);

    this.info(`🚀 API Request Started`, {
      requestId,
      method: requestLog.method,
      url: requestLog.url,
      page: requestLog.page,
      component: requestLog.component,
      hasPayload: !!config.data,
      headers: Object.keys(config.headers || {}),
    });

    return requestId;
  }

  logRequestSuccess(requestId: string, response: AxiosResponse) {
    const requestLog = this.requestLogs.get(requestId);
    if (!requestLog) return;

    const endTime = performance.now();
    const duration = endTime - requestLog.startTime;

    requestLog.endTime = endTime;
    requestLog.duration = duration;
    requestLog.status = response.status;
    requestLog.response = response.data;

    this.info(`✅ API Request Success`, {
      requestId,
      method: requestLog.method,
      url: requestLog.url,
      status: response.status,
      duration: `${duration.toFixed(2)}ms`,
      page: requestLog.page,
      component: requestLog.component,
      responseSize: JSON.stringify(response.data || {}).length,
    });
  }

  logRequestError(requestId: string, error: AxiosError) {
    const requestLog = this.requestLogs.get(requestId);
    if (!requestLog) {
      // Handle case where request wasn't logged (e.g., immediate network failure)
      this.error(`❌ API Request Error (No Request Log)`, {
        error: error.message,
        code: error.code,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      });
      return;
    }

    const endTime = performance.now();
    const duration = endTime - requestLog.startTime;

    requestLog.endTime = endTime;
    requestLog.duration = duration;
    requestLog.status = error.response?.status;
    requestLog.error = error.message;

    const errorContext = {
      requestId,
      method: requestLog.method,
      url: requestLog.url,
      status: error.response?.status || 'NO_RESPONSE',
      duration: `${duration.toFixed(2)}ms`,
      page: requestLog.page,
      component: requestLog.component,
      errorCode: error.code,
      errorMessage: error.message,
      isTimeout: error.code === 'ECONNABORTED' || error.message.includes('timeout'),
      isNetworkError: !error.response,
      responseData: error.response?.data,
    };

    this.error(`❌ API Request Failed`, errorContext);

    // Special handling for timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      this.error(`⏱️ TIMEOUT DETECTED`, {
        ...errorContext,
        timeoutDuration: duration,
        likelyTimeout: duration >= 30000, // Our configured timeout
        page: requestLog.page,
        component: requestLog.component,
        url: requestLog.url,
      });
    }

    // Special handling for connection errors
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message.includes('Connect Timeout Error')) {
      this.error(`🔌 CONNECTION TIMEOUT DETECTED`, {
        ...errorContext,
        backendUrl: requestLog.url,
        page: requestLog.page,
        component: requestLog.component,
        suggestion: 'Check if backend server is running and accessible',
      });
    }
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  getRequestLogs(): RequestLog[] {
    return Array.from(this.requestLogs.values());
  }

  // Get recent timeout/connection errors
  getTimeoutErrors(minutes: number = 10): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.logs.filter(log => 
      log.level === LogLevel.ERROR && 
      log.timestamp > cutoff && 
      (log.message.includes('TIMEOUT') || log.message.includes('CONNECTION'))
    );
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      logs: this.logs,
      requestLogs: Array.from(this.requestLogs.values()),
      pageInfo: this.getCurrentPageInfo(),
    }, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.requestLogs.clear();
  }
}

// Global logger instance
export const logger = new Logger();

// Set log level based on environment
if (typeof window !== 'undefined') {
  const isDev = process.env.NODE_ENV === 'development';
  // In production, we still want to log errors and warnings for debugging
  logger.setLogLevel(isDev ? LogLevel.DEBUG : LogLevel.WARN);
}

// Helper to add component context to logs
export const withContext = (page?: string, component?: string) => ({
  page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
  component,
});

// Helper for logging page visits
export const logPageVisit = (pageName: string) => {
  logger.info(`📄 Page Visit`, { 
    page: pageName,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
  });
};

export default logger;