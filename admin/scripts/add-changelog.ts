/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "1.48.5 (modonty)",
    title: "modonty v1.48.5 — surgical fix per Next.js official docs: dynamic='force-dynamic' on /articles/[slug] only (bypasses PPR auto-tagging for Arabic slugs while keeping cacheComponents enabled for the rest of the site)",
    items: [
      { type: "fix" as const, text: "v1.48.4 attempted to disable cacheComponents globally — broke build because 24+ files across the codebase use the `'use cache'` directive which requires that flag enabled (e.g. get-platform-social-links, getArticleSlugsForStaticParams, all metadata helpers). Reverted that approach immediately." },
      { type: "fix" as const, text: "Researched Next.js official docs + GitHub issues. Confirmed this is a KNOWN unfixed Next.js 16 limitation: cacheTag values must be valid HTTP header content (ASCII only — per https://nextjs.org/docs/app/api-reference/functions/cacheTag), but PPR auto-generates cache tags from the route path which contains the slug. Arabic slugs → invalid header → 500. Issue thread: https://github.com/vercel/next.js/discussions/26758 (Arabic chars not supported) + https://github.com/vercel/next.js/issues/73965 (Non-ASCII routes break routing)." },
      { type: "fix" as const, text: "Added `export const dynamic = 'force-dynamic'` ONLY to modonty/app/articles/[slug]/page.tsx. This opts out of PPR + Cache Components for the article route specifically, eliminating the auto-tag generation that triggers ERR_INVALID_CHAR. Rest of the site (homepage, clients, categories, legal pages) still benefits from cacheComponents." },
      { type: "fix" as const, text: "Trade-off accepted: every article view now triggers full SSR (no PRERENDER cache, no PPR streaming benefit). Acceptable because (a) modonty has ~25 articles, low volume; (b) Vercel CDN still caches the SSR response via standard HTTP cache headers; (c) reliable Arabic URL indexing is more valuable than ~ms saved by PPR. Re-evaluate when Next.js fixes the underlying limitation." },
      { type: "fix" as const, text: "Kept maxDuration=60 (still useful safety net for genuine cold-starts on Vercel Pro Fluid, where default 10s timeout was too tight for 6-9s Prisma+MongoDB Atlas connection bootstrap)." },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

// Hardcoded PROD DB URL (user decision 2026-04-29) — to avoid env juggling.
// ⚠️ Trade-off: URL credentials are in git history. Rotate Atlas password = update all 3 changelog scripts.
const PRODUCTION_DATABASE_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const localDb = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const prodDb = new PrismaClient({ datasources: { db: { url: PRODUCTION_DATABASE_URL } } });

async function run() {
  if (!process.env.DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }

  for (const entry of entries) {
    const [local, prod] = await Promise.all([
      localDb.changelog.create({ data: entry }),
      prodDb.changelog.create({ data: entry }),
    ]);
    console.log(`✅ v${entry.version} — LOCAL: ${local.id}  PROD: ${prod.id}`);
  }

  console.log(`\nDone. ${entries.length} entries added to both databases.`);
  await Promise.all([localDb.$disconnect(), prodDb.$disconnect()]);
}

run().catch((e) => { console.error(e); process.exit(1); });
