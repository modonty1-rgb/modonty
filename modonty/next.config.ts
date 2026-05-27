import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → modonty/.env.local takes precedence.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  // NO global /articles → / redirect.
  // Reason: when a request arrives as /articles/{arabic-slug} (raw, non-percent-encoded),
  // Vercel's URL normalizer corrupts the Arabic chars to "?" placeholders,
  // turning the path into /articles?-??-????? which then matches a `source: '/articles'`
  // rule and redirects to / (homepage). Google interpreted the chain as soft-404
  // → "Not found (404)" in URL Inspection → de-indexing risk for 17+ articles.
  // Safer to let /articles 404 cleanly for legacy bookmarks than break new article URLs.
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  // cacheComponents: true,  // DISABLED 2026-05-27 — Next.js 16 PPR/Cache Components
  // auto-generates `x-next-cache-tags` HTTP header that includes the dynamic route path.
  // Arabic slugs (e.g. /articles/دليلك-الشامل-...) contain non-ASCII chars → throws
  // `TypeError: Invalid character in header content` (ERR_INVALID_CHAR) on every request
  // for articles NOT in build-time static prerender. Result: 100% 500 from origin for
  // Arabic-slugged articles, Google reports "Page fetch: NOT_FOUND" in GSC.
  // Trade-off: lose PPR streaming benefit (~ms latency); gain working Arabic article URLs.
  // Re-enable when Next.js fixes auto-tag URL-encoding for non-ASCII routes.
  serverExternalPackages: ["cohere-ai"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // design-preview only — Unsplash placeholder images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // illustrated avatars (team carousel privacy fallback)
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/9.x/**",
      },
    ],
    formats: ["image/avif", "image/webp"], // modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 75, 100],
    minimumCacheTTL: 2678400, // 31 days
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
      'embla-carousel-react',
    ],
  },
};

export default nextConfig;
