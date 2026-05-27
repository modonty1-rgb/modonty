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
    version: "1.49.3 (modonty) + 0.64.0 (admin)",
    title: "Workflow-only publish gate + CLS/LCP regression fix (Mariam PSI verification)",
    items: [
      { type: "fix" as const, text: "Critical CLS regression (Mariam PSI verification 3-run median = 0.242): AnnouncementBar.tsx logic inverted. Previously `useState(false) → useEffect → setVisible(true)` caused the 36px mobile bar to appear AFTER hydration, pushing all content (footer included) down — PSI scored this as a footer shift of 0.210 (87% of total CLS). New logic: bar visible by default in SSR HTML, only hides for returning users who dismissed it via localStorage. New visitors (= PSI tester) see ZERO shift." },
      { type: "fix" as const, text: "Critical LCP regression (Mariam PSI verification 3-run median = 3.3s): FeedContainer.tsx Suspense was missing fallback. `<Suspense><CategoryFeedSection/></Suspense>` had no fallback; CategoryFeedSection calls useSearchParams() which causes Suspend → empty area → LCP delayed 2-7s. Added `<Suspense fallback={<InfiniteFeedSkeleton count={3} />}>` — reserves card-shaped space, eliminates layout shift, allows LCP element to render in initial paint." },
      { type: "refactor" as const, text: "admin 0.64.0 — Workflow is now the SOLE publish path. Deleted dead code: admin/app/api/articles/publish/route.ts (API endpoint no client called) + entire admin/app/(dashboard)/articles/actions/publish-action/ directory (publishArticle + publishArticleById functions, both unreferenced by UI) + publish-action.ts barrel + publishArticle method/state from article-form-store.ts. Removed status FormNativeSelect dropdown from MetaSection (it was rendered in an orphaned component, but symbolic cleanup nonetheless — replaced with read-only Badge + Arabic hint 'لتغيير الحالة، استخدم شاشة Workflow')." },
      { type: "feat" as const, text: "admin 0.64.0 — transitionArticleAction.ts strengthened as the sole publish gate. When toStatus===PUBLISHED: runs analyzeArticleSEO with MIN_SEO_SCORE=60 gate + checkCompliance (forbiddenKeywords from client) + generateAndSaveJsonLd + generateAndSaveNextjsMetadata + submitToIndexNow (notifies Bing/Yandex/Brave/Seznam) + revalidatePath for the specific article slug. All quality + side effects centralized in one place — eliminates the risk of bypass via scattered code paths." },
      { type: "remove" as const, text: "admin 0.64.0 — Removed publish-scheduled cron entirely. Deleted admin/app/api/cron/publish-scheduled/route.ts + its parent dir + the `crons` array from admin/vercel.json. Khalid decision: he doesn't use scheduled auto-publish; the Workflow page handles SCHEDULED → PUBLISHED transitions manually when needed." },
      { type: "fix" as const, text: "modonty 1.49.3 — Executed IndexNow for 20 previously under-indexed articles via direct curl POST to api.indexnow.org/IndexNow (HTTP 200, ~0.95s). Covers Bing + Yandex + Brave + Seznam. Google not covered by IndexNow — Mariam handles Google Request Indexing tomorrow when the 50/day GSC quota resets at midnight UTC." },
      { type: "fix" as const, text: "Mariam prompt upgraded v2 → v3 → v4 in documents/seo/PROMPT-COPY-PASTE.md. v3 added <completeness_contract> (Mariam as execution engineer, not data collector), strengthened pillar_2 (Request Indexing exhaustively up to 50/day cap), hardened pillar_6 GEO with MANDATORY DELIVERABLES + GEO Citation table required, and added <closing_checklist_before_report> (17 checkboxes). v4 removed Vercel Dashboard from her tools (she 404'd guessing vercel.com URLs) + added <tools_NOT_in_your_scope> section with explicit alternatives via Handoff." },
      { type: "fix" as const, text: "New permanent docs: documents/seo/GROWTH-STRATEGY-PARTNER-BACKLINKS.md (13-section strategy proposing Partner Doctor Program for YMYL backlinks — addresses Mariam's GEO citation gap that shows modonty NOT cited by Perplexity/ChatGPT despite indexed articles). documents/tasks/MARIAM-AUDIT-OPEN-ITEMS.md (new standard — single source of truth for all open items from Mariam reports, replaces scattered tracking). Updated documents/context/SESSION-LOG.md with full session block (8 sections, 7 deleted files documented, 6 decisions with reasoning)." },
      { type: "fix" as const, text: "Skipped this push (queued in MARIAM-AUDIT-OPEN-ITEMS.md): hreflang ar-SA + ar-EG on article pages (currently only ar + x-default), homepage og:url trailing slash mismatch, sitemap 134→102 count verification, TBT 490ms on article pages, FAQPage schema, real author.name vs 'Modonty'. All non-critical Important/Nice-to-have items from audit #3." },
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
