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
    version: "0.66.1 (admin)",
    title: "Clients table cleanup: inline Activate button removed · clearer status badges (Unpaid vs Pending) · Activate/Suspend pages",
    items: [
      { type: "fix" as const, text: "admin 0.66.1 — removed the inline 'Activate' button from the /clients table. Activation now lives only on the dedicated /clients/activate page — kills the confusing 'Pending + Activate side by side looks like two statuses' problem." },
      { type: "fix" as const, text: "admin 0.66.1 — status badges disambiguated: an ACTIVE client with payment not recorded now shows 'Unpaid' (amber) instead of 'Pending'; a not-yet-activated client shows 'Pending' (slate) as a proper colored badge. Same 'Unpaid' wording is now used on the Account page header (was raw 'PENDING') — table and account page are consistent." },
      { type: "feat" as const, text: "admin 0.66.1 — added the Activate Client and Suspend Client pages (/clients/activate, /clients/suspend) linked from the sidebar: list of Pending (resp. Active) clients with a per-row confirm button." },
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
