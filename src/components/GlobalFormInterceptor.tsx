/**
 * Global Form Interceptor
 * Intercepts all form submissions to prevent x-action-redirect header issues
 */

'use client';

import { useEffect } from 'react';

export const GlobalFormInterceptor = () => {
  useEffect(() => {
    const interceptFormSubmissions = () => {
      // Get all forms on the page
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Remove any existing listeners to avoid duplicates
        const existingHandler = (form as any)._safeSubmitHandler;
        if (existingHandler) {
          form.removeEventListener('submit', existingHandler);
        }

        // Create new safe submit handler
        const safeSubmitHandler = (e: Event) => {
          try {
            // Remove any problematic hidden inputs
            const problematicInputs = form.querySelectorAll(
              'input[name*="action"], input[name*="redirect"], input[name*="x-action"]'
            );
            problematicInputs.forEach(input => {
              input.remove();
            });

            // Remove action attribute if it might cause issues
            if (form.hasAttribute('action')) {
              const action = form.getAttribute('action');
              if (action && (action.includes('action') || action.includes('redirect'))) {
                form.removeAttribute('action');
              }
            }

            // Ensure method is not causing issues
            if (form.method && form.method.toLowerCase() === 'post') {
              // Check if this looks like a server action
              const hasServerActionInputs = form.querySelector('input[name^="$ACTION_"]');
              if (hasServerActionInputs) {
                console.warn('Detected potential server action, preventing submission');
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }
          } catch (error) {
            console.warn('Error in form interceptor:', error);
          }
        };

        // Add the safe handler
        form.addEventListener('submit', safeSubmitHandler, { capture: true });
        
        // Store reference for cleanup
        (form as any)._safeSubmitHandler = safeSubmitHandler;
      });
    };

    // Initial setup
    interceptFormSubmissions();

    // Setup mutation observer to handle dynamically added forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node is a form
            if (element.tagName === 'FORM') {
              interceptFormSubmissions();
            }
            
            // Check if the added node contains forms
            const forms = element.querySelectorAll('form');
            if (forms.length > 0) {
              interceptFormSubmissions();
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup function
    return () => {
      observer.disconnect();
      
      // Remove all our handlers
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const handler = (form as any)._safeSubmitHandler;
        if (handler) {
          form.removeEventListener('submit', handler);
          delete (form as any)._safeSubmitHandler;
        }
      });
    };
  }, []);

  return null;
};