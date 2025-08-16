/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // basePath: '/pre-work-app',
  // assetPrefix: '/pre-work-app/',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Required for static export
    domains: ['localhost'], // Add any external image domains you plan to use
    formats: ['image/webp', 'image/avif'],
  },
  // Note: rewrites, headers, and API routes are not supported in static export
  // Configure static file serving for uploads and saved folders
  /*
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
      {
        source: '/saved/:path*',
        destination: '/api/saved/:path*',
      },
    ];
  },
  // Custom headers for better performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  */
  // Environment variables
  env: {
    CUSTOM_KEY: 'prework-app',
    VERSION: '1.0.0',
  },
}

module.exports = nextConfig