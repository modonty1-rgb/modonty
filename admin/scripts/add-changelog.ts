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
    version: "1.45.0",
    title: "modonty v1.45.0 — /story page polish: copy refresh + audio re-generation + UI cleanup",
    items: [
      { type: "feature" as const, text: "استبدال 'بزنس' → 'مشروعك / نشاط' في كل /story: ٢٢ موضع script.md + ١٨ موضع manifest + ٣ مواضع SEO metadata + welcome card — تطبيق قاعدة لغوية متناسقة (مشروعك للمخاطبة، نشاط للتصنيف)" },
      { type: "feature" as const, text: "metaphor cleanup: 'أنت طوبة' → 'شركتك طوبة' (٨ مواضع) — لا تشييء للشخص، الشركة هي الطوبة في البنيان" },
      { type: "feature" as const, text: "section 03 body: pivot سلس نقطة → طوبة → بنيان — يحافظ على المعنى الحرفي للنقطة في الشعار ويكرّم العميل كوحدة بناء" },
      { type: "feature" as const, text: "أسامي الأقسام كأسئلة hook في sidebar: المشكلة → 'عميلك يلقاك؟' · مدوني → 'ليش مدوني؟' · مقابل البدائل → 'وكالة ولا منظومة؟' · شركاء نجاح → 'نتائج العملاء' · الفريق → 'مين خلف البنيان؟'" },
      { type: "feature" as const, text: "UI moves: زر '📄 اقرأ النص' من content area → top bar (ظاهر على media sections) · زر 'رؤية ٢٠٣٠' من top bar → sidebar header بعرض كامل · 'اضغط للبدء' hint → audio controls footer · شيل headings 'خريطة القصة' + 'افتتاحية'" },
      { type: "feature" as const, text: "TV stage badge: ID خام → موضع متسلسل (1-12) للسكشنات في categories · للـ logo-spotlight: نقطة سيان diamond #00D8D8 مستخرجة من الـ SVG الأصلي للشعار · animation محسّن (isPlaying gate + useReducedMotion + glow أخف ٣٠٪)" },
      { type: "feature" as const, text: "audio re-generated: ١٣ سكشن بـ Gemini Kore (sections 02,03,04,06,07,08,12,13,14,15,16,17,18) · ~٤٥MB · صفر أخطاء توليد" },
      { type: "refactor" as const, text: "نقل voice script للموقع الصحيح: console/app/help/voice-script/script.md → modonty/scripts/voice/general-pitch/script.md — منطقي: modonty يملك سكريبت /story · تحديث build-general-pitch-manifest.mjs + generate-section.mjs للمسار الجديد · صفر dead code · console pitch بحاله (سكريبت منفصل)" },
      { type: "fix" as const, text: "welcome card مختصر: 'حياك الله في مدونتي. خلني أحكي لك بسرعة، كيف نجعل بزنسك يطلع أمام العميل الذي يبحث عنك — وأنت مرتاح' → 'حياك الله في مدونتي. مشروعك يطلع لعميلك — وأنت مرتاح' (~٩٥ → ~٥٢ حرف)" },
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
