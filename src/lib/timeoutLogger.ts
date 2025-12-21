'use client';
import { toast } from 'react-toastify';

interface TimeoutReport {
  page: string;
  component: string;
  url: string;
  timeout: number;
  timestamp: number;
  userAgent: string;
  stackTrace?: string;
}

class TimeoutLogger {
  private static instance: TimeoutLogger;
  private reports: TimeoutReport[] = [];
  private readonly MAX_REPORTS = 100;

  private constructor() {}

  public static getInstance(): TimeoutLogger {
    if (!TimeoutLogger.instance) {
      TimeoutLogger.instance = new TimeoutLogger();
    }
    return TimeoutLogger.instance;
  }

  public logTimeout(
    page: string,
    component: string,
    url: string,
    timeout: number,
    stackTrace?: string
  ) {
    const report: TimeoutReport = {
      page,
      component,
      url,
      timeout,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      stackTrace
    };

    this.reports.push(report);

    // Keep only recent reports
    if (this.reports.length > this.MAX_REPORTS) {
      this.reports = this.reports.slice(-this.MAX_REPORTS);
    }

    // Show user notification
    toast.error(`Request timed out: ${url.split('/').pop()}`, {
      position: 'bottom-right',
      autoClose: 3000,
    });

    // Log to console for debugging
    console.error('🚨 TIMEOUT DETECTED:', {
      page,
      component,
      url,
      timeout,
      time: new Date(report.timestamp).toISOString()
    });

    // Send to backend logging service (if you have one)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(report);
    }
  }

  private async sendToLoggingService(report: TimeoutReport) {
    try {
      // Replace with your actual logging endpoint
      await fetch('/api/logs/timeout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (error) {
      // Silently fail - don't want logging to cause more issues
      console.warn('Failed to send timeout report to logging service');
    }
  }

  public getReports(): TimeoutReport[] {
    return [...this.reports];
  }

  public getStats() {
    const last24h = this.reports.filter(
      report => Date.now() - report.timestamp < 24 * 60 * 60 * 1000
    );

    const urlFrequency = last24h.reduce((acc, report) => {
      acc[report.url] = (acc[report.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pageFrequency = last24h.reduce((acc, report) => {
      acc[report.page] = (acc[report.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTimeouts: last24h.length,
      mostProblematicUrls: Object.entries(urlFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      mostProblematicPages: Object.entries(pageFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }

  public exportReports(): string {
    return JSON.stringify({
      reports: this.reports,
      stats: this.getStats(),
      exportTime: new Date().toISOString(),
    }, null, 2);
  }

  public clearReports() {
    this.reports = [];
  }
}

export const timeoutLogger = TimeoutLogger.getInstance();