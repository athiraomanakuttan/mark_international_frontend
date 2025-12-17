// User-friendly error notification system
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ErrorState {
  id: string;
  message: string;
  type: 'network' | 'timeout' | 'server' | 'general';
  timestamp: Date;
  page?: string;
  component?: string;
  autoHide?: boolean;
}

interface ErrorContextType {
  errors: ErrorState[];
  addError: (error: Omit<ErrorState, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
};

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorState[]>([]);

  const addError = (error: Omit<ErrorState, 'id' | 'timestamp'>) => {
    const newError: ErrorState = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, newError]);

    // Log the error for debugging
    logger.error(`User Error: ${error.message}`, {
      type: error.type,
      page: error.page,
      component: error.component,
    });

    // Auto-hide after 5 seconds if autoHide is true
    if (error.autoHide !== false) {
      setTimeout(() => {
        removeError(newError.id);
      }, 5000);
    }
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
      <ErrorNotifications />
    </ErrorContext.Provider>
  );
};

const ErrorNotifications: React.FC = () => {
  const { errors, removeError } = useErrorHandler();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            error.type === 'timeout' || error.type === 'network'
              ? 'bg-red-50 border-red-500 text-red-700'
              : error.type === 'server'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
              : 'bg-gray-50 border-gray-500 text-gray-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {error.type === 'timeout' && '⏱️ Connection Timeout'}
                {error.type === 'network' && '🌐 Network Error'}
                {error.type === 'server' && '🛠️ Server Error'}
                {error.type === 'general' && '⚠️ Error'}
              </div>
              <div className="text-sm mt-1">{error.message}</div>
              {error.component && (
                <div className="text-xs text-gray-500 mt-1">
                  Component: {error.component}
                </div>
              )}
            </div>
            <button
              onClick={() => removeError(error.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};