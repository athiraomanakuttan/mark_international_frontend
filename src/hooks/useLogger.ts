// React hook for component-level logging and API request tracking
import { useEffect, useRef } from 'react';
import { logger, logPageVisit } from '@/lib/logger';
import { useErrorHandler } from '@/components/ErrorProvider';

interface UseLoggerOptions {
  component?: string;
  page?: string;
  logMount?: boolean;
  logUnmount?: boolean;
}

export const useLogger = (options: UseLoggerOptions = {}) => {
  const { component, page, logMount = true, logUnmount = false } = options;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (logMount && !mountedRef.current) {
      mountedRef.current = true;
      logger.info(`🔧 Component Mounted`, {
        component,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      if (logUnmount) {
        logger.info(`🔧 Component Unmounted`, {
          component,
          page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [component, page, logMount, logUnmount]);

  // Return logger methods with component context
  return {
    logInfo: (message: string, context?: Record<string, any>) => {
      logger.info(message, {
        component,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
        ...context,
      });
    },
    logError: (message: string, context?: Record<string, any>) => {
      logger.error(message, {
        component,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
        ...context,
      });
    },
    logWarn: (message: string, context?: Record<string, any>) => {
      logger.warn(message, {
        component,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
        ...context,
      });
    },
    logDebug: (message: string, context?: Record<string, any>) => {
      logger.debug(message, {
        component,
        page: page || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
        ...context,
      });
    },
  };
};

// Hook for page-level logging
export const usePageLogger = (pageName: string) => {
  useEffect(() => {
    logPageVisit(pageName);
  }, [pageName]);

  return useLogger({ page: pageName, component: 'Page' });
};

// Hook for API request logging with component context and user error handling
export const useApiLogger = (componentName: string) => {
  const logger = useLogger({ component: componentName });
  const errorHandler = useErrorHandler();

  const logApiCall = (apiName: string, context?: Record<string, any>) => {
    logger.logInfo(`🔄 API Call: ${apiName}`, {
      apiName,
      ...context,
    });
  };

  const logApiSuccess = (apiName: string, context?: Record<string, any>) => {
    logger.logInfo(`✅ API Success: ${apiName}`, {
      apiName,
      ...context,
    });
  };

  const logApiError = (apiName: string, error: any, context?: Record<string, any>) => {
    logger.logError(`❌ API Error: ${apiName}`, {
      apiName,
      error: error.message || error,
      ...context,
    });

    // Show user-friendly error message
    const currentPage = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('Connect Timeout Error')) {
      errorHandler.addError({
        type: 'timeout',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        page: currentPage,
        component: componentName,
      });
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorHandler.addError({
        type: 'timeout',
        message: 'Request is taking longer than expected. Please try again.',
        page: currentPage,
        component: componentName,
      });
    } else if (!error.response) {
      errorHandler.addError({
        type: 'network',
        message: 'Network error occurred. Please check your connection.',
        page: currentPage,
        component: componentName,
      });
    } else if (error.response?.status >= 500) {
      errorHandler.addError({
        type: 'server',
        message: 'Server is currently unavailable. Please try again in a moment.',
        page: currentPage,
        component: componentName,
      });
    } else if (error.response?.status === 401) {
      errorHandler.addError({
        type: 'general',
        message: 'Your session has expired. Please log in again.',
        page: currentPage,
        component: componentName,
        autoHide: false,
      });
    } else {
      errorHandler.addError({
        type: 'general',
        message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
        page: currentPage,
        component: componentName,
      });
    }
  };

  return {
    ...logger,
    logApiCall,
    logApiSuccess,
    logApiError,
  };
};

// Simple hook for handling errors in any component
export const useUserErrorHandler = (componentName: string) => {
  const errorHandler = useErrorHandler();
  const currentPage = typeof window !== 'undefined' ? window.location.pathname : 'unknown';

  return {
    showTimeoutError: (customMessage?: string) => {
      errorHandler.addError({
        type: 'timeout',
        message: customMessage || 'Connection timeout. Please check your internet and try again.',
        page: currentPage,
        component: componentName,
      });
    },
    showNetworkError: (customMessage?: string) => {
      errorHandler.addError({
        type: 'network',
        message: customMessage || 'Network error. Please check your connection.',
        page: currentPage,
        component: componentName,
      });
    },
    showServerError: (customMessage?: string) => {
      errorHandler.addError({
        type: 'server',
        message: customMessage || 'Server is temporarily unavailable. Please try again.',
        page: currentPage,
        component: componentName,
      });
    },
    showGeneralError: (message: string) => {
      errorHandler.addError({
        type: 'general',
        message,
        page: currentPage,
        component: componentName,
      });
    },
  };
};