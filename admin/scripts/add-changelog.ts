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
  version: "0.41.0",
  title: "نظام سجل الأخطاء الداخلي + إصلاح OTP تيليجرام",
  items: [
    { type: "feature" as const, text: "نظام تسجيل أخطاء داخلي — يلتقط تلقائياً كل أخطاء السيرفر بدون خدمات خارجية" },
    { type: "feature" as const, text: "صفحة عرض سجل الأخطاء في System → Error Logs مع إمكانية الحذف الفردي والجماعي" },
    { type: "feature" as const, text: "مكوّن PageError موحّد لجميع صفحات الخطأ — يعرض رسالة الخطأ + digest + رابط السجل" },
    { type: "fix" as const, text: "إصلاح OTP التحقق عبر تيليجرام — متغيرات البيئة كانت ناقصة في Vercel" },
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
