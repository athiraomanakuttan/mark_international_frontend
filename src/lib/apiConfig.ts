// Timeout configurations for different environments
export const API_TIMEOUTS = {
  // Default timeouts in milliseconds
  DEFAULT: 15000,      // 15 seconds
  UPLOAD: 60000,       // 60 seconds for file uploads
  EXPORT: 45000,       // 45 seconds for exports
  SEARCH: 10000,       // 10 seconds for searches
  AUTH: 8000,          // 8 seconds for auth
  DASHBOARD: 12000,    // 12 seconds for dashboard data
  
  // Critical operations that might be slow
  BULK_DELETE: 30000,  // 30 seconds
  BULK_UPDATE: 30000,  // 30 seconds
  REPORTS: 25000,      // 25 seconds
  
  // Quick operations
  QUICK: 5000,         // 5 seconds
} as const;

// Get timeout based on URL pattern
export const getTimeoutForUrl = (url: string): number => {
  // Auth endpoints
  if (url.includes('/auth/')) {
    return API_TIMEOUTS.AUTH;
  }
  
  // File operations
  if (url.includes('/upload') || url.includes('/file')) {
    return API_TIMEOUTS.UPLOAD;
  }
  
  // Export operations
  if (url.includes('/export') || url.includes('/download')) {
    return API_TIMEOUTS.EXPORT;
  }
  
  // Search operations
  if (url.includes('/search')) {
    return API_TIMEOUTS.SEARCH;
  }
  
  // Dashboard operations
  if (url.includes('/dashboard') || url.includes('/stats')) {
    return API_TIMEOUTS.DASHBOARD;
  }
  
  // Staff list (frequently called)
  if (url.includes('/staff/get-all-active')) {
    return API_TIMEOUTS.QUICK;
  }
  
  // Bulk operations
  if (url.includes('/bulk') || url.includes('/delete-multiple')) {
    return API_TIMEOUTS.BULK_DELETE;
  }
  
  // Reports
  if (url.includes('/report') || url.includes('/leads')) {
    return API_TIMEOUTS.REPORTS;
  }
  
  return API_TIMEOUTS.DEFAULT;
};

// Retry configuration
export const RETRY_CONFIG = {
  retries: 2,
  retryDelay: 1000, // 1 second
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx errors
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'NETWORK_ERROR' ||
      (error.response && error.response.status >= 500)
    );
  }
};