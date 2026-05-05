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
    version: "0.54.0",
    title: "admin v0.54.0 + console v0.6.2 — دورة المراجعة (Article Revision Cycle)",
    items: [
      { type: "feature" as const, text: "schema: حقل revisionNotes String? على Article — يخزّن فيدباك العميل لما يطلب تعديلات" },
      { type: "feature" as const, text: "console: requestChanges يحفظ نص الفيدباك ويحوّل المقالة لـ NEEDS_REVISION (بدل إلغاء الموافقة فقط)" },
      { type: "feature" as const, text: "admin: transition جديد revision-to-draft + رابط جانبي 'Revision → Draft' — يجمع المقالات اللي العميل طلب تعديلها" },
      { type: "feature" as const, text: "admin: banner أصفر فوق المقالة يعرض ملاحظات العميل بشكل بارز قبل التعديل" },
      { type: "feature" as const, text: "admin: زر Re-submit for Review ينقل المقالة DRAFT ويمسح revisionNotes تلقائياً (ما تتراكم بين الدورات)" },
      { type: "fix" as const, text: "DB safety: dataLayer/.env كان يشير لـ prod modonty افتراضياً — تعديل ليشير لـ modonty_dev، وأي سكريبت standalone Node بيستخدم dev الآن. حادثة flip-then-restore لمقالة كيما زون تمت معالجتها بدون فقدان بيانات." },
      { type: "fix" as const, text: "memory rule: log resolved DATABASE_URL داخل أي سكريبت قبل أي read/write كحماية إضافية" },
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
