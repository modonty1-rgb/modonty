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
    version: "0.47.0",
    title: "admin v0.47.0 — Knowledge Hub Phase 5: 8 صفحات guideline جديدة + إعادة بناء كاملة",
    items: [
      { type: "feature" as const, text: "admin: 8 صفحات guideline جديدة — about · golden-rules · brand · icps · positioning (NEW) · sales-playbook · marketing-strategy · team-onboarding" },
      { type: "feature" as const, text: "admin: Sidebar reorganized في 3 مجموعات (أساسيات Modonty + السوق والمبيعات + العمل اليومي) — 14 صفحة guideline + الممنوعات في navbar" },
      { type: "feature" as const, text: "admin: /guidelines/about مقدمة Modonty — Hero (Logo + Big Idea «حضور لا وعود») + 8s definition + Hadith «كالبنيان يشد بعضه بعضاً» + 3 ثوابت + 3 طبقات + 4 قوى + Knowledge Hub Map" },
      { type: "feature" as const, text: "admin: /guidelines/golden-rules — 22 قاعدة ذهبية (15 أساسية + 3 مهمة + 4 داعمة) — كل قاعدة بـ 3 طبقات (الجملة + 💡 ليش مهمة + 🎯 متى تستخدمها) + Hadith Cultural Anchor + Telegram Real-Time" },
      { type: "feature" as const, text: "admin: /guidelines/brand — هوية بصرية + 5 قيم + Tone of Voice (Do/Don't) + 8 ألوان + Tajawal + Montserrat + ممنوعات اللوقو + Anti-Hooks + قصة الشعار «النقطة»" },
      { type: "feature" as const, text: "admin: /guidelines/icps — دراسة سوق 2026 شاملة (4 tiers · 7 ICPs أساسية + Egypt-Gulf strategic tier + Tier 2 وكالات + Tier 3 watchlist) + decision tree + 20+ مصدر بحث موثّق (Mordor · DataReportal · Sprinklr · Vision 2030)" },
      { type: "feature" as const, text: "admin: /guidelines/positioning (NEW PAGE) — Modonty vs المنافسون: comparison matrix (10 معايير × 6 منافسين) + 6 معارك تنافسية + 3 حالات «ما هو عميلنا» + maturity levels (اليوم + 12 شهر + 3-5 سنوات)" },
      { type: "feature" as const, text: "admin: /guidelines/sales-playbook — 3 سكريبتات (Elevator/Discovery/Demo) + 5 اعتراضات بـ 3-layer + ROI calc + 4 جمل إغلاق + Egypt-Gulf scripts + Telegram demo trick" },
      { type: "feature" as const, text: "admin: /guidelines/marketing-strategy — Big Idea + 5 رسائل (Do/Don't) + قنوات SA + EG + Egypt-Gulf priority + 6 مراحل رحلة العميل + Telegram retention + KPIs + SWOT" },
      { type: "feature" as const, text: "admin: /guidelines/team-onboarding — milestone-based (3 مراحل بدل أيام) + 4 أدوار + checklist + قاعدة الموظف الجديد" },
      { type: "fix" as const, text: "admin: تصحيح أسعار guideline — 1,299 شهري (مش سنوي) عبر كل الصفحات. ROI calc محدّث: 15,588 سنوي + 866 effective بقاعدة 12=18" },
      { type: "fix" as const, text: "admin: WordPress comparison بحساب صحيح — Dev 7K + Designer 4K + كاتب 3K + SEO 4K = 18K شهري = 216K سنوي vs Modonty 15.6K = توفير 200K/سنة" },
      { type: "fix" as const, text: "admin: استبدال «Google» بـ «محركات البحث» (Google + Bing + ChatGPT Search + Perplexity) عبر كل الصفحات — يعكس AI Crawler Optimization" },
      { type: "fix" as const, text: "admin: استبدال «أمريكي/الأمريكان/Silicon Valley» بـ «منصة عالمية/SaaS عالمي/أداة غربية» — لغة محايدة احترافية" },
      { type: "feature" as const, text: "admin: ModontyIcon component (SVG inline) + full logo display (logo-dark.svg/logo-light.svg) في صفحة about + brand" },
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
