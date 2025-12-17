// Environment configuration validation
const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;

if (!BACKEND_URI) {
  throw new Error('NEXT_PUBLIC_BACKEND_URI environment variable is not defined');
}

// Validate URL format
try {
  new URL(BACKEND_URI);
} catch (error) {
  throw new Error(`Invalid BACKEND_URI format: ${BACKEND_URI}`);
}

export const config = {
  BACKEND_URI,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Network timeouts configuration
export const networkConfig = {
  defaultTimeout: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
} as const;