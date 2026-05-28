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
    version: "0.65.2 (admin)",
    title: "Search Console: switched coverage source from top-100-traffic to sitemap (real numbers)",
    items: [
      { type: "fix" as const, text: "admin 0.65.2 — /search-console previously used `getCachedTopPages(28, 100)` as the URL source. Result: any indexed page with zero impressions in the 28-day window was INVISIBLE in our admin. Real example caught: GSC Pages Indexing report showed 43 indexed / 140 not indexed (total 183 URLs known to Google), but our admin showed only 31 total / 16 live (a quarter of the truth). Khalid spotted the discrepancy by comparing the GSC UI Page Indexing screenshot vs our admin TOTAL counter." },
      { type: "feat" as const, text: "admin 0.65.2 — page.tsx now uses sitemap.xml as source-of-truth (102 URLs we control + publish) UNIONED with GSC top 1000 (catches edge cases of pages Google discovered outside sitemap). Traffic data (clicks/impressions/CTR/position) attached per-URL where available; zeroes otherwise. Result on prod (after fix, verified live): TOTAL 31 → 110, LIVE 16 → 27, Coverage 73% → 82%, Inspect-all button 56 → 135 URLs. Now the page reflects actual coverage rather than a traffic-filtered subset." },
      { type: "fix" as const, text: "admin 0.65.2 — increased top pages query window from limit=100 to limit=1000 (still 28-day window). Catches more long-tail traffic pages that fell below the top-100 cutoff but still get impressions." },
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
