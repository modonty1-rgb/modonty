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
    version: "0.86.0 (admin)",
    title: "Dashboard rebuilt as a triage screen — a ranked Today list tells you where to start",
    items: [
      { type: "feature" as const, text: "Today strip at the top: the 5 things costing you money or clients right now, ranked (dead booking funnel, unreachable clients, waiting inbox, approvals, clients with zero articles) — each row links straight to its fix." },
      { type: "feature" as const, text: "New Media section: unused files, missing alt text, failing SEO — each card opens a table with the image itself, its score and where it is used. Image SEO score now lives in the shared dataLayer scorer." },
      { type: "feature" as const, text: "Clients section gains Images cards (no logo / no hero / no share image) and a new 'unreachable' segment combining every client a visitor cannot contact." },
      { type: "fix" as const, text: "Data-loss guard: images inside a published article's gallery were counted as unused and could be deleted, leaving a hole in a live article. Gallery usage now blocks deletion and counts everywhere." },
      { type: "improve" as const, text: "One visual language: red = costing you now, amber = this week, green = healthy; icons on every card; zero-value stages compress into chips so live numbers get the space." },
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
