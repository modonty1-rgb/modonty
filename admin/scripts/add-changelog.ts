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
    version: "1.48.3 (modonty)",
    title: "modonty v1.48.3 — CRITICAL reliability fix: article page now resilient to cold-start failures + maxDuration 60s prevents intermittent 500 that Google flagged as 'Page fetch failed'",
    items: [
      { type: "fix" as const, text: "Root cause of GSC URL Inspection reporting 'Page fetch: NOT_FOUND' on valid articles even AFTER env-var fix (yesterday 2026-05-27 02:50 AM): Vercel Pro Fluid default function timeout is 10s. Cold-start Prisma+MongoDB Atlas connection regularly takes 6-9s. When 8 parallel DB queries hit a cold function (auth + settings + social + article + faqs + 4x related), one occasionally exceeds 10s → 500 → Google flags URL as unreachable. Reproduced 3 out of 5 Googlebot smartphone requests to /articles/دليلك-الشامل-حول-أفضل-طرق-زيادة-الدخل-في-السعودية returned 500 from origin (cache=MISS) while CDN HIT requests returned 200." },
      { type: "fix" as const, text: "Added `export const maxDuration = 60` to articles/[slug]/page.tsx. Vercel Pro Fluid allows up to 800s; chose 60s as safe headroom (observed warm renders complete in <3s). Predictable cost: zero unless requests actually exceed 10s, which the fix eliminates." },
      { type: "fix" as const, text: "Wrapped each member of both Promise.all blocks (auth/settings/social/faqs/related) in `.catch` handlers with structured `console.error` logging. Single transient failure no longer crashes the whole render. Critical article query (getArticleBySlugMinimal) intentionally remains hard-required — if THAT fails, throw so error surfaces in Vercel logs instead of hiding behind silent fallback." },
      { type: "fix" as const, text: "Each failure now logs `[articles/{slug}] {function} failed:` to Vercel runtime logs — silent intermittent 500s become observable structured errors. Future investigations can `grep` logs by article slug to find recurring offenders, then add `'use cache'` to that specific DB call." },
      { type: "fix" as const, text: "Sister fix yesterday (not previously logged): 5 missing env vars added to Vercel modonty project (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_TRUST_HOST`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) per Vercel's per-project monorepo best-practice. Triggered FRESH BUILD via `gitSource` API (not redeploy — redeploy reuses cached artifacts from the broken build). New deployment regenerated PRERENDER cache with working DATABASE_URL. CDN now serves correct 200 responses on subsequent crawls. Combined with this v1.48.3 fix, intermittent 500s should drop to near-zero." },
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
