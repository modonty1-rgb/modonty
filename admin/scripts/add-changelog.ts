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
    version: "0.10.0 (console)",
    title: "console v0.10.0 — GA4 Dashboard Phase 5 Wave 2: 4 deep-dive widgets",
    items: [
      { type: "feature" as const, text: "New /dashboard/analytics → GA4 Deep-Dive section with 4 widgets that pull straight from Google Analytics Data API (cached 5-10 min)." },
      { type: "feature" as const, text: "Widget 1 — أكثر المقالات مشاهدة (28 يوم): top 10 articles by article_view event, filtered by client_id. Shows ranked list with progress bars." },
      { type: "feature" as const, text: "Widget 2 — مصادر الزيارات (28 يوم): sessionSource × sessionMedium breakdown with Arabic labels (Google → Google, facebook.com → Facebook, t.co → Twitter/X, etc). Shows session count + % share + user count." },
      { type: "feature" as const, text: "Widget 3 — نمط النشاط الأسبوعي (28 يوم): heatmap 7 days × 24 hours, color intensity by eventCount. Hover tooltip shows exact day/hour/event count. Helps client decide best publishing time." },
      { type: "feature" as const, text: "Widget 4 — قمع التحويل (28 يوم): visualizes the funnel views → engagements → intents → conversions with per-step drop-off rate %. Final line shows overall view-to-conversion %." },
      { type: "feature" as const, text: "New helpers in console/lib/analytics/ga4-data-api.ts: getTopArticles(), getTrafficSources(), getDayPattern(), getConversionFunnel(). All cached via unstable_cache with tag 'ga4-overview' for unified invalidation." },
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
