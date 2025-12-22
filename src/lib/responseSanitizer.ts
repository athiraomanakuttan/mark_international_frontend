/**
 * Response Header Sanitizer
 * This module ensures no problematic headers are sent in any response
 */

import { NextResponse } from 'next/server';

export function sanitizeResponse(response: NextResponse): NextResponse {
  // List of problematic headers to remove
  const problematicHeaders = [
    'x-action-redirect',
    'x-action',
    'action-redirect',
    'redirect',
  ];

  // Remove problematic headers
  problematicHeaders.forEach(header => {
    response.headers.delete(header);
  });

  // Ensure all header values are properly encoded
  response.headers.forEach((value, key) => {
    if (typeof value === 'string') {
      // Check for invalid characters
      if (!/^[\x20-\x7E]*$/.test(value)) {
        console.warn(`Removing header with invalid characters: ${key}`);
        response.headers.delete(key);
      }
    }
  });

  return response;
}

/**
 * Wrap any NextResponse to ensure it's safe
 */
export function createSafeResponse(init?: ResponseInit): NextResponse {
  const response = NextResponse.next(init);
  return sanitizeResponse(response);
}

/**
 * Create a safe redirect response
 */
export function createSafeRedirectResponse(url: string, init?: ResponseInit): NextResponse {
  try {
    const response = NextResponse.redirect(url, init);
    return sanitizeResponse(response);
  } catch (error) {
    console.error('Error creating redirect response:', error);
    // Fallback to basic response
    return createSafeResponse();
  }
}