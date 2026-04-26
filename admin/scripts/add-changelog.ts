/**
 * Run before every push: pnpm changelog
 * Updates version + items before each run — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// ─── UPDATE THIS BEFORE EVERY PUSH ───────────────────────────────────────────
const entry = {
  version: "0.43.0",
  title: "Removal Queue + Stage 14 — تتبع طلبات GSC اليدوية",
  items: [
    { type: "feature" as const, text: "Removal Queue: زر 'Remove in GSC' يفتح Google Search Console مع نسخ الـ URL — يتبع 3 حالات (pending → opened → done)" },
    { type: "feature" as const, text: "Stage 14 في الـ pipeline: زر 'Request indexing in GSC' يفتح URL Inspection مع تعبئة الـ URL تلقائياً — نفس آلية الـ 3 حالات" },
    { type: "feature" as const, text: "DB tracking عبر model GscManualRequest: يحفظ openedAt و doneAt مع زر undo للتراجع — يميّز بين REMOVAL و INDEXING" },
    { type: "feature" as const, text: "رسائل واضحة لحكم Google: PASS = على Google · NEUTRAL = صحيحة لكن لم تُفهرس بعد · FAIL = فيها مشكلة" },
    { type: "fix" as const, text: "تصحيح الـ encoding للـ URL عند النسخ — يطابق الصيغة التي يعرضها GSC تماماً" },
    { type: "fix" as const, text: "إثبات أن Indexing API لا يعمل لمحتوى modonty (سياسة Google: JobPosting + BroadcastEvent فقط) — استبدلنا الزر بـ deep-link لـ GSC" },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

const localDb = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const prodDb = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL } } });

async function run() {
  if (!process.env.DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }
  if (!process.env.PRODUCTION_DATABASE_URL) { console.error("❌ PRODUCTION_DATABASE_URL missing in .env.local"); process.exit(1); }

  const [local, prod] = await Promise.all([
    localDb.changelog.create({ data: entry }),
    prodDb.changelog.create({ data: entry }),
  ]);

  console.log(`✅ LOCAL  — id: ${local.id}`);
  console.log(`✅ PROD   — id: ${prod.id}`);
  console.log(`Done. v${entry.version} added to both databases.`);

  await Promise.all([localDb.$disconnect(), prodDb.$disconnect()]);
}

run().catch((e) => { console.error(e); process.exit(1); });
