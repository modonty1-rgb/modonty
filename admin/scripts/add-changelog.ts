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
    version: "0.46.0",
    title: "admin v0.46.0 — Knowledge Hub Phase 4: Prohibitions + Articles + Authors + Clients + Organization rebuilt",
    items: [
      { type: "feature" as const, text: "admin: صفحة الممنوعات الموحّدة (/guidelines/prohibitions) — 8 فئات (Brand · Video · Platforms · Technical · Content · On-Page · External Links · Manual Penalty · UX) مدققة من مصادر Google الرسمية، 60+ بند بصياغة بسيطة لغير التقنيين" },
      { type: "feature" as const, text: "admin: Prohibitions في navbar (زر أحمر بارز) بدلاً من sidebar — صفحة مرجعية لكل الفريق" },
      { type: "feature" as const, text: "admin: صفحة المقالات (/guidelines/articles) معاد بناؤها — 3 مراحل (الإعداد · الكتابة · النشر والاعتماد) مع تبويبات Phase 3 (FAQs · Publish · Client Approval · Final Publish) + فصل واضح بين Client APPROVES و Admin PUBLISHES" },
      { type: "feature" as const, text: "admin: E-E-A-T card في Articles + Related Articles details (3 أنواع: related/similar/recommended) + Image specs (16:9 + 4:3 + 1:1)" },
      { type: "feature" as const, text: "admin: صفحة الكتّاب (/guidelines/authors) معاد بناؤها — مودونتي = المؤلف الافتراضي + 3 حالات استثناء (Subject-Matter Authority · Brand Partnership · Personal Voice) + 3-step E-E-A-T builder + Modonty 3-phase Authority Plan" },
      { type: "feature" as const, text: "admin: صفحة العملاء (/guidelines/clients) كمرجع مبيعات — 7 أقسام (Hero · Tiers · Journey · Console · Public · Integrations · Sales talking points)" },
      { type: "feature" as const, text: "admin: صفحة تنظيم المحتوى (/guidelines/organization) مبسّطة — 3 طرق (Category · Tag · Industry) + شجرة قرار + 3 أخطاء شائعة (375→190 سطر)" },
      { type: "feature" as const, text: "admin: صفحة معاينة البحث والمشاركة (/guidelines/seo-visual) — Glossary card + ترجمة كل مسارات الأدمن + Frontend Master polish" },
      { type: "feature" as const, text: "admin: صفحة الوسائط (/guidelines/media) — Logo + Video sections + Format Matrix + 3-Second Rule + DON'Ts → /prohibitions" },
      { type: "feature" as const, text: "admin: Hub sidebar معرّب كاملاً — 6 أدلة عملية + 7 صفحات قريباً (عن Modonty · البراند · العملاء المثاليون · دليل المبيعات · استراتيجية التسويق · تأهيل الفريق · القواعد الذهبية)" },
      { type: "remove" as const, text: "admin: حذف صفحات client-managed (seo-specialist · subscribers · tracking) — تخص النظام التلقائي وليس Knowledge Hub للفريق" },
      { type: "feature" as const, text: "admin: Tajawal + Montserrat fonts عبر next/font/google لكل الأدمن (RTL-first)" },
      { type: "fix" as const, text: "admin: زيادة font sizes في كل صفحات guidelines — text-[9px]→text-[11px] · text-[10px]→text-xs · العناوين 16px bold · الأوصاف 14px (للقراءة المريحة)" },
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
