'use client';
import { useEffect, useRef, useCallback } from 'react';

interface SafeAsyncOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onError?: (error: any) => void;
  onTimeout?: () => void;
}

export const useSafeAsync = (
  asyncFunction: () => Promise<any>,
  dependencies: React.DependencyList,
  options: SafeAsyncOptions = {}
) => {
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef(0);
  
  const {
    timeout = 30000,
    retries = 2,
    retryDelay = 1000,
    onError,
    onTimeout
  } = options;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const safeAsyncCall = useCallback(async () => {
    if (!isMountedRef.current) return;

    retryCountRef.current = 0;

    const attemptCall = async (): Promise<any> => {
      if (!isMountedRef.current) return;

      return new Promise(async (resolve, reject) => {
        // Setup timeout
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            console.warn(`⏱️ Async call timed out after ${timeout}ms`);
            onTimeout?.();
            reject(new Error('Request timeout'));
          }
        }, timeout);

        try {
          const result = await asyncFunction();
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          
          if (isMountedRef.current) {
            resolve(result);
          }
        } catch (error) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          
          if (!isMountedRef.current) return;

          // Retry logic
          if (retryCountRef.current < retries) {
            retryCountRef.current++;
            console.log(`🔄 Retrying async call (${retryCountRef.current}/${retries})`);
            
            setTimeout(() => {
              attemptCall().then(resolve).catch(reject);
            }, retryDelay);
          } else {
            console.error('❌ Async call failed after retries:', error);
            onError?.(error);
            reject(error);
          }
        }
      });
    };

    return attemptCall();
  }, dependencies);

  useEffect(() => {
    safeAsyncCall().catch(console.error);
  }, dependencies);

  return {
    retry: safeAsyncCall,
    cancel: () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };
};

// Debounced version for rapid state changes
export const useDebouncedSafeAsync = (
  asyncFunction: () => Promise<any>,
  dependencies: React.DependencyList,
  debounceMs: number = 500,
  options: SafeAsyncOptions = {}
) => {
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedAsyncFunction = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await asyncFunction();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, debounceMs);
    });
  }, dependencies);

  return useSafeAsync(debouncedAsyncFunction as any, dependencies, options);
};