/**
 * Form Helper Utilities to prevent x-action-redirect header issues
 * These helpers ensure proper form submission handling in Next.js 15
 */

/**
 * Safe form submission handler that prevents header-related issues
 * @param event - Form submit event
 * @param submitHandler - Async function to handle form submission
 * @param options - Configuration options
 */
export const handleSafeFormSubmit = async (
  event: React.FormEvent,
  submitHandler: () => Promise<void>,
  options: {
    onStart?: () => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    preventRedirectHeaders?: boolean;
  } = {}
) => {
  try {
    event.preventDefault();
    
    // Clear any problematic headers or state
    if (options.preventRedirectHeaders && typeof window !== 'undefined') {
      // Remove any redirect-related state that might cause header issues
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('x-action-redirect');
        sessionStorage.removeItem('redirect');
      }
    }

    if (options.onStart) {
      options.onStart();
    }

    await submitHandler();

    if (options.onSuccess) {
      options.onSuccess();
    }
  } catch (error) {
    console.error('Form submission error:', error);
    if (options.onError) {
      options.onError(error);
    }
  }
};

/**
 * Safe redirect function that prevents header issues
 * @param url - URL to redirect to
 * @param method - Redirect method ('href', 'replace', 'assign')
 */
export const safeRedirect = (url: string, method: 'href' | 'replace' | 'assign' = 'href') => {
  if (typeof window !== 'undefined') {
    try {
      // Clear any problematic state before redirect
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('x-action-redirect');
      }
      
      switch (method) {
        case 'replace':
          window.location.replace(url);
          break;
        case 'assign':
          window.location.assign(url);
          break;
        case 'href':
        default:
          window.location.href = url;
          break;
      }
    } catch (error) {
      console.error('Redirect failed:', error);
      // Fallback to next method
      if (method === 'href') {
        safeRedirect(url, 'replace');
      } else if (method === 'replace') {
        safeRedirect(url, 'assign');
      } else {
        console.error('All redirect methods failed for URL:', url);
      }
    }
  }
};

/**
 * Clean URL constructor that removes problematic parameters
 * @param pathname - Path to redirect to
 * @param origin - Origin URL (defaults to window.location.origin)
 */
export const createCleanURL = (pathname: string, origin?: string): URL => {
  try {
    const baseOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const url = new URL(pathname, baseOrigin);
    
    // Remove any problematic search parameters
    url.searchParams.delete('x-action-redirect');
    url.searchParams.delete('redirect');
    
    return url;
  } catch (error) {
    console.error('URL construction failed:', error);
    // Fallback to basic URL
    return new URL(pathname, 'http://localhost:3000');
  }
};

/**
 * Form data sanitizer to remove potential problematic fields
 * @param formData - FormData object to sanitize
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  const sanitized = new FormData();
  
  for (const [key, value] of formData.entries()) {
    // Skip any redirect-related fields that might cause header issues
    if (key.toLowerCase().includes('redirect') || key.toLowerCase().includes('x-action')) {
      continue;
    }
    sanitized.append(key, value);
  }
  
  return sanitized;
};

/**
 * Headers sanitizer to remove problematic headers
 * @param headers - Headers object to sanitize
 */
export const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    // Skip problematic headers
    if (key.toLowerCase().includes('x-action') || key.toLowerCase().includes('redirect')) {
      continue;
    }
    
    // Ensure header value doesn't contain invalid characters
    try {
      // Basic validation for header value
      if (typeof value === 'string' && value.length > 0) {
        // Remove any non-ASCII characters that might cause issues
        const cleanValue = value.replace(/[^\x20-\x7E]/g, '');
        if (cleanValue.length > 0) {
          sanitized[key] = cleanValue;
        }
      }
    } catch (error) {
      console.warn(`Skipping problematic header ${key}:`, error);
    }
  }
  
  return sanitized;
};