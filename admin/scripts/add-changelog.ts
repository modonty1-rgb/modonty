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
    version: "1.48.7 (modonty)",
    title: "modonty v1.48.7 — emergency rollback: removed connection() (v1.48.6 broke PRERENDER for ALL articles). Site restored to known partial-working state (PRERENDER + CDN HIT serve 200; only fresh-MISS still hits underlying Next.js cache-tag bug)",
    items: [
      { type: "fix" as const, text: "v1.48.6 added `await connection()` at top of ArticlePageContent per Next.js official docs recommendation. BUT: this opted EVERY article URL out of static prerender — converted PRERENDER HIT (200) into runtime MISS (500). Made the problem worse: yesterday only Arabic-hamza-alif slugs failed; today after v1.48.6 ALL article URLs failed including the previously-working ones (ما-هو-السيو etc)." },
      { type: "fix" as const, text: "Removed `await connection()` + the import. Article page is back to using PRERENDER cache from build time. ما-هو-السيو and other non-hamza-alif slugs now return 200 from PRERENDER. Hamza-alif slugs (دليلك-... etc) still 500 on origin MISS due to the underlying Next.js ERR_INVALID_CHAR on x-next-cache-tags bug." },
      { type: "fix" as const, text: "Lesson learned: connection() forces opt-out of static prerender for the ENTIRE route, not just for the cache-tag write. Per docs this is correct behavior but unsuitable for our case where we WANT prerender to serve fast cached responses + only want to skip the failing cache-tag write." },
      { type: "fix" as const, text: "Next investigation path: (a) check if `'use cache'` directive in getArticleSlugsForStaticParams is what causes the cache tag to include slug — maybe removing it from generateStaticParams helps; (b) explore Next.js GitHub issue #73965 for any community workarounds; (c) consider URL rewrite at Vercel CDN level to mask the cache-tag header for /articles routes." },
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
