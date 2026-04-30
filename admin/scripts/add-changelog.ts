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
    version: "0.44.0",
    title: "admin v0.44.0 — Notifications Bell موحّد + Campaign Leads + Search Console pipeline 13-stage",
    items: [
      { type: "feature" as const, text: "admin: Notifications Bell موحّد — بوابة لكل أنواع الإشعارات (campaign_interest · contact_reply · faq_reply) مع registry قابل للتوسيع + dropdown منبثق + mark all read" },
      { type: "feature" as const, text: "admin: صفحة Campaign Leads جديدة (/campaigns/leads) — تتبّع 4 حالات (NEW/CONTACTED/CONVERTED/CANCELLED) + WhatsApp deep-link + idempotent registration + history log" },
      { type: "feature" as const, text: "admin: Search Console pipeline بـ 13 مرحلة لكل مقالة — Reachability · HTTPS · Mobile-Friendliness · Document Language · Metadata · Content · Schema · Media · Internal Links · External Links · Sitemap Inclusion · Performance (CWV) · Final Index Check + Stage 14 Request Indexing locked-until-ready" },
      { type: "feature" as const, text: "admin: Pre-index validator — 12 فحص آلي قبل ping Google (HTTPS · canonical · noindex · title · h1 · meta description · word count · hreflang · OG image · Article JSON-LD · BreadcrumbList) — يوفر quota الـ Indexing API" },
      { type: "feature" as const, text: "admin: Tech Health drill-down dialogs — clickable counts على Canonical/Robots/Mobile/Soft 404 → dialog يوضح URL + المشكلة + كيف تُصلح" },
      { type: "feature" as const, text: "admin: 410 Gone للمقالات غير المنشورة — proxy.ts يرجع 410 بدلاً من 200+noindex (يساعد Google على الإزالة الفورية)" },
      { type: "fix" as const, text: "admin: Indexing API enum (URL_DELETED بدلاً من URL_REMOVED الخطأ) + dedup عبر getMetadata بدون DB" },
      { type: "fix" as const, text: "admin: Schema validator يتجاوز @graph nodes (كان يُبلغ عن JSON-LD ناقص خطأ)" },
      { type: "feature" as const, text: "admin: Telegram per-client integration — bot @ModontyAlertsBot + 22 event عبر console + modonty + footer (timestamp + geo)" },
    ],
  },
  {
    version: "0.4.0",
    title: "console v0.4.0 — Dashboard rebuild + Lead Scoring + Site Health + Telegram + 12 صفحة معاد بناؤها",
    items: [
      { type: "feature" as const, text: "console: Dashboard معاد بناؤه — header مع month-summary · 3 action cards · Performance + Audience في sections منفصلة · trends + benchmarks · activity timeline" },
      { type: "feature" as const, text: "console: Analytics deep-dive جديد — Device Breakdown · New vs Returning · Day-of-Week pattern · Hour-of-Day heatmap · 8 rule-based insights قابلة للتنفيذ" },
      { type: "feature" as const, text: "console: Leads page بـ 5 KPIs ملوّنة + Lead Scoring 0-100 (4 عوامل متساوية) + WhatsApp deep-link + CSV export + Filter للمؤهلين" },
      { type: "feature" as const, text: "console: Site Health Dashboard — فحص فوري بدون DB (SSL · DNS · Headers · robots/sitemap · Schema · Google PageSpeed Mobile + Desktop) مع توصيات بالعربي" },
      { type: "feature" as const, text: "console: Telegram pairing UI — pairing code 6 أرقام · 22 event checkboxes في 3 مجموعات · select-all/none · save per-tab · ngrok dev support" },
      { type: "feature" as const, text: "console: Comments + Questions + FAQs + Subscribers + Support + Settings كلها معاد بناؤها — auth-scoped actions · sonner toasts · Drawer details · bulk actions · 5 filter pills · CSV export" },
      { type: "feature" as const, text: "console: Campaigns Sales Teaser — 3 reach tiers + workflow + features + final CTA + idempotent interest tracking" },
      { type: "feature" as const, text: "console: Intake form معاد بناؤه — 11 قسم/24 سؤال (مع YMYL conditional) · click-only inputs (radios/pills/select) · sticky save bar · live progress" },
      { type: "feature" as const, text: "console: Profile page polished — single source of truth identity-only · 6 sections · sticky save · per-section completion badges" },
      { type: "fix" as const, text: "console: Settings page security — كل actions محمية بـ auth() + cross-tenant guard (lock down 3 critical gaps في password change + notification prefs)" },
    ],
  },
  {
    version: "1.43.0",
    title: "modonty v1.43.0 — Telegram client notifications + clientFavorite + clientComment",
    items: [
      { type: "feature" as const, text: "modonty: نظام Telegram لكل عميل — bot @ModontyAlertsBot يرسل إشعارات لحظية عن كل تفاعل (مشاهدات/إعجاب/تعليق/متابعة/الخ) — 22 event مدعوم" },
      { type: "feature" as const, text: "modonty: clientFavorite — زر حفظ الشركة المفضلة على صفحة العميل (Bookmark icon + login redirect + optimistic UI)" },
      { type: "feature" as const, text: "modonty: clientComment — تعليقات الزوار على صفحة العميل (مع موافقة في console + رد + Telegram event)" },
      { type: "feature" as const, text: "modonty: footer للإشعارات — timestamp بالـ Asia/Riyadh + geo lookup (city + country) عبر ip-api.com" },
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
