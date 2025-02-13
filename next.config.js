/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['third-party--bucket.s3.us-east-1.amazonaws.com']
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 