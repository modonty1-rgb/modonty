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
    version: "0.49.0",
    title: "admin v0.49.0 — صفحات guideline تقرأ الأسعار من DB + DEV-only Sync Local from PROD button",
    items: [
      { type: "feature" as const, text: "admin: 6 صفحات guideline تقرأ الأسعار من قاعدة البيانات بدل hardcoded — brand · golden-rules · icps · positioning · sales-playbook · team-onboarding (33 موضع كلهم live)" },
      { type: "feature" as const, text: "admin: helper جديد admin/lib/pricing/get-tier-pricing.ts — getTierPricing() + getAllTiersPricing() مع unstable_cache ساعة + smart fallback لـ tier.price" },
      { type: "feature" as const, text: "admin: helper جديد admin/lib/pricing/format-for-guideline.ts — formatPriceForGuideline() + getMomentumPrice() + getLeadershipPrice() مع تنسيق Intl ar-SA + en-GB" },
      { type: "feature" as const, text: "admin: زر DEV-only Sync Local from PROD في navbar — مخفي في production (NODE_ENV check inlined في build) · streaming UI live progress" },
      { type: "feature" as const, text: "admin: API route admin/app/api/dev/sync-local-from-prod/route.ts — NDJSON streaming · safety check يرفض الكتابة لو DATABASE_URL ليس modonty_dev · نسخ الـ indexes من PROD وإعادة بنائها" },
      { type: "feature" as const, text: "admin: Dialog progress (current collection · doc counter · 3 KPIs · per-collection list · time tracking) — تم اختباره: 64 جدول · 1,242 وثيقة · 137.3s · صفر فشل" },
      { type: "fix" as const, text: "data sync: إصلاح bug في createIndexes — MongoDB كان يرفض unique:null و sparse:null · الآن نضيف القيم only when === true" },
      { type: "fix" as const, text: "guidelines: WordPress comparison + ROI calculator + الفرق النفسي + جداول الباقات — كلهم تأتي من DB live (لو غيّرت سعر growth في DB، كل صفحة guideline تتحدّث بعد cache invalidate)" },
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
