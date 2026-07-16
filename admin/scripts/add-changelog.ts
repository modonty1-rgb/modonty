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
    version: "0.88.0 (admin)",
    title: "Every important action now has a name on it",
    items: [
      { type: "feature" as const, text: "More than one person works in the admin now, and until today every action was anonymous — if an article was deleted by mistake, nothing could tell you who did it. Sixteen actions now record who did them: deletes (article, client, category, tag), publishing and every workflow move, creates and edits, admin accounts, settings, maintenance runs and full cascades." },
      { type: "feature" as const, text: "Each line keeps the user id AND a snapshot of their email, name and role at that moment — so the log still answers 'who?' long after someone leaves and their account is gone." },
      { type: "improve" as const, text: "Deletes read the name BEFORE the row disappears: the log says «حُذف: أفضل واكس شعر», not «deleted 6a53…». Maintenance and cascade write one line for the whole run, not one per step." },
      { type: "improve" as const, text: "A password is never recorded — not the value, not even the hash. It is unreadable to us by design, it would hand every account to anyone who opens the table, and it says nothing about who acted. The user id already does." },
      { type: "improve" as const, text: "A failed log can never fail the action: the work is already done and saved by the time we write the line. The log is a witness, not a gatekeeper." },
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
