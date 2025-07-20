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
};

export default nextConfig;
