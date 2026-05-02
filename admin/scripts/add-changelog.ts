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
    version: "0.48.0",
    title: "admin v0.48.0 — تكامل Jabra SEO: مزامنة المشتركين + بنية الأسعار (Step A)",
    items: [
      { type: "feature" as const, text: "admin: صفحة /jbrseo-subscribers جديدة — تعرض المشتركين القادمين من jbrseo.com pricing page (mirror حرفي · صفر workflow)" },
      { type: "feature" as const, text: "admin: زر Sync from jbrseo — يقرأ من collection اسمها Subscriber في قاعدة Jabra SEO MongoDB ويحفظ في jbrseo_subscribers" },
      { type: "feature" as const, text: "admin: 4 KPI cards (Total · SA · EG · Annual/Monthly) + جدول كامل (Date/Name/Email/Phone/Business/Plan/Country/Billing) + بحث + فلاتر" },
      { type: "feature" as const, text: "admin: صفحة sidebar item جديد في مجموعة Audience — jbrseo Subscribers" },
      { type: "feature" as const, text: "schema: model JbrseoSubscriber جديد (mirror كامل لـ jbrseo Subscriber model) + indexes على country + jbrseoCreatedAt" },
      { type: "feature" as const, text: "schema: 4 حقول جديدة على SubscriptionTierConfig — jbrseoId String? @unique + pricing Json? + articleCounts Json? + syncedAtSA/EG DateTime?" },
      { type: "fix" as const, text: "schema cleanup: حذف 4 حقول boilerplate من SubscriptionTierConfig — isActive · isPopular · description · createdAt" },
      { type: "feature" as const, text: "infra: env var JBRSEO_DATABASE_URL في .env.shared + Vercel Team Shared (مرتبط بـ admin/modonty/console)" },
      { type: "feature" as const, text: "infra: helper admin/lib/jbrseo-client.ts — singleton MongoClient connection لقاعدة Jabra SEO" },
      { type: "feature" as const, text: "infra: package mongodb@^6.20.0 مضاف لـ admin" },
      { type: "feature" as const, text: "data: backfill jbrseoId على 4 صفوف موجودة (BASIC→free · STANDARD→starter · PRO→growth · PREMIUM→scale)" },
      { type: "feature" as const, text: "docs: ملف JBRSEO-INTEGRATION-PLAN.md جديد — خطة كاملة 70+ task across 4 phases (Pricing refactor + Subscribers mirror)" },
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
