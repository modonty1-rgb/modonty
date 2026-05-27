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
    version: "1.49.0 (modonty)",
    title: "modonty v1.49.0 — OFFICIAL Next.js 16 cache-tag fix: upgraded to next@16.3.0-canary.17 (includes PR #93601 — encodeCacheTag for non-ASCII slugs). All-day saga ends with the actual fix from Vercel team.",
    items: [
      { type: "feat" as const, text: "Upgraded modonty/package.json: `next ^16.2.2` → `16.3.0-canary.17` (exact pin) + `eslint-config-next` same. This canary release contains PR #93601 (merged May 7, 2026 by Hendrik Liebau) which adds `encodeCacheTag()` helper in `packages/next/src/server/lib/encode-cache-tag.ts` and applies it everywhere cache tags are constructed — including the implicit route-pathname tag that was crashing our Arabic article URLs." },
      { type: "feat" as const, text: "Bug is officially confirmed by Next.js team in Issue #93142 (reported May 7, 2026 by ornakash — identical to ours: Next.js 16.2.4 + cacheComponents + non-ASCII slug → `TypeError: Invalid character in header content ['x-next-cache-tags']`). Confirmed root cause via Vercel runtime logs + reading Next.js source code: implicit-tags.ts injects raw pathname into tag set without encoding, then header writer rejects non-ASCII bytes per Node http.validateHeaderValue." },
      { type: "feat" as const, text: "Backport to next-16-2 branch (PR #93918) merged May 19 — will land in 16.2.7 stable. We picked canary.17 over waiting for 16.2.7 because: (a) canary.17 is OLDER than canary.24-26 which enable new default features (rootParams/varyParams/optimisticRouting/cachedNavigations) we haven't audited; (b) canary.17 has NO documented breaking changes; (c) the site is down — speed matters." },
      { type: "fix" as const, text: "Reverted ALL today's failed local workarounds (v1.48.3-v1.48.8): the catch handlers, force-dynamic attempts, connection() experiment, the in-memory cache rewrite in archive-cache.ts. None addressed the actual Next.js source-code bug. proxy.ts goes back to using `unstable_cache` (the proper Next.js way) since the fix in canary.17 also encodes those tag values." },
      { type: "fix" as const, text: "Lesson burned in: 5 hours of pushing speculative fixes accomplished nothing. The 30-minute parallel-agent web research that came after found the official fix immediately. Going forward: when a bug touches framework internals, search for upstream issues BEFORE attempting local workarounds." },
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
