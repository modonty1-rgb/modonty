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
    version: "0.91.0 (admin)",
    title: "Client Accounts rebuilt as a clean billing statement",
    items: [
      { type: "improve" as const, text: "Each client now has a proper account page (Clients → Accounts → Statement): the top shows the three numbers that matter — what's owed now, total paid, and when the subscription ends — followed by read-only facts and the invoices ledger." },
      { type: "improve" as const, text: "Issuing an invoice is now just the amount + the end date (the plan, period and currency come from the client). It's created as «due» and does not touch the subscription until it's actually paid." },
      { type: "improve" as const, text: "«Mark paid» is the single action that extends the subscription: the client's end date always follows the latest paid invoice — automatic, no manual editing." },
      { type: "improve" as const, text: "Payment status is derived, not stored: an invoice reads paid until its end date passes, then becomes due again — so a renewal is always visible when it's actually needed." },
      { type: "improve" as const, text: "Accounts now live under Clients (overview at Clients → Accounts, per-client statement on the client), and the dashboard «expiring soon» alert stays in sync the moment an invoice is settled." },
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
