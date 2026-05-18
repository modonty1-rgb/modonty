/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "1.48.0",
    title: "modonty v1.48.0 — GTM + GA4 Server-Side Analytics (19 events wired)",
    items: [
      { type: "feature" as const, text: "GA4 Measurement Protocol integration — 4 ملفات جديدة في modonty/lib/analytics/ (ga4-server, visitor-cookie, events-registry, validate-events). 21 event مع typed wrappers + fire-and-forget pattern (لا يبطّئ origin response)" },
      { type: "feature" as const, text: "26 Custom Dimensions في GA4 Property 538167732 (23 EVENT + 3 USER scope) — client_id, client_slug, client_name, client_industry, article_id, article_slug, article_title, author_id/name, category_slug/name, tag_primary, cta_*, share_platform, comment_*, conversion_type, contact_method, campaign_reach, user_role, signup_method, user_segment" },
      { type: "feature" as const, text: "19 events wired عبر 11 ملف: Wave 1 (Tier 3 ⭐) follow_client + ask_client_submit + contact_submit + conversion_complete · Wave 2 (Article) article_view + article_like/dislike/favorite + article_share + comment_submit/reply/like/dislike · Wave 3 (Client page) client_view + client_share + client_favorite + client_comment_submit + newsletter_subscribe · Wave 4 outbound_click" },
      { type: "feature" as const, text: "Hybrid visitor cookie strategy — يقرأ _ga أولاً (من GTM)، fallback لـ mdy_vid (HTTP-only، 2-year max-age). session_id مع 30-min sliding window (يطابق GA4 default)" },
      { type: "feature" as const, text: "DebugView auto-enabled في non-production — events تظهر في GA4 Admin → DebugView بدون تلوّث Reports. Production يرسل clean events" },
      { type: "fix" as const, text: "Critical fix بعد Context7 review: rename `purchase` event → `conversion_complete` (purchase reserved ecommerce في GA4 يحتاج currency+value+transaction_id+items، استخدامه مع conversion_type كان يلوّث Ecommerce Reports)" },
      { type: "feature" as const, text: "Local Live Test verified end-to-end: 3 events (article_view + article_share + client_view) أرسلت بنجاح إلى GA4 (HTTP 204) + ظهرت في DebugView مع كل الـ params" },
      { type: "feature" as const, text: "Vercel env vars configured: NEXT_PUBLIC_GTM_CONTAINER_ID upgraded (GTM-P43DC5FM → GTM-MNRR2NS9) + NEXT_PUBLIC_GA4_MEASUREMENT_ID + GA4_API_SECRET + GA4_PROPERTY_ID + GA4_CLIENT_EMAIL" },
      { type: "fix" as const, text: "Golden Rule established: Context7 + official docs mandatory before any code edit (Next.js cookies, GA4 reserved events, Prisma schema relations, Vercel CLI syntax). 6 documented lessons في memory" },
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
