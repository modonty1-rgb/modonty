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
    version: "1.10.3 (admin) · 0.2.2 (shared)",
    title: "Images with Arabic names no longer overwrite each other",
    items: [
      { type: "fix" as const, text: "When a picture was saved to our storage, its filename was stripped down to English letters and numbers only — so a fully Arabic name was erased and the picture was simply called \"file\". Every Arabic-named picture belonging to the same company then landed on the exact same slot and quietly replaced the one before it. Filenames now keep their Arabic, and every picture gets its own unique fingerprint, so two pictures can never share a slot again." },
      { type: "fix" as const, text: "The three extra crops Google asks us to publish for each article picture were saved beside it under the same name, so they were overwritten too — meaning some articles were handing Google crops that belonged to a different picture entirely." },
      { type: "improve" as const, text: "Moving a picture between companies now keeps the picture's own identity instead of inventing a new name for it." },
      { type: "improve" as const, text: "A safety rule was added in code: any future upload path that forgets to make the filename unique will refuse to build, instead of silently overwriting a customer's image." },
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
