// Connection monitoring component that warns users about connectivity issues
'use client';
import React, { useState, useEffect } from 'react';
import { useUserErrorHandler } from '@/hooks/useLogger';
import { logger } from '@/lib/logger';

const ConnectionMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');
  const { showNetworkError, showGeneralError } = useUserErrorHandler('ConnectionMonitor');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
      logger.info('🌐 Connection restored', { connectionStatus: 'online' });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      showNetworkError('You appear to be offline. Please check your internet connection.');
      logger.warn('🌐 Connection lost', { connectionStatus: 'offline' });
    };

    // Monitor connection quality
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setConnectionQuality('offline');
        return;
      }

      try {
        const start = performance.now();
        
        // Try to fetch a small resource to test connection
        const response = await fetch('/favicon.ico?' + Math.random(), {
          method: 'HEAD',
          cache: 'no-cache',
        });
        
        const end = performance.now();
        const responseTime = end - start;

        if (response.ok) {
          if (responseTime > 3000) {
            setConnectionQuality('poor');
          } else {
            setConnectionQuality('good');
          }
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        setConnectionQuality('poor');
        logger.warn('🌐 Poor connection detected', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality every 30 seconds
    const qualityInterval = setInterval(checkConnectionQuality, 30000);
    
    // Initial check
    checkConnectionQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityInterval);
    };
  }, [showNetworkError]);

  // Show connection status bar for poor/offline connections
  if (connectionQuality === 'offline' || connectionQuality === 'poor') {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-white text-sm ${
        connectionQuality === 'offline' ? 'bg-red-600' : 'bg-yellow-600'
      }`}>
        {connectionQuality === 'offline' && (
          <>🔴 You are offline. Some features may not work properly.</>
        )}
        {connectionQuality === 'poor' && (
          <>🟡 Poor connection detected. Requests may be slower than usual.</>
        )}
      </div>
    );
  }

  return null;
};

export default ConnectionMonitor;