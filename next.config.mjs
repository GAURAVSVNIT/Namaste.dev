/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/fashion-hub-31bce.firebasestorage.app/o/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      buffer: false,
      process: false,
    };

    // Add error boundary for better error handling
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    };

    // Optimize chunks to prevent circular dependency issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: {
            chunks: 'async',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: /[\/\\]node_modules[\/\\]/,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      }
    };

    // Handle ESM modules better
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  transpilePackages: [
    'livekit-client',
    '@splinetool/react-spline'
  ],
};

export default nextConfig;
