// Production error reporting and monitoring system
import { logger } from './logger';

interface ProductionErrorReport {
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  errorType: 'timeout' | 'network' | 'server' | 'general';
  errorMessage: string;
  requestUrl?: string;
  requestMethod?: string;
  responseStatus?: number;
  responseTime?: number;
  stackTrace?: string;
  userActions: string[];
  networkInfo?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

class ProductionErrorReporter {
  private sessionId: string;
  private userActions: string[] = [];
  private maxActions = 50; // Keep last 50 user actions
  private reportQueue: ProductionErrorReport[] = [];
  private isReporting = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      // Track user actions for context
      this.trackUserActions();
      
      // Send queued reports when online
      window.addEventListener('online', () => this.flushReports());
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackUserActions() {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.addUserAction(`click: ${target.tagName} ${target.className || target.id || ''}`);
    });

    // Track page navigation
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        this.addUserAction(`navigate: ${window.location.pathname}`);
        lastUrl = window.location.href;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      this.addUserAction(`form_submit: ${form.action || form.id || 'unknown'}`);
    });
  }

  private addUserAction(action: string) {
    this.userActions.push(`${new Date().toISOString()}: ${action}`);
    
    // Keep only recent actions
    if (this.userActions.length > this.maxActions) {
      this.userActions = this.userActions.slice(-this.maxActions);
    }
  }

  private getNetworkInfo() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      };
    }
    return undefined;
  }

  async reportError(error: {
    type: 'timeout' | 'network' | 'server' | 'general';
    message: string;
    requestUrl?: string;
    requestMethod?: string;
    responseStatus?: number;
    responseTime?: number;
    stackTrace?: string;
  }) {
    const report: ProductionErrorReport = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      errorType: error.type,
      errorMessage: error.message,
      requestUrl: error.requestUrl,
      requestMethod: error.requestMethod,
      responseStatus: error.responseStatus,
      responseTime: error.responseTime,
      stackTrace: error.stackTrace,
      userActions: [...this.userActions],
      networkInfo: this.getNetworkInfo(),
    };

    // Store in localStorage as backup
    this.storeReportLocally(report);
    
    // Add to queue
    this.reportQueue.push(report);
    
    // Try to send immediately if online
    if (navigator.onLine) {
      await this.flushReports();
    }

    // Log for immediate debugging
    logger.error('🚨 Production Error Reported', {
      sessionId: this.sessionId,
      errorType: error.type,
      url: error.requestUrl,
      responseTime: error.responseTime,
    });
  }

  private getUserId(): string | undefined {
    try {
      // Try to get user ID from localStorage or cookies
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.email;
      }
    } catch (e) {
      // Ignore
    }
    return undefined;
  }

  private storeReportLocally(report: ProductionErrorReport) {
    try {
      const key = `error_report_${report.timestamp}`;
      localStorage.setItem(key, JSON.stringify(report));
      
      // Clean old reports (keep only last 24 hours)
      this.cleanOldReports();
    } catch (e) {
      // Storage quota exceeded or disabled
      console.warn('Could not store error report locally');
    }
  }

  private cleanOldReports() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('error_report_')) {
        const timestamp = key.replace('error_report_', '');
        if (new Date(timestamp).getTime() < cutoff) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private async flushReports() {
    if (this.isReporting || this.reportQueue.length === 0) return;
    
    this.isReporting = true;
    
    try {
      // Send to your backend error reporting endpoint
      // For now, we'll just log them for collection
      for (const report of this.reportQueue) {
        await this.sendReport(report);
      }
      
      this.reportQueue = [];
    } catch (error) {
      console.warn('Failed to send error reports:', error);
    } finally {
      this.isReporting = false;
    }
  }

  private async sendReport(report: ProductionErrorReport) {
    try {
      // Option 1: Send to your backend
      // await fetch('/api/error-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });

      // Option 2: For immediate debugging, use console.error with structured data
      console.group(`🚨 Production Error Report - ${report.errorType.toUpperCase()}`);
      console.error('Error Details:', {
        timestamp: report.timestamp,
        type: report.errorType,
        message: report.errorMessage,
        url: report.url,
        requestUrl: report.requestUrl,
        responseTime: report.responseTime,
        userId: report.userId,
        sessionId: report.sessionId,
      });
      console.error('Network Info:', report.networkInfo);
      console.error('Recent User Actions:', report.userActions.slice(-10));
      console.groupEnd();

      // Option 3: Send to external service like Sentry, LogRocket, etc.
      // if (window.Sentry) {
      //   window.Sentry.captureException(new Error(report.errorMessage), {
      //     tags: { type: report.errorType },
      //     extra: report
      //   });
      // }
      
    } catch (error) {
      console.warn('Failed to send individual report:', error);
    }
  }

  // Method to manually export reports for debugging
  exportReports(): string {
    const allReports = [];
    
    // Get queued reports
    allReports.push(...this.reportQueue);
    
    // Get stored reports
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('error_report_')) {
        try {
          const report = JSON.parse(localStorage.getItem(key) || '');
          allReports.push(report);
        } catch (e) {
          // Skip invalid reports
        }
      }
    }
    
    return JSON.stringify({
      exportTimestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      totalReports: allReports.length,
      reports: allReports,
    }, null, 2);
  }

  // Method to get error summary for admin dashboard
  getErrorSummary() {
    const reports = this.reportQueue;
    const summary = {
      totalErrors: reports.length,
      timeouts: reports.filter(r => r.errorType === 'timeout').length,
      networkErrors: reports.filter(r => r.errorType === 'network').length,
      serverErrors: reports.filter(r => r.errorType === 'server').length,
      avgResponseTime: 0,
      slowestEndpoint: '',
      mostProblematicEndpoint: '',
    };

    if (reports.length > 0) {
      const responseTimes = reports
        .filter(r => r.responseTime)
        .map(r => r.responseTime!);
      
      if (responseTimes.length > 0) {
        summary.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      // Find most problematic endpoint
      const endpointCounts: Record<string, number> = {};
      reports.forEach(r => {
        if (r.requestUrl) {
          endpointCounts[r.requestUrl] = (endpointCounts[r.requestUrl] || 0) + 1;
        }
      });
      
      const maxCount = Math.max(...Object.values(endpointCounts));
      summary.mostProblematicEndpoint = Object.keys(endpointCounts)
        .find(key => endpointCounts[key] === maxCount) || '';
    }

    return summary;
  }
}

export const productionErrorReporter = new ProductionErrorReporter();
export default productionErrorReporter;