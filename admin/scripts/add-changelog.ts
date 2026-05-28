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
    version: "0.65.3 (admin)",
    title: "Search Console rebuilt as Google Truth view · Clients page tabs (jbrseo auto-sync) · Pipeline relocated · ToS cleanup",
    items: [
      { type: "feat" as const, text: "admin 0.65.3 — /search-console rebuilt as PURE Google Truth view. Source of truth = live PROD sitemap `https://www.modonty.com/sitemap.xml` (hardcoded, never local, never staging). URL Inspection cache TTL lowered 7d→24h, auto-background-refresh on page load (concurrency=3, capped at 200/run for quota safety). Smart classification: Indexed = PASS+PARTIAL (not just PASS), Blocked includes 5xx/404/ACCESS_DENIED/SOFT_404/robots/meta-noindex. New filter buttons (All/Indexed/Blocked/Unknown), tabs (All URLs · Not yet indexed), per-row GSC inspect button (copies URL + opens GSC inspection page)." },
      { type: "feat" as const, text: "admin 0.65.3 — Removal Queue restored as separate DB-driven card BELOW the Google view. URLs Google indexes but DB has missing/ARCHIVED. Clear badges: 'Not in DB' (red) and 'In DB · Archived' (amber). Sorted by impressions DESC. Per-row 'Remove in GSC' button copies URL + opens GSC Removals page." },
      { type: "feat" as const, text: "admin 0.65.3 — Pipeline route moved from `/search-console/pipeline/[articleId]` → `/articles/pipeline/[id]` (semantically correct — pipeline is article work, not search-console work). Added 'Pipeline' button column to `/articles` table (purple Workflow icon, one click → pipeline page). Updated breadcrumb-utils + revalidatePath calls accordingly. URL routes by content topic, not by inspection origin." },
      { type: "feat" as const, text: "admin 0.65.3 — /clients page rebuilt with shadcn Tabs. Tab 1: 'Clients' (existing list). Tab 2: 'jbrseo Subscribers' (people who signed up via jbrseo.com — was on /subscription-tiers before). Auto-sync from jbrseo MongoDB fires on first tab switch per page-load (useRef firedOnce guard). Sticky banner shows live status: blue 'Auto-syncing...' → emerald 'Synced — X new, Y updated · Z total · Nms' or 'already up to date'. Manual SyncButton remains for force-refresh. Toast always fires (even on zero changes) so client knows it ran." },
      { type: "feat" as const, text: "admin 0.65.3 — TierDistribution moved from /subscription-tiers → jbrseo Subscribers tab (Khalid's call: 'هذي وديها على جبر SEO subscribers'). Redesigned as compact horizontal inline strip: 'Distribution · X [bar] tier1 5 (63%) · tier2 2 (25%)...' Saves ~70% vertical space vs the old card. /subscription-tiers now simplified to Plans only (no Tabs, no TierDistribution, no SyncButton, no SubscribersTable)." },
      { type: "fix" as const, text: "admin 0.65.3 — fixed React 'missing key' warning on /clients (Radix UI TabsContent uses React.Children.toArray internally; 7 sibling children with 3 conditional `&&` renders triggered list-like key validation). Consolidated all children into one `<div className=\"space-y-4\">` wrapper + replaced 3 conditionals with single ternary chain. Console now shows 0 key warnings." },
      { type: "fix" as const, text: "admin 0.65.3 — purged dead Indexing API code that was a Google ToS violation. Verified via WebFetch on official `developers.google.com/search/apis/indexing-api/v3/quickstart`: Indexing API is restricted to JobPosting + BroadcastEvent ONLY. Modonty articles don't qualify. Removed `requestIndexingAction`, `requestIndexingBulkAction`, `notifyGoogleDeletedAction`, `notifyGoogleDeletedBulkAction` from seo-actions.ts + `requestArticleIndexingAction` from pipeline-actions.ts. Also deleted 3 orphan UI files: pending-indexing-card, indexing-recheck-button, seo-bulk-actions." },
      { type: "feat" as const, text: "admin 0.65.3 — extended `analyzeGscCoverage()` to batch-lookup ALL entity types (Article, Author, Category, Tag, Industry, Client) in parallel — previously only Articles were enriched, causing author/category/tag/industry URLs to show as `n/a` (wrong-counted as 'other'). All non-article entities now correctly classified as `PUBLISHED` when present in DB, `missing` otherwise." },
      { type: "fix" as const, text: "admin 0.65.3 — sidebar item 'Pricing & Leads' renamed to 'Subscription Tiers' (since /subscription-tiers no longer has leads/signups — they moved to /clients tab). Page header + subtitle updated to match." },
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
