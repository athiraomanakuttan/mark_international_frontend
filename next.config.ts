import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This allows production builds to succeed
    // even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  // Fix workspace root detection warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
