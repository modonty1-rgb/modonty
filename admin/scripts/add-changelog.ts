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
  version: "1.42.0",
  title: "modonty proxy — 410 Gone للمقالات المحذوفة + drill-down dialog",
  items: [
    { type: "feature" as const, text: "modonty proxy.ts: أي article slug غير موجود كـ PUBLISHED (محذوف، مؤرشف، مسودة) يرجع 410 Gone — Google يحذفه من الفهرس أسرع بكثير من noindex" },
    { type: "feature" as const, text: "drill-down dialog في Search Console: ضغطة على Canonical/Robots/Mobile/Soft 404 تفتح قائمة الـ URLs المتأثرة مع التفاصيل الكاملة (declared vs Google's choice)" },
    { type: "fix" as const, text: "كشفت drill-down مشكلة canonical حقيقية: الموقع يعلن canonical بدون www بينما Google اختار www — يحتاج توحيد لاحقاً" },
    { type: "fix" as const, text: "كشفت double-encoding في URLs الـ clients (%25D8 بدل %D8) — يحتاج إصلاح في canonical generator" },
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
