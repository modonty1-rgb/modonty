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
    version: "1.10.2 (admin) · 1.87.0 (modonty)",
    title: "Article images fade in instead of popping in",
    items: [
      { type: "improve" as const, text: "Every picture we upload has had a tiny blurred preview stored with it — 591 out of 591 — but nothing ever asked for it, so article covers appeared out of nowhere once loaded. The cover now shows that blurred preview instantly and sharpens into the real photo. It does not slow the real image down." },
      { type: "fix" as const, text: "The last fallback in the image chain pointed at a file that does not exist. If an article had no cover AND its company had neither a banner nor a logo, we were handing Google a dead link. No article is in that state today — but the trap was set for the next one. It now falls back to the platform share image, then the brand logo." },
      { type: "fix" as const, text: "The article's search-preview card inside the admin was showing a broken thumbnail for the same reason, and was reading the old image address instead of the new one." },
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
