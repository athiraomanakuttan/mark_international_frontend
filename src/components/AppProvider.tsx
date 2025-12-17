// Main error and logging provider that combines user errors and debug logging
'use client';
import React from 'react';
import { ErrorProvider } from './ErrorProvider';
import DebugProvider from './DebugProvider';
import { setGlobalErrorHandler } from '@/service/axiosInstance';
import { useErrorHandler } from './ErrorProvider';

const ErrorHandlerSetup: React.FC = () => {
  const { addError } = useErrorHandler();

  React.useEffect(() => {
    // Connect axios global error handler to our error system
    setGlobalErrorHandler(addError);
  }, [addError]);

  return null;
};

interface AppProviderProps {
  children: React.ReactNode;
  enableDebugInProduction?: boolean;
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  enableDebugInProduction = false 
}) => {
  return (
    <ErrorProvider>
      <ErrorHandlerSetup />
      {/* Connection monitor - always enabled in production */}
      <ConnectionMonitor />
      {/* Debug panel - only in development unless explicitly enabled */}
      <DebugProvider enableInProduction={enableDebugInProduction}>
        {children}
      </DebugProvider>
    </ErrorProvider>
  );
};

// Import connection monitor
import ConnectionMonitor from './ConnectionMonitor';

export default AppProvider;