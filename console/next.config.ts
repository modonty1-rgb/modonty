import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → console/.env.local takes precedence.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Next 16 default is [75] only; any other value is silently coerced to the nearest
    // allowed one. Must mirror QUALITIES in dataLayer/components/optimized-image.tsx,
    // or a quality set in code never reaches the browser (bug QUALCFG, 8 Aug 2026).
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Bunny CDN — reels media zone (client-gallery images live there since 2026-07-07)
      {
        protocol: "https",
        hostname: "modonty-reels-media.b-cdn.net",
        pathname: "/**",
      },
      // Bunny CDN — clients pull zone (client logos now serve from Bunny via bunnyUrl)
      {
        protocol: "https",
        hostname: "modonty-clients.b-cdn.net",
        pathname: "/**",
      },
      // Bunny CDN — platform assets pull zone (OG/logos)
      {
        protocol: "https",
        hostname: "modonty-asset.b-cdn.net",
        pathname: "/**",
      },
      // Bunny Stream — video thumbnails (the library's own pull zone, not a storage zone)
      {
        protocol: "https",
        hostname: "vz-a26f5478-719.b-cdn.net",
        pathname: "/**",
      },
    ],
  },

  /**
   * The address clients integrate against is `api.modonty.com/v1/...`, never
   * `console.modonty.com/api/v1/...`.
   *
   * That string goes into an env var on THEIR server, so it has to outlive whichever of
   * our apps happens to serve it — if the endpoint ever moves, the subdomain follows and
   * not one client edits a line. This rewrite is what makes the public shape real: the
   * route lives at /api/v1 in this app, and /v1 is the promise we published.
   */
  async rewrites() {
    return [
      { source: "/v1/:path*", destination: "/api/v1/:path*" },
    ];
  },
};

export default nextConfig;
