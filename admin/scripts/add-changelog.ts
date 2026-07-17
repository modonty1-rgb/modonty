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
    version: "0.19.0 (console)",
    title: "Turn your numbers into stories — photo + paragraph per achievement",
    items: [
      { type: "feature" as const, text: "«إنجازاتنا بالأرقام» was just a number and a label. Now each achievement can carry a photo and a short paragraph — so «+250 مشروع» can show the work behind it and tell the story in a line or two." },
      { type: "feature" as const, text: "The photo uploads straight from your dashboard (compressed automatically), and the paragraph is capped so the cards stay tidy. Both are optional — leave them empty and it stays a clean number." },
      { type: "improve" as const, text: "When you replace or remove a photo, the old file is cleaned up automatically — nothing is left behind." },
    ],
  },
  {
    version: "1.73.0 (modonty)",
    title: "Achievement story cards on your public page",
    items: [
      { type: "feature" as const, text: "The «إنجازاتنا بالأرقام» section on your page now shows story cards: a photo on top, the number, the label, and your paragraph. An achievement without a photo simply shows as a clean number tile — the section mixes both gracefully." },
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
