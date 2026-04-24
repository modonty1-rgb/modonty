/**
 * Adds changelog entry to LOCAL DB (modonty_dev).
 * Update the entry below before running: pnpm changelog:local
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

const db = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// ─── UPDATE THIS BEFORE RUNNING ──────────────────────────────────────────────
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

async function run() {
  const result = await db.changelog.create({ data: entry });
  const total = await db.changelog.count();
  console.log(`✅ LOCAL — v${entry.version} added | id: ${result.id} | total: ${total}`);
  await db.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
