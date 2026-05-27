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
    version: "0.63.3 (modonty)",
    title: "modonty v0.63.3 — CRITICAL: stop converting transient render errors into 404 (was causing Google de-indexing)",
    items: [
      { type: "fix" as const, text: "CRITICAL SEO bug: modonty/app/articles/[slug]/page.tsx line 538-541 had a catch-all that called `notFound()` after `unstable_rethrow(err)` — meaning ANY non-navigation exception during render (cold-start DB timeout, Settings fetch flake, auth library throw, Promise.all rejection) was converted to HTTP 404. Vercel CDN served stale 200 responses to users (masking the issue), but Google's URL Inspection Live Test bypasses CDN → hits raw origin → cold start → catch swallows → 404 to Google. GSC reported 17 pages as 'Not found (404)' + 7 as '5xx server error' — all valid PUBLISHED articles. Root cause documented in SESSION-LOG." },
      { type: "fix" as const, text: "Fix: removed the post-rethrow `notFound()` call. Added `console.error` for Vercel logs visibility. Re-throws the original error so the existing error boundaries (articles/[slug]/error.tsx + articles/error.tsx + root error.tsx — all already exist) render properly + Vercel logs capture the real cause. Critical SEO outcome: Google now sees transient errors as 500 (which it retries naturally) instead of 404 (which signals 'page deleted')." },
      { type: "fix" as const, text: "The only legitimate notFound() in this file stays at line 199 (after `if (!articleRaw)` — correct usage when DB confirms the slug genuinely doesn't exist). Total diff: 4 lines added (3 comment + 1 console.error + 1 throw), 1 line removed (the bad notFound). Zero functional regression for legitimate 404s." },
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
