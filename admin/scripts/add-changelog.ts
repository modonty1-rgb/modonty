/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "0.57.0",
    title: "admin v0.57.0 — Bing Webmaster page منفصلة + IndexNow card انتقل لها",
    items: [
      { type: "feature" as const, text: "صفحة /bing-webmaster مستقلة: KPIs (clicks/impressions/CTR/avg position) + Top 10 queries + Top 10 pages — تستخدم نفس INDEXNOW_KEY كـ Bing Webmaster API key" },
      { type: "feature" as const, text: "Bing API client (admin/lib/bing-webmaster/client.ts): GetQueryStats + GetPageStats + GetRankAndTrafficStats + GetCrawlStats + aggregator helpers + error handling (graceful per-call)" },
      { type: "refactor" as const, text: "IndexNow card: انتقل من /search-console → /bing-webmaster (موضعه الطبيعي مع Bing) — /search-console يبقى Google فقط" },
      { type: "feature" as const, text: "Sidebar: Bing Webmaster entry جديد بأيقونة Globe — بين Search Console و SEO Overview" },
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
