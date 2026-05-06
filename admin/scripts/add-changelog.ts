/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "1.44.0",
    title: "modonty v1.44.0 — bug fixes: share URL encoding + client follow 500 + UX polish",
    items: [
      { type: "fix" as const, text: "share URL: decodeURIComponent على window.location.href في ShareButtons + article-mobile-sidebar-sheet + article-mobile-engagement-bar + article-utilities — المستخدم كان ينسخ %D8%A3%D9%81... بدل النص العربي" },
      { type: "fix" as const, text: "client follow 500: @@unique([clientId, sessionId]) في ClientLike كان يمنع أكثر من مستخدم من متابعة نفس العميل (MongoDB يعتبر null==null) — تحوّل لـ @@index + prisma db push على dev+prod" },
      { type: "fix" as const, text: "client page: label 'حفظ' → 'مفضّلة' / 'محفوظ' → 'مُضافة' في client-favorite-button" },
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
