import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["cohere-ai"],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [100, 90, 75, 65],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-slider',
      '@radix-ui/react-tabs',
      '@radix-ui/react-label',
    ],
  },
};

export default nextConfig;




