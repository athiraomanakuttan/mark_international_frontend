// Network health check utility
import axiosInstance from '@/service/axiosInstance';

export const checkNetworkHealth = async (): Promise<boolean> => {
  try {
    // Simple health check endpoint
    const response = await axiosInstance.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Network health check failed:', error);
    return false;
  }
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      // Don't retry on client errors (4xx except 408, 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && 
          error.response?.status !== 408 && error.response?.status !== 429) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};