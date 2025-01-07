import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint rules in production builds
  },
  /* other config options here */
};

export default nextConfig;
