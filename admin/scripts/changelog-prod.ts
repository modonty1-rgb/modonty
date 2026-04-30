/**
 * Adds changelog entry to PRODUCTION DB (modonty).
 * Update the entry below before running: pnpm changelog:prod
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

// Hardcoded PROD DB URL (user decision 2026-04-29) — to avoid env juggling.
// ⚠️ Trade-off: URL credentials are in git history. Rotate Atlas password = update all 3 changelog scripts.
const PRODUCTION_DATABASE_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const db = new PrismaClient({
  datasources: { db: { url: PRODUCTION_DATABASE_URL } },
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
  console.log(`✅ PROD  — v${entry.version} added | id: ${result.id} | total: ${total}`);
  await db.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
