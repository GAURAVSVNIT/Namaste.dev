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
  // Optimize for better chunk loading and React 19 compatibility
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer, webpack, dev }) => {
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

    // Add path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    };

    // Better chunk splitting for React 19 compatibility
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              chunks: 'async',
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              chunks: 'all',
              name: 'vendor',
              test: /[\/\\]node_modules[\/\\]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            react: {
              chunks: 'all',
              name: 'react',
              test: /[\/\\]node_modules[\/\\](react|react-dom)[\/\\]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            radix: {
              chunks: 'all',
              name: 'radix', 
              test: /[\/\\]node_modules[\/\\]@radix-ui[\/\\]/,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Handle ESM modules better
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Add better error handling for chunk loading
    if (dev) {
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },
  transpilePackages: [
    'livekit-client',
    '@splinetool/react-spline',
    '@react-three/fiber',
    '@react-three/drei',
    'react-spring',
  ],
};

export default nextConfig;
