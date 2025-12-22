/**
 * Global error handler for x-action-redirect and other header issues
 * This should be imported in the root layout to catch all unhandled errors
 */

'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const GlobalErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error && typeof error === 'object') {
        const errorMessage = error.message || String(error);
        
        // Check for x-action-redirect header issues
        if (
          errorMessage.includes('x-action-redirect') ||
          errorMessage.includes('Invalid character in header') ||
          errorMessage.includes('ERR_INVALID_CHAR') ||
          (error.code && error.code === 'ERR_INVALID_CHAR')
        ) {
          console.warn('Caught x-action-redirect error:', error);
          
          // Prevent the default unhandled rejection behavior
          event.preventDefault();
          
          // Clean up any problematic state
          try {
            if (typeof window !== 'undefined') {
              // Clear problematic session/local storage
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('x-action-redirect');
                sessionStorage.removeItem('redirect');
              }
              if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('x-action-redirect'); 
                localStorage.removeItem('redirect');
              }
              
              // Clean up any form state
              const forms = document.querySelectorAll('form');
              forms.forEach(form => {
                const redirectInputs = form.querySelectorAll(
                  'input[name*="redirect"], input[name*="action"], input[name*="x-action"]'
                );
                redirectInputs.forEach(input => {
                  input.remove();
                });
              });
            }
          } catch (cleanupError) {
            console.warn('Error during global cleanup:', cleanupError);
          }
          
          // Show user-friendly error
          toast.error('Request failed due to a header issue. Please refresh and try again.');
          
          return;
        }
      }
      
      // Log other unhandled rejections
      console.error('Unhandled promise rejection:', error);
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error;
      
      if (error && typeof error === 'object') {
        const errorMessage = error.message || String(error);
        
        // Check for x-action-redirect header issues
        if (
          errorMessage.includes('x-action-redirect') ||
          errorMessage.includes('Invalid character in header') ||
          errorMessage.includes('ERR_INVALID_CHAR')
        ) {
          console.warn('Caught global x-action-redirect error:', error);
          
          // Prevent default error handling
          event.preventDefault();
          
          // Show user-friendly error
          toast.error('A header error occurred. Please refresh the page and try again.');
          
          return false;
        }
      }
      
      // Log other global errors
      console.error('Global error:', error);
    };

    // Register global error handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return null;
};