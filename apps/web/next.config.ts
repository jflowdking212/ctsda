import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ctsda/contracts', '@ctsda/ui'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@ctsda/contracts'],
  },
};

export default nextConfig;