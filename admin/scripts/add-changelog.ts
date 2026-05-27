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
    version: "1.48.8 (modonty)",
    title: "modonty v1.48.8 — TRUE ROOT-CAUSE FIX: replaced unstable_cache in proxy.ts with module-scoped in-memory cache (was triggering ERR_INVALID_CHAR on x-next-cache-tags for ALL Arabic-slugged article requests)",
    items: [
      { type: "fix" as const, text: "Found the REAL culprit via Vercel runtime log analysis: error source is `serverless-middleware` (i.e. proxy.ts), NOT the page handler. proxy.ts calls `isPublishedSlug(slug)` which uses `unstable_cache` from `next/cache`. Next.js 16 cache layer writes `x-next-cache-tags` HTTP header on every cache hit/miss. This header validation rejects non-ASCII chars — and the request route path (which contains Arabic slug) ends up in the header → ERR_INVALID_CHAR → 500 from origin on EVERY uncached article request." },
      { type: "fix" as const, text: "Replaced `unstable_cache` with a simple module-scoped in-memory `Set<string>` + 5-minute TTL + inFlight dedupe in modonty/lib/archive-cache.ts. Identical 5-min refresh semantics, identical fail-open behavior (DB error = treat as published), but ZERO touching of Next.js cache infrastructure → no auto-tag header write → no ERR_INVALID_CHAR." },
      { type: "fix" as const, text: "Trade-off: lose `revalidateTag('published-slugs')` programmatic invalidation. Mitigation: simply wait up to 5 min after publish/unpublish OR redeploy to force-clear in-memory cache. Modonty publishes a few articles per week — 5min delay is acceptable. Added `clearPublishedSlugsCache()` export for future explicit invalidation if needed." },
      { type: "fix" as const, text: "All previous fix attempts (v1.48.3 catch handlers, v1.48.4 disable cacheComponents, v1.48.5 force-dynamic, v1.48.6 connection(), v1.48.7 rollback) were chasing the wrong layer. The proxy.ts cache was the ACTUAL bug source — page-level fixes can't help when proxy crashes first." },
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
