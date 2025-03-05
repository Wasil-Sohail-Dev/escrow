/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'third-party--bucket.s3.us-east-1.amazonaws.com',
      'lh3.googleusercontent.com',
      'vercel.app',
      'escrow-wine.vercel.app'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'third-party--bucket.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      }
    ],
    minimumCacheTTL: 60,
    unoptimized: process.env.NODE_ENV === 'development',
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 
