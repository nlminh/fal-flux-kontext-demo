/** @type {import('next').NextConfig} */
import { withBotId } from 'botid/next/config';

const nextConfig = {
  devIndicators: false,
  images: {
    domains: ['fal.ai', 'storage.googleapis.com'],
    unoptimized: true,
  },
};

export default withBotId(nextConfig);
