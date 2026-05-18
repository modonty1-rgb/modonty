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
    version: "0.8.0 (console)",
    title: "console v0.8.0 — GA4 analytics lib + campaign_interest event wired",
    items: [
      { type: "feature" as const, text: "Copied modonty/lib/analytics to console/lib/analytics (3 files: ga4-server, visitor-cookie, events-registry). Same patterns + after() wrapper for Vercel serverless." },
      { type: "feature" as const, text: "Wired campaign_interest event in console/app/(dashboard)/dashboard/campaigns/actions/register-interest.ts — fires alongside notifyTelegram on successful interest registration (NEW row only). Includes client context (id/slug/name/industry) + campaign_reach + userId." },
      { type: "feature" as const, text: "Added 4 GA4 env vars to console Vercel project (NEXT_PUBLIC_GA4_MEASUREMENT_ID + GA4_API_SECRET + GA4_PROPERTY_ID + GA4_CLIENT_EMAIL). console was previously unlinked from Vercel — linked to modonty-console project." },
      { type: "feature" as const, text: "**Phase 3 = 20/20 events wired** (Wave 1-4 + campaign_interest). All conversion events now flow through GA4 from both modonty + console." },
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
