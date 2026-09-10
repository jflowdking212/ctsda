import path from 'path';
import type { NextConfig } from 'next';

const strictCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
  connect-src 'self' https://api.stripe.com https://ctsdamerica.com https://www.ctsdamerica.com https://ctsda.acecoterieconsulting.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https:;
  frame-ancestors 'self';
`.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

const relaxedCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
  connect-src 'self' https://api.stripe.com https://ctsdamerica.com https://www.ctsdamerica.com https://ctsda.acecoterieconsulting.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https:;
  frame-ancestors 'self';
`.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: strictCsp },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
        ],
      },
      {
        source: '/portal/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: relaxedCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
