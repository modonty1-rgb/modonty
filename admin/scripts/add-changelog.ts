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
    version: "0.85.0 (admin)",
    title: "Dashboard = the Modonty thermometer — GA4-powered, one page",
    items: [
      { type: "feature" as const, text: "Dashboard home now merges the full analytics overview: visitor actions (bookings/messages/questions/comments), GA4 KPIs, activity timeline, traffic sources, and geography — /analytics redirects home." },
      { type: "feature" as const, text: "All numbers come straight from Google Analytics 4 (the source of truth); clicking any card opens the detail list from our database with full contact info." },
      { type: "feature" as const, text: "New drill-down pages: /analytics/leads (visitor actions with status filters), /analytics/cta (button clicks), /analytics/engagement (likes/saves/shares)." },
      { type: "fix" as const, text: "Geography counts were inflated by summing city rows (one visitor in several cities counted twice) — countries now use GA4's own country-level user counts." },
      { type: "improve" as const, text: "Geography pins Saudi Arabia and Egypt on top; other countries collapse. Windows-safe country labels (code + name instead of flag emoji)." },
      { type: "improve" as const, text: "Data audited end-to-end: every displayed number re-derived independently from the GA4 Data API and the database — all matched." },
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
