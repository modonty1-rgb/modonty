/**
 * Changelog Sync — SOT from git log
 * Usage:
 *   pnpm changelog:sync          → insert missing entries to BOTH DBs
 *   pnpm changelog:sync --reset  → clear all + re-insert with correct dates to BOTH DBs
 *   pnpm changelog:sync:local    → local only
 *   pnpm changelog:sync:prod     → production only
 *   pnpm changelog:reset:local   → reset local only
 *   pnpm changelog:reset:prod    → reset production only
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

const isLocal = process.argv.includes("--local");
const isProd  = process.argv.includes("--prod");
const isReset = process.argv.includes("--reset");
const isBoth  = !isLocal && !isProd; // default: both

const targets: Array<{ label: string; url: string | undefined }> = [];
if (isBoth || isLocal) targets.push({ label: "LOCAL", url: process.env.DATABASE_URL });
if (isBoth || isProd)  targets.push({ label: "PROD ", url: process.env.PRODUCTION_DATABASE_URL });

type ItemType = "fix" | "feature" | "improve";
type Entry = {
  version: string;
  title: string;
  releasedAt: string; // ISO date from git log
  items: { type: ItemType; text: string }[];
};

// ─── SOT: All admin versions — dates from git log ────────────────────────────
const CHANGELOG: Entry[] = [
  {
    version: "0.2.0",
    releasedAt: "2026-04-02",
    title: "تبسيط قسم المستخدمين",
    items: [
      { type: "improve", text: "تبسيط صفحات المستخدمين وإزالة التعقيدات غير الضرورية" },
      { type: "fix",     text: "إصلاح أخطاء خصائص onSubmit في النماذج" },
    ],
  },
  {
    version: "0.2.1",
    releasedAt: "2026-04-02",
    title: "إصلاح الشريط الجانبي والتنقل",
    items: [
      { type: "fix", text: "إصلاح تصميم الشريط الجانبي وشريط التنقل العلوي" },
    ],
  },
  {
    version: "0.3.0",
    releasedAt: "2026-04-02",
    title: "المجموعات الجانبية وخطط العملاء",
    items: [
      { type: "feature", text: "إضافة المجموعات في الشريط الجانبي لتنظيم أفضل" },
      { type: "feature", text: "واجهة خطط العملاء" },
      { type: "improve", text: "تحسينات على الثيم والتنقل" },
    ],
  },
  {
    version: "0.4.0",
    releasedAt: "2026-04-03",
    title: "تصدير البيانات ونظرة عامة على قاعدة البيانات",
    items: [
      { type: "feature", text: "صفحة تصدير البيانات" },
      { type: "feature", text: "نظرة عامة على قاعدة البيانات" },
      { type: "feature", text: "نظام النسخ الاحتياطي" },
    ],
  },
  {
    version: "0.5.0",
    releasedAt: "2026-04-04",
    title: "إعادة هيكلة SEO الكاملة",
    items: [
      { type: "feature", text: "إعادة بناء نظام SEO الكامل مع ربط متبادل بين التطبيقات" },
      { type: "improve", text: "تحسين محتوى البحث الذكي AI Search" },
    ],
  },
  {
    version: "0.6.0",
    releasedAt: "2026-04-04",
    title: "تحسين الفئات والوسوم والصناعات",
    items: [
      { type: "improve", text: "تحديث شامل لصفحات الفئات والوسوم والصناعات" },
      { type: "fix",     text: "إصلاح مشاكل ذاكرة التخزين المؤقت لـ SEO" },
    ],
  },
  {
    version: "0.7.0",
    releasedAt: "2026-04-04",
    title: "صفحات الشريط الجانبي وإصلاح الفوتر",
    items: [
      { type: "feature", text: "إضافة صفحات جديدة للشريط الجانبي" },
      { type: "fix",     text: "إصلاح مشاكل الفوتر" },
    ],
  },
  {
    version: "0.8.0",
    releasedAt: "2026-04-04",
    title: "إعادة تصميم نموذج الصفحات",
    items: [
      { type: "improve", text: "إعادة تصميم كامل لنموذج الصفحات" },
      { type: "feature", text: "نظرة عامة SEO جديدة" },
      { type: "improve", text: "ذاكرة تخزين مؤقت لـ FAQ وإعادة كتابة الإرشادات وتحديث الشريط الجانبي" },
    ],
  },
  {
    version: "0.8.1",
    releasedAt: "2026-04-04",
    title: "توحيد التصميم وإصلاح السكريبتات",
    items: [
      { type: "improve", text: "توحيد التصميم والـ layout عبر الصفحات" },
      { type: "fix",     text: "إصلاح scripts البداية وتحسين UX اختبار التكامل" },
    ],
  },
  {
    version: "0.9.0",
    releasedAt: "2026-04-05",
    title: "إعادة تصميم صفحة الوسائط + SEO الصور",
    items: [
      { type: "improve", text: "إعادة تصميم كاملة لصفحة الوسائط" },
      { type: "feature", text: "تحسين SEO الصور وإدارتها" },
    ],
  },
  {
    version: "0.10.0",
    releasedAt: "2026-04-05",
    title: "تحسين صفحة المؤلفين + إشعارات الجرس",
    items: [
      { type: "improve", text: "تحديث شامل لصفحة المؤلفين مع ذاكرة تخزين SEO" },
      { type: "feature", text: "إشعارات الجرس" },
      { type: "fix",     text: "إصلاح النص البديل للصور" },
    ],
  },
  {
    version: "0.11.0",
    releasedAt: "2026-04-05",
    title: "تحديث شامل للعملاء",
    items: [
      { type: "improve", text: "تحديث شامل لصفحات العملاء — الأمان، SEO، الأداء، والتنظيم" },
    ],
  },
  {
    version: "0.12.0",
    releasedAt: "2026-04-06",
    title: "تحديث شامل لمحرر المقالات",
    items: [
      { type: "improve", text: "واجهة SEO موحدة لمحرر المقالات" },
      { type: "feature", text: "نموذج 5 خطوات للمقال مع حفظ تلقائي" },
      { type: "improve", text: "ترقية المحرر مع شريط beta" },
    ],
  },
  {
    version: "0.13.0",
    releasedAt: "2026-04-06",
    title: "الأمان والأذونات لجميع الكيانات",
    items: [
      { type: "feature", text: "نظام أمان وأذونات للفئات والوسوم والصناعات" },
      { type: "improve", text: "تحويل التسميات من العربية للإنجليزية" },
      { type: "feature", text: "نظام ردود الفعل والملاحظات" },
    ],
  },
  {
    version: "0.14.0",
    releasedAt: "2026-04-07",
    title: "إصلاحات محرر المقالات",
    items: [
      { type: "fix", text: "إصلاح إعادة التوجيه بعد التحديث" },
      { type: "fix", text: "إصلاح تحذير الخروج دون حفظ" },
      { type: "fix", text: "إصلاح اقتطاع عنوان SEO" },
    ],
  },
  {
    version: "0.15.0",
    releasedAt: "2026-04-07",
    title: "إصلاح القفل التفاؤلي ومحلل SEO",
    items: [
      { type: "fix",     text: "إصلاح آلية القفل التفاؤلي في محرر المقالات" },
      { type: "improve", text: "عداد التقدم وتلميحات عربية في محلل SEO" },
      { type: "fix",     text: "إصلاح حدث الخروج من الصفحة" },
    ],
  },
  {
    version: "0.16.0",
    releasedAt: "2026-04-07",
    title: "صفحة سجل التحديثات + ملاحظات الفريق",
    items: [
      { type: "feature", text: "صفحة سجل التحديثات مع تاريخ الإصدارات الكامل" },
      { type: "feature", text: "ملاحظات الفريق مع الردود" },
    ],
  },
  {
    version: "0.17.0",
    releasedAt: "2026-04-07",
    title: "تحديثات SEO تلقائية عند تغيير الإعدادات",
    items: [
      { type: "feature", text: "إعادة توليد SEO تلقائي لجميع الكيانات عند تغيير إعدادات الموقع" },
    ],
  },
  {
    version: "0.18.0",
    releasedAt: "2026-04-07",
    title: "فتح تحولات الحالة في المقالات",
    items: [
      { type: "feature", text: "إتاحة الانتقال من حالة Writing إلى Published مباشرة" },
      { type: "improve", text: "رسائل الخطأ تظهر لمدة 10 ثوانٍ للرؤية الأفضل" },
    ],
  },
  {
    version: "0.19.0",
    releasedAt: "2026-04-07",
    title: "إصلاح رفع الوسائط العربية",
    items: [
      { type: "fix",     text: "إصلاح رفع الملفات العربية — تحويل أسماء الملفات إلى ASCII آمن" },
      { type: "improve", text: "حفظ النص البديل العربي في قاعدة البيانات لتحسين SEO" },
    ],
  },
  {
    version: "0.20.0",
    releasedAt: "2026-04-07",
    title: "إصلاح SEO الجماعي للمقالات",
    items: [
      { type: "feature", text: "إصلاح SEO الجماعي لجميع المقالات بضغطة واحدة" },
      { type: "fix",     text: "إصلاح ذاكرة التخزين المؤقت لصفحة الشروط" },
    ],
  },
  {
    version: "0.21.0",
    releasedAt: "2026-04-08",
    title: "تحسينات نموذج العملاء",
    items: [
      { type: "improve", text: "تحسين شامل لنموذج إنشاء وتعديل العملاء" },
      { type: "fix",     text: "إصلاح مشكلة الـ slug الفريد" },
      { type: "improve", text: "تلميحات عربية وأسعار حقيقية" },
    ],
  },
  {
    version: "0.22.0",
    releasedAt: "2026-04-08",
    title: "مركزية رسائل الواجهة",
    items: [
      { type: "improve", text: "مركزة جميع رسائل Toast وتلميحات النماذج في ملف واحد" },
    ],
  },
  {
    version: "0.23.0",
    releasedAt: "2026-04-08",
    title: "تحسين جدول العملاء وصفحة الإعدادات",
    items: [
      { type: "improve", text: "إعادة تصميم جدول العملاء مع تحسينات UX" },
      { type: "improve", text: "إعادة هيكلة صفحة الإعدادات" },
    ],
  },
  {
    version: "0.24.0",
    releasedAt: "2026-04-08",
    title: "تحسين الإعدادات + SEO المحسوب",
    items: [
      { type: "improve", text: "تجربة مستخدم أفضل لصفحة الإعدادات" },
      { type: "improve", text: "حقل textarea لوصف SEO مع عدد الأحرف" },
      { type: "fix",     text: "إصلاح سلسلة إبطال الذاكرة المؤقتة" },
    ],
  },
  {
    version: "0.25.0",
    releasedAt: "2026-04-09",
    title: "صور OG لصفحات القوائم + معاينة الإعدادات",
    items: [
      { type: "feature", text: "صور Open Graph لصفحات القوائم" },
      { type: "feature", text: "معاينة الصور في صفحة الإعدادات" },
      { type: "feature", text: "بذر أولي لسجل التحديثات" },
    ],
  },
  {
    version: "0.27.0",
    releasedAt: "2026-04-10",
    title: "إصلاح معرض الوسائط",
    items: [
      { type: "fix", text: "إصلاح مشاكل عرض معرض الوسائط" },
      { type: "fix", text: "تحسين رسالة خطأ النشر" },
    ],
  },
  {
    version: "0.28.0",
    releasedAt: "2026-04-10",
    title: "إصلاح معاينة الصورة المميزة",
    items: [
      { type: "fix", text: "إصلاح اقتطاع الصورة المميزة في المحرر — object-cover → object-contain" },
    ],
  },
  {
    version: "0.29.0",
    releasedAt: "2026-04-10",
    title: "تحديث صفحة الإرشادات",
    items: [
      { type: "improve", text: "إعادة هيكلة صفحة الإرشادات — مسار عام، أقسام قابلة للطي، صفحات جديدة" },
    ],
  },
  {
    version: "0.30.0",
    releasedAt: "2026-04-11",
    title: "إصلاحات تدقيق SEMrush",
    items: [
      { type: "fix", text: "تطبيق إصلاحات التدقيق الكامل من SEMrush" },
    ],
  },
  {
    version: "0.31.0",
    releasedAt: "2026-04-12",
    title: "تحسين استعلامات القوائم",
    items: [
      { type: "improve", text: "تحسين أداء استعلامات صفحات القوائم" },
      { type: "improve", text: "إضافة صورة مصغرة للعميل وفرز في جدول المقالات" },
    ],
  },
  {
    version: "0.32.0",
    releasedAt: "2026-04-12",
    title: "نظام الأرشفة + إعادة توجيه SEO",
    items: [
      { type: "feature", text: "نظام أرشفة المقالات مع إعادة توجيه SEO تلقائية" },
    ],
  },
  {
    version: "0.33.0",
    releasedAt: "2026-04-12",
    title: "تأكيد الأرشفة بنافذة حوار عربية",
    items: [
      { type: "improve", text: "نافذة تأكيد عربية قبل أرشفة أي مقال باستخدام AlertDialog" },
    ],
  },
  {
    version: "0.34.0",
    releasedAt: "2026-04-13",
    title: "تجربة الموبايل الكاملة",
    items: [
      { type: "improve", text: "إتمام 18 إصلاح لتجربة الموبايل" },
      { type: "improve", text: "تحسينات على الأداء ومحرر المقالات" },
    ],
  },
  {
    version: "0.35.0",
    releasedAt: "2026-04-15",
    title: "إرشادات المصمم مع صفحات المعاينة",
    items: [
      { type: "feature", text: "صفحة إرشادات المصمم مع 3 صفحات معاينة تفاعلية" },
    ],
  },
  {
    version: "0.36.0",
    releasedAt: "2026-04-19",
    title: "تحديث الشريط الجانبي + إشعارات تيليجرام",
    items: [
      { type: "improve", text: "تحديث شامل للشريط الجانبي والتنقل" },
      { type: "feature", text: "إشعارات تيليجرام للأحداث المهمة" },
      { type: "improve", text: "تحسينات SEO وإصلاح صفحات الصناعات" },
    ],
  },
  {
    version: "0.37.0",
    releasedAt: "2026-04-20",
    title: "سير عمل الأسئلة الشائعة",
    items: [
      { type: "feature", text: "الأدمن يرسل أسئلة شائعة في حالة Pending للعميل" },
      { type: "feature", text: "العميل يوافق عبر Console وتُنشر تلقائياً على موودونتي" },
      { type: "feature", text: "JSON-LD لـ FAQPage في صفحات العملاء" },
    ],
  },
  {
    version: "0.38.0",
    releasedAt: "2026-04-20",
    title: "صفحة صحة قاعدة البيانات",
    items: [
      { type: "feature", text: "صفحة صحة قاعدة البيانات مع 9 أدوات تشخيصية" },
    ],
  },
  {
    version: "0.39.0",
    releasedAt: "2026-04-20",
    title: "معاينة قوالب البريد الإلكتروني",
    items: [
      { type: "feature", text: "صفحة معاينة قوالب البريد الإلكتروني مع زر إرسال تجريبي" },
    ],
  },
  {
    version: "0.40.0",
    releasedAt: "2026-04-21",
    title: "تحسين أداء عدادات التفاعل — PERF-006",
    items: [
      { type: "improve", text: "تحويل عدادات التفاعل إلى حقول scalar بدلاً من COUNT queries" },
      { type: "improve", text: "تقليل ضغط قاعدة البيانات وتسريع تحميل الصفحات" },
    ],
  },
  {
    version: "0.41.0",
    releasedAt: "2026-04-24",
    title: "نظام سجل الأخطاء الداخلي + إصلاح OTP تيليجرام",
    items: [
      { type: "feature", text: "نظام تسجيل أخطاء داخلي — يلتقط تلقائياً كل أخطاء السيرفر بدون خدمات خارجية" },
      { type: "feature", text: "صفحة عرض سجل الأخطاء في System → Error Logs مع إمكانية الحذف الفردي والجماعي" },
      { type: "feature", text: "مكوّن PageError موحّد لجميع صفحات الخطأ — يعرض رسالة الخطأ + digest + رابط السجل" },
      { type: "fix",     text: "إصلاح OTP التحقق عبر تيليجرام — متغيرات البيئة كانت ناقصة في Vercel" },
    ],
  },
  {
    version: "0.41.1",
    releasedAt: "2026-04-24",
    title: "تحسين نظام سجل التحديثات",
    items: [
      { type: "feature", text: "script موحّد يزامن قاعدتَي البيانات (local + production) في أمر واحد" },
      { type: "improve", text: "تواريخ الإصدارات الحقيقية مأخوذة من git log — لا مزيد من تواريخ الإدخال العشوائية" },
      { type: "improve", text: "صفحة سجل التحديثات: stats bar + فلتر حسب النوع + badge الإصدار الحالي" },
      { type: "fix",     text: "إصلاح bug pnpm يحمّل .env قبل الـ scripts — أضيف override: true في dotenv.config" },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function syncTarget(label: string, url: string | undefined) {
  if (!url) { console.error(`❌ ${label} — URL not set`); return; }

  const db = new PrismaClient({ datasources: { db: { url } } });

  if (isReset) {
    const deleted = await db.changelog.deleteMany();
    console.log(`🗑️  ${label} — cleared ${deleted.count} existing entries`);
  }

  const existing = await db.changelog.findMany({ select: { version: true } });
  const existingVersions = new Set(existing.map((e) => e.version));
  const missing = CHANGELOG.filter((e) => !existingVersions.has(e.version));

  if (missing.length === 0) {
    console.log(`✅ ${label} — already in sync`);
  } else {
    for (const entry of missing) {
      await db.changelog.create({
        data: { version: entry.version, title: entry.title, items: entry.items, createdAt: new Date(entry.releasedAt) },
      });
      console.log(`  ➕ ${label} — v${entry.version} (${entry.releasedAt})`);
    }
    const total = await db.changelog.count();
    console.log(`✅ ${label} — synced ${missing.length} entr${missing.length === 1 ? "y" : "ies"} | total: ${total}`);
  }

  await db.$disconnect();
}

async function run() {
  for (const t of targets) await syncTarget(t.label, t.url);
}

run().catch((e) => { console.error(e); process.exit(1); });
