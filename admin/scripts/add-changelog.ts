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
  version: "0.3.0",
  title: "console v0.3.0 — overhaul شامل: نصوص بسيطة + تصميم متجاوب + سكرول واحد",
  items: [
    { type: "feature" as const, text: "console: تبسيط كل المصطلحات التقنية (JSON-LD/Schema/UTM/GTM/Staging/LCP/CLS/INP/TTFB/TBT) إلى عربي وصفي يفهمه صاحب النشاط — 28 بند COPY + 2 جارجون بصري + 7 إصلاحات إضافية" },
    { type: "feature" as const, text: "console: تصميم metaجاوب 100% عبر 375 / 768 / 1366 — header موبايل بدون قص الشعار، profile form 2-col على Desktop، media filter wrap، Top Articles chart مُعاد بناؤه" },
    { type: "fix" as const, text: "console: إزالة الـ scrollbars المتداخلة (html + main scroll → الآن scroll واحد فقط على مستوى الصفحة)" },
    { type: "fix" as const, text: "console: dir=ltr للحقول URL/email/tel/number — يحلّ مشكلة `/https://...`" },
    { type: "fix" as const, text: "console: action buttons في الجداول 40px + aria-label (WCAG touch target + a11y)" },
    { type: "fix" as const, text: "console: getNavTitle يدعم subpaths (e.g. /seo/intake → معلومات مهمة)" },
    { type: "fix" as const, text: "admin v0.43.2: slug regex يقبل العربية (`\\u0600-\\u06FF`) — يحل bug تعطّل تحديث العملاء بـ slug عربي" },
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
