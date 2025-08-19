/** @type {import('next').NextConfig} */
const nextConfig = {
  // AWS Amplify configuration - supports both static and dynamic content
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Optimize chunk loading to prevent ChunkLoadError
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // In development, prevent chunk loading issues
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
  images: {
    domains: ['localhost'], // Add any external image domains you plan to use
    formats: ['image/webp', 'image/avif'],
  },
  
  // AWS Amplify supports rewrites and API routes
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
  // Environment variables
  env: {
    CUSTOM_KEY: 'prework-app',
    VERSION: '1.0.0',
  },
}

module.exports = nextConfig