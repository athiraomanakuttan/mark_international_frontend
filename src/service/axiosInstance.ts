import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import { productionErrorReporter } from '@/lib/productionErrorReporter';
import { getTimeoutForUrl } from '@/lib/apiConfig';
import { timeoutLogger } from '@/lib/timeoutLogger';

// Global error handler for user notifications
let globalErrorHandler: ((error: {
  type: 'network' | 'timeout' | 'server' | 'general';
  message: string;
  page?: string;
  component?: string;
}) => void) | null = null;

export const setGlobalErrorHandler = (handler: typeof globalErrorHandler) => {
  globalErrorHandler = handler;
};

const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI

const axiosInstance = axios.create({
  baseURL: BACKEND_URI,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Safe helpers to avoid accessing `localStorage` or `window` in server/runtime contexts
const isClient = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const safeGet = (key: string): string | null => {
  try {
    if (typeof window !== "undefined")
      // return null
    return isClient() && typeof localStorage.getItem === 'function' ? localStorage.getItem(key) : null;
    else return null;
  } catch (e) {
    return null;
  }
};
const safeSet = (key: string, value: string) => {
  try {
    if (isClient() && typeof localStorage.setItem === 'function') localStorage.setItem(key, value);
  } catch (e) {
    /* swallow */
  }
};
const safeRemove = (key: string) => {
  try {
    if (isClient() && typeof localStorage.removeItem === 'function') localStorage.removeItem(key);
  } catch (e) {
    /* swallow */
  }
};
const safeRedirectToLogin = () => {
  if (typeof window !== 'undefined') {
    // Use try-catch to prevent any potential header issues during redirect
    try {
      // Clear any problematic headers or state before redirect
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('x-action-redirect');
      }
      window.location.href = '/login';
    } catch (error) {
      console.warn('Safe redirect failed, falling back to replace:', error);
      try {
        window.location.replace('/login');
      } catch (fallbackError) {
        console.error('All redirect methods failed:', fallbackError);
        // Last resort - force page reload to login
        window.location.assign('/login');
      }
    }
  }
};


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Don't send auth header for login/auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/') || config.url?.includes('/login');
    
    if (!isAuthEndpoint) {
      const token = safeGet('accessToken');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Remove any problematic headers that might cause x-action-redirect issues
    if (config.headers) {
      // Clean headers to prevent invalid characters
      const headersToRemove = ['x-action-redirect', 'x-action', 'redirect'];
      headersToRemove.forEach(headerName => {
        delete config.headers[headerName];
      });
      
      // Ensure all header values are properly encoded
      Object.keys(config.headers).forEach(key => {
        const value = config.headers[key];
        if (typeof value === 'string') {
          // Remove any non-ASCII characters that might cause header issues
          config.headers[key] = value.replace(/[^\x20-\x7E]/g, '');
        }
      });
    }

    // Set dynamic timeout based on URL
    if (config.url) {
      config.timeout = getTimeoutForUrl(config.url);
    }

    // Log request start and store requestId in config
    const requestId = logger.logRequestStart(config, {
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
      component: (config as any).metadata?.component || 'unknown',
    });
    
    // Store requestId in config for later use
    (config as any).requestId = requestId;
    
    return config;
  },
  (error: AxiosError) => {
    logger.error('❌ Request Interceptor Error', {
      error: error.message,
      code: error.code,
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
    });
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response
    const requestId = (response.config as any).requestId;
    if (requestId) {
      logger.logRequestSuccess(requestId, response);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log the error with full context
    const requestId = (error.config as any)?.requestId;
    if (requestId) {
      logger.logRequestError(requestId, error);
    } else {
      logger.error('❌ Response Error (No Request ID)', {
        url: error.config?.url,
        method: error.config?.method,
        error: error.message,
        code: error.code,
        status: error.response?.status,
      });
    }

    // Report to production error tracking
    if (typeof window !== 'undefined') {
      const errorType = error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ECONNABORTED' 
        ? 'timeout' 
        : !error.response 
        ? 'network' 
        : error.response.status >= 500 
        ? 'server' 
        : 'general';

      productionErrorReporter.reportError({
        type: errorType,
        message: error.message,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method?.toUpperCase(),
        responseStatus: error.response?.status,
        responseTime: (error.config as any)?.metadata?.responseTime,
        stackTrace: error.stack,
      });
    }

    // Handle network/timeout errors with user-friendly notifications
    if (!error.response) {
      const currentPage = typeof window !== 'undefined' ? window.location.pathname : 'server';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Log timeout for analysis
        timeoutLogger.logTimeout(
          currentPage,
          (error.config as any)?.metadata?.component || 'unknown',
          error.config?.url || 'unknown',
          error.config?.timeout || 30000,
          error.stack
        );

        // Show user-friendly timeout error
        if (globalErrorHandler) {
          globalErrorHandler({
            type: 'timeout',
            message: 'Request is taking longer than expected. Please try again.',
            page: currentPage,
          });
        } else if (typeof window !== 'undefined') {
          toast.error('Request timeout. Please check your connection and try again.');
        }
        return Promise.reject(new Error('Connection timeout'));
      }
      
      if (error.message.includes('Network Error') || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
        // Show user-friendly network error
        if (globalErrorHandler) {
          globalErrorHandler({
            type: 'network',
            message: 'Unable to connect to the server. Please check your internet connection.',
            page: currentPage,
          });
        } else if (typeof window !== 'undefined') {
          toast.error('Network error. Please check your connection.');
        }
        return Promise.reject(new Error('Network connection failed'));
      }
    }

    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = safeGet('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await axios.post<{ accessToken: string }>(
          `${BACKEND_URI}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;
        safeSet('accessToken', newAccessToken);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        safeRemove('accessToken');
        safeRemove('refreshToken');
        if (typeof window !== 'undefined') {
          // Only show toast / redirect on client
          toast.error('Session expired. Please log in again.');
          safeRedirectToLogin();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
