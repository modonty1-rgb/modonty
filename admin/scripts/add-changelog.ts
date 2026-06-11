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
    version: "1.58.0 (modonty)",
    title: "Faster article & client pages",
    items: [
      { type: "improve" as const, text: "Article and client pages now cache their heavy content across visitors, so repeat opens of the same page are 4–5× faster. The per-visitor parts (your reactions, live counts) stay live and accurate." },
    ],
  },
  {
    version: "0.77.0 (admin)",
    title: "Client save no longer blocked by client-owned fields",
    items: [
      { type: "fix" as const, text: "Saving a client could fail with errors like 'Description must be less than 1000 characters' on fields the client fills from their console (description, address, VAT/Tax, legal name, slogan…). The admin form now validates only the fields it owns, so these client-owned values never block a save again — 17 fields fixed." },
    ],
  },
  {
    version: "0.18.0 (console)",
    title: "Sidebar shows your current company name",
    items: [
      { type: "fix" as const, text: "The company name in the sidebar now updates instantly when you change it — it reads the live value from your profile instead of the one saved at login, so it always matches the dashboard greeting." },
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
