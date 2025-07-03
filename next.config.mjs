/** @type {import('next').NextConfig} */

const nextConfig = {
  devIndicators: false,
  images: {
    domains: ['fal.ai', 'storage.googleapis.com'],
    unoptimized: true,
  },
};

export default nextConfig;
