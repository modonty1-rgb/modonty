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
    version: "0.57.3 (admin)",
    title: "admin v0.57.3 — Dashboard workflow board · sidebar count badges · collapsible sections",
    items: [
      { type: "feature" as const, text: "New Article Workflow board on the dashboard home (/). Seven tone-coded KPI cards (Writing · Draft · Awaiting Approval · Needs Revision · Scheduled · Published · Archived) with live counts across all clients. Each card is a clickable link to /articles?status=KEY for instant filtering." },
      { type: "feature" as const, text: "Sidebar workflow links now show floating red count badges on top-right of the icon (matches the bell notification pattern). Six workflow transition links display the count of articles in the relevant source status. Caps at 99+." },
      { type: "feature" as const, text: "All <DashboardSection> cards are now collapsible. Click the header to toggle open/closed — chevron rotates 180°. Each section is independent (not accordion); all open by default; no persistence. The drill-down link (e.g. 'All Articles') stays clickable separately from the toggle." },
      { type: "feature" as const, text: "Added getArticleStatusCounts() server action with unstable_cache + tag 'article-status-counts'. Cache is invalidated via revalidateTag in 5 mutation paths: transition-article, gated-transition, archive-article, create-article, delete-article. Counts stay fresh after every workflow change." },
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
