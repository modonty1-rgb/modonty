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
    version: "0.62.0 (admin + modonty)",
    title: "admin v0.62.0 — SITE URL Source of Truth refactor: single DB-backed source, www-only, self-healing canonical across 7 entity tables",
    items: [
      { type: "fix" as const, text: "Root cause: canonical URL host mismatch (modonty.com vs www.modonty.com) was blocking article publishing via Quality Check gate (CRITICAL). Root cause traced to 3 competing sources of truth: Settings.siteUrl in DB · NEXT_PUBLIC_SITE_URL env · NEXT_PUBLIC_SITE_BASE_URL env (duplicate). Plus 29 hardcoded `|| \"https://modonty.com\"` fallbacks (no www) scattered across admin. Independent senior code review verdict: SAFE TO PUSH." },
      { type: "feature" as const, text: "Single source of truth established: Settings.siteUrl (DB) → loadSiteUrl() async helper. New centralized URL builders (admin/lib/seo/url-builders.ts) with 11 async builders (buildArticleUrl/buildClientUrl/buildCategoryUrl/buildTagUrl/buildIndustryUrl/buildAuthorUrl/buildHomeUrl/buildSitemapUrl/buildImageSitemapUrl/buildRobotsUrl/buildAbsoluteUrl) + 11 sync *FromBase variants for tight loops. server-only directive. PATHS constants centralized." },
      { type: "fix" as const, text: "Deleted SITE_BASE_URL constant from admin/lib/gsc/client.ts + removed NEXT_PUBLIC_SITE_BASE_URL env var (was a duplicate of NEXT_PUBLIC_SITE_URL). Refactored 13 admin files that imported it (workflow pages, gated-transition, search-console, bing-webmaster, pipeline). toAbsoluteUrl() in indexing.ts converted from sync to async — all 3 internal callers (requestIndexing/notifyDeleted/getRemovalMetadata) now await correctly." },
      { type: "fix" as const, text: "Eliminated 29 hardcoded `|| \"https://modonty.com\"` (no-www) fallbacks across 22 server files. Strategy: (a) async pages/actions → await loadSiteUrl(), (b) shared sync generators → siteUrl parameter with www-fallback safety net, (c) settings-driven generators → settings.siteUrl || www-fallback (DB first). Touched lib/seo/* generators + modonty/setting/* + clients/* + authors/* + API routes. Grep verified: 0 bare-modonty hardcoded fallbacks remaining." },
      { type: "feature" as const, text: "Prop drilling for 7 client components: siteUrl: string added to ArticleFormContext (5 children — seo-step/seo-section/social-section/metatag-preview-step/article-form-preview-sidebar via useArticleForm().siteUrl), ClientForm + ClientSeoForm + ClientSEOValidationSection, useAuthorForm hook + AuthorForm. 6 server parent pages updated to call loadSiteUrl() and pass as prop (articles/new + articles/[id]/edit + clients/new + clients/[id]/edit + clients/[id]/seo + authors). Cleaned up runtime getAllSettings() anti-pattern in ClientSeoForm." },
      { type: "feature" as const, text: "Canonical URL Healer extended from Article-only to 7 entity tables (Article + Client + Category + Tag + Industry + Author + Modonty pages). Lives inside existing Run-All Auto-Maintenance flow on /maintenance — no new UI, just expanded the existing Step #6 to cover all canonical-bearing entities. Modonty entity uses PAGE_CONFIGS for correct /legal/* path resolution. Added perEntity breakdown + EntityType field on stats. Backward-compatible with existing runStepCanonical caller. Bug fix during testing: removed where status=PUBLISHED filter so DRAFT/SCHEDULED articles also get sanitized." },
      { type: "feature" as const, text: "Drift Detection (Step 1.5): loadSiteUrl() now compares DB.siteUrl vs env.NEXT_PUBLIC_SITE_URL and emits console.error if mismatch — DB always wins as source of truth. New getSiteUrlDriftStatus() helper. New SiteUrlDriftCard rendered on /maintenance page — compact green card when in sync, prominent amber alert when drift detected (shows both values + Vercel-update hint). Prevents the original mismatch bug from silently regressing in the future." },
      { type: "fix" as const, text: "Removed obsolete .replace(/^(https?:\\/\\/)(?!www\\.)modonty\\.com/, '$1www.modonty.com') workaround from modonty/app/articles/[slug]/page.tsx (lines 98 + 131). The workaround existed to band-aid the www mismatch — no longer needed after admin generators were unified to emit www host directly. Modonty article metadata now reads NEXT_PUBLIC_SITE_URL directly with www-fallback." },
      { type: "fix" as const, text: "Final verification: 51 files modified · TSC admin/modonty/console all zero errors · grep verified 0 SITE_BASE_URL + 0 NEXT_PUBLIC_SITE_BASE_URL + 0 hardcoded no-www fallbacks + 0 await-build-in-loop patterns. Live test smoke on 13 admin pages (maintenance/articles/clients/authors/search-console/pipeline/categories/tags/industries/seo-overview) → zero console errors related to siteUrl. Quality Check on the article that originally failed (6a0d728...) now PASSES 21/21 — 'Ready to send' green banner. Independent senior code review verdict: SAFE TO PUSH." },
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
