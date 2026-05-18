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
    version: "0.9.0 (console)",
    title: "console v0.9.0 — GA4 Realtime Dashboard MVP (Phase 5 Wave 1)",
    items: [
      { type: "feature" as const, text: "New console/lib/analytics/ga4-data-api.ts — Server-side GA4 Data API wrapper with JWT auth (supports both GA4_PRIVATE_KEY and GA4_PRIVATE_KEY_BASE64). runReport + runRealtimeReport helpers + access token caching (1h)." },
      { type: "feature" as const, text: "Added getClientOverview(clientId) helper — returns 6 KPIs in 1 Promise.all: activeUsers (last 30 min), total events (7d + 28d), unique users (7d + 28d), top 10 events by name. Cached via unstable_cache (60s TTL, tag: ga4-overview)." },
      { type: "feature" as const, text: "New GA4RealtimeCard component on /dashboard/analytics top — 4 gradient KPI cards (نشط الآن · أحداث · زوار · أنواع) + top 5 events bar chart. Arabic event labels (article_view → 'مشاهدة مقال', etc). Graceful error fallback if GA4 unreachable." },
      { type: "feature" as const, text: "Added GA4_PRIVATE_KEY_BASE64 to console Vercel project + .env.shared (base64-encoded PEM, avoids special-char shell issues per Vercel CLI bug with values starting with '-')." },
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
