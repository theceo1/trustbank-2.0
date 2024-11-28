/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  output: 'standalone',
  experimental: {
    serverActions: {
      enabled: true
    },
    serverComponentsExternalPackages: [],
    typedRoutes: true
  },
};

module.exports = nextConfig;
