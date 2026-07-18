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
    version: "0.90.0 (admin)",
    title: "One SEO number everywhere + a cleaner Articles header",
    items: [
      { type: "improve" as const, text: "The SEO score now comes from a single source of truth across the whole app — the clients table, the client detail, the /seo page and the console badge all show the exact same number. The old competing scorer that produced different Meta/JSON-LD percentages is gone." },
      { type: "fix" as const, text: "Saving on a client's /seo page used to fail silently when the client was missing an unrelated required field (e.g. Industry). It now validates only the SEO fields and clearly lists anything blocking the save." },
      { type: "improve" as const, text: "The Price Range field is finally clear: each option is labelled (economical → luxury), a hint explains it's a general affordability signal like Google Maps — not a product price — and you can clear it." },
      { type: "improve" as const, text: "The Articles page uses the Google logo (instead of the word «SEO») on the score column, matching the clients table." },
      { type: "improve" as const, text: "Cleaner Articles header: removed duplicated count chips and the misleading average-SEO badge, dropped the redundant Details dialog, put the title + search + filters on one line, and fixed the article count (it now shows the true total, not the first page)." },
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
