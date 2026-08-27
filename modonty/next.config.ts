import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → modonty/.env.local takes precedence.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

// Any deployment that is not production (the test subdomain, branch previews) must
// stay out of Google. Vercel drops its own noindex header once a custom domain is
// attached to a preview branch, so we send it ourselves.
// NOT keyed on NEXT_PUBLIC_SITE_URL: that variable carries the SAME value in all
// three environments, so the condition would never fire on the test domain.
//
// The fallback matters more than it looks. This used to be exactly
// `process.env.VERCEL_ENV === "production"`, which is right on Vercel and inverted anywhere
// else: off Vercel `VERCEL_ENV` is undefined, so `isProduction` is false, so the header
// below is ADDED — a self-hosted or differently-hosted production would serve
// `X-Robots-Tag: noindex, nofollow` on every page and quietly leave Google's index.
//
// So: trust `VERCEL_ENV` when it exists (on Vercel it always does, and it is the only value
// that distinguishes preview from production, since NODE_ENV is "production" for both). With
// no `VERCEL_ENV` at all we are not on Vercel, and `NODE_ENV` is the honest signal — a real
// build is indexable, `next dev` is not.
const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

// Content-Security-Policy — REPORT-ONLY on purpose (24 Aug 2026, card SEC15).
//
// Enforcing a CSP written from a reading of the code, without first watching what real pages
// actually request, is how a site breaks silently: the audio player stops, analytics goes quiet,
// an image turns blank — and nobody notices for days because nothing errors server-side. So this
// ships as `-Report-Only`: the browser evaluates it and logs every violation, and blocks nothing.
//
// The origin list below was gathered from the code, not from a dev page load (a dev page proved
// useless — the analytics scripts are env-gated off locally, so it reported zero external hosts).
//
// `'unsafe-inline'` for scripts is not laziness: this app server-renders 137 inline scripts per
// page (measured on the homepage). Removing it needs per-request nonces threaded through the
// framework — a separate task, not a line in this file. Even with it, the policy still blocks
// script injection from any origin we did not list, which is the common case.
//
// TO ENFORCE LATER: watch the console on test.modonty.com across the audio page, an article, a
// partner page and the homepage; add whatever legitimately appears; only then rename the header
// to `Content-Security-Policy`.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // GTM · GA4 · Clarity are the three that inject their own script tags.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms",
  // Tailwind ships classes, but 53 inline `style` attributes remain on the homepage alone.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // b-cdn.net covers all four Bunny zones (reels · clients · assets · stream covers).
  "img-src 'self' data: blob: https://*.b-cdn.net https://res.cloudinary.com https://api.dicebear.com https://www.google-analytics.com https://www.googletagmanager.com",
  // The Quran recitations stream from numbered mp3quran servers AND from cdn.islamic.network;
  // Bunny serves reel video. islamic.network was NOT in the code grep — report-only mode caught
  // it on the first load of /audio ("Loading media from cdn.islamic.network violates..."), which
  // is precisely the failure an enforced-on-day-one policy would have shipped as silence.
  "media-src 'self' blob: https://*.mp3quran.net https://cdn.islamic.network https://*.b-cdn.net",
  "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://vitals.vercel-insights.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  // Matches X-Frame-Options: DENY above — kept in both because old browsers read only the latter.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // NOT `upgrade-insecure-requests`: the browser logs "ignored when delivered in a report-only
  // policy" and it adds nothing but console noise while we are still collecting violations.
  // Add it in the same edit that renames the header to the enforcing one.
].join("; ");

const nextConfig: NextConfig = {
  // NO global /articles → / redirect.
  // Reason: when a request arrives as /articles/{arabic-slug} (raw, non-percent-encoded),
  // Vercel's URL normalizer corrupts the Arabic chars to "?" placeholders,
  // turning the path into /articles?-??-????? which then matches a `source: '/articles'`
  // rule and redirects to / (homepage). Google interpreted the chain as soft-404
  // → "Not found (404)" in URL Inspection → de-indexing risk for 17+ articles.
  // Safer to let /articles 404 cleanly for legacy bookmarks than break new article URLs.
  // Retired /whats-new (merged into /news). ASCII path → safe to redirect (no Arabic-slug corruption).
  redirects: async () => [
    { source: "/whats-new", destination: "/news", permanent: true },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        // Resolves the DNS of linked third parties early. The project standard lists it; it was
        // the one header of the seven still missing (checked 24 Aug).
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // Only on non-production deployments. robots.txt stays permissive on purpose:
        // a Disallow would stop Google fetching the page, so it would never read this
        // header and the URL could still be indexed from an external link.
        ...(isProduction
          ? []
          : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
      ],
    },
  ],
  cacheComponents: true,
  // Dev-only: allow LAN-IP access (mobile testing) — Next blocks cross-origin dev assets by default
  allowedDevOrigins: ["192.168.1.3"],
  serverExternalPackages: ["cohere-ai"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // illustrated avatars (team carousel privacy fallback)
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/9.x/**",
      },
      // Bunny CDN — reels media (image reels + video thumbnails)
      {
        protocol: "https",
        hostname: "modonty-reels-media.b-cdn.net",
        pathname: "/**",
      },
      // TEMP (branch version-2 only — Bunny migration test): clients pull zone
      {
        protocol: "https",
        hostname: "modonty-clients.b-cdn.net",
        pathname: "/**",
      },
      // TEMP (branch version-2 only — Bunny migration): platform assets pull zone (OG/logos)
      {
        protocol: "https",
        hostname: "modonty-asset.b-cdn.net",
        pathname: "/**",
      },
      // Bunny Stream — video covers (the library's own pull zone, not a storage zone)
      {
        protocol: "https",
        hostname: "vz-a26f5478-719.b-cdn.net",
        pathname: "/**",
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
