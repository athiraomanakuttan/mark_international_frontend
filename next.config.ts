import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This allows production builds to succeed
    // even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  // Fix workspace root detection warning
  outputFileTracingRoot: __dirname,
  
  // Production optimizations for Next.js 15
  experimental: {
    // Disable problematic features in production
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Headers configuration to prevent invalid character errors
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
