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
    version: "1.49.4 (modonty) + 0.65.0 (admin)",
    title: "Centralized /seo admin page + hreflang feature (GCC + Egypt)",
    items: [
      { type: "feat" as const, text: "admin 0.65.0 — New unified /seo admin page consolidates all SEO maintenance + cascade control + article health into one place. 5 sections: (1) Health Summary 🟢🟡🔴 indicators for JSON-LD/Canonical/Sitemap status. (2) KPI Strip with published count, JSON-LD coverage %, stale counts. (3) ⚡ Quick Maintenance — 4 SEO fixes in one click (~5s). (4) 🔄 Full Rebuild (Cascade) — regenerates JSON-LD + metadata for every entity with live progress bar + elapsed timer + ETA (~3-5 min, 119 entities). (5) 🩺 Per-Article Surgery — table with bulk fix for individual articles." },
      { type: "feat" as const, text: "admin 0.65.0 — Added hreflang Sync as 4th step in Quick Maintenance Run-All. Idempotent: checks Settings.defaultAlternateLanguages, adds only what's missing from the GCC + Egypt set (ar-SA, ar-EG, ar-AE, ar-KW, ar-QA, ar-BH, ar-OM, ar, x-default = 9 entries). Settings is a singleton so no UI form needed — the maintenance button is the only entry point. Live tested: ran sync → 9 added, 0 kept. Then ran Cascade → all 30 articles regenerated metadata with new hreflang config." },
      { type: "feat" as const, text: "modonty 1.49.4 — articles/[slug]/page.tsx now reads hreflang config from Settings.defaultAlternateLanguages via getArticleDefaultsFromSettings(). New buildLanguagesMap() helper takes the locale list and pairs each with the article's canonical URL (Arabic single-source content for all GCC + Egypt audiences). Removed hardcoded 4-entry hreflang block. Live verified via curl on localhost:3001: 9 <link rel='alternate' hreflang='...'> tags emitted in <head> for /articles/ما-هو-السيو (ar-SA + ar-EG + ar-AE + ar-KW + ar-QA + ar-BH + ar-OM + ar + x-default). Mariam audit #3 Issue #4 RESOLVED." },
      { type: "refactor" as const, text: "admin 0.65.0 — Centralized SEO maintenance. Moved 7 SEO action files to admin/app/(dashboard)/seo/actions/: cascade-all-seo.ts + cascade-step-actions.ts (from /settings) + jsonld-integrity.ts + canonical-url-sanitizer.ts + sitemap-freshness.ts (from /database) + seo-overview-actions.ts + articles-seo-actions.ts (from /seo-overview). Updated 8 importers to absolute @/ paths. Wired the orphan cascade-step-actions.ts as client-driven Cascade panel with per-phase live progress (was dead code). Created new run-seo-maintenance.ts wrapping 3 SEO step runners + hreflang sync." },
      { type: "remove" as const, text: "admin 0.65.0 — Deleted /seo-overview entirely (page.tsx + seo-overview-client.tsx + articles-seo-health.tsx + loading.tsx + actions dir). Added 308 permanent redirect /seo-overview → /seo in admin/next.config.ts. Deleted true-orphan duplicate settings/actions/regenerate-all-seo.ts (cascadeSettingsToAllEntities covers the same functionality, no importers). Sidebar entry 'SEO Overview' replaced with 'SEO' → /seo." },
      { type: "refactor" as const, text: "admin 0.65.0 — Removed SEO bits from /maintenance UI (verified 100% duplicate of /seo). Cleaned db-tools-section.tsx (removed JSON-LD Cache Integrity + Canonical URL Sanitizer cards + state + props + imports — ~210 LOC removed). Cleaned auto-maintenance-panel.tsx (removed 3 SEO step entries from STEPS, header copy now 'Runs 7 safe... SEO maintenance is at /seo'). Removed runStepJsonLd, runStepCanonical, runStepSitemapFreshness from database/actions/run-all-maintenance.ts. Cleaned maintenance-page-shell.tsx + maintenance/page.tsx of SEO props/fetches. /maintenance now shows 7 DB-only tools (down from 9)." },
      { type: "feat" as const, text: "admin 0.65.0 — Cascade panel enhanced UX (after Khalid 'I'm confused about progress' feedback). Now shows: large 0-100% indicator + 'X of Y entities' counter + live elapsed time (1m 23s, ticks every second via useEffect interval) + ETA estimate based on running velocity (~30s remaining). Per-phase mini progress bars for Categories/Tags/Industries/Clients/Articles/Listings with individual percentages. Section headers clarified: ⚡ Quick Maintenance + 🔄 Full Rebuild (Cascade) + 🩺 Per-Article Surgery — each with 'Use when:' hints + time badges." },
      { type: "feat" as const, text: "admin 0.65.0 — New hreflang-sync.ts action exports getHreflangSyncStats + syncHreflangLocales (server actions, both async per Next.js use-server contract). Internal HREFLANG_TARGETS const lists the 9 target locales. Existing entries preserved on each run (idempotent). Triggers revalidateModontyTag('settings') after writing so modonty picks up the new config." },
      { type: "fix" as const, text: "admin 0.65.0 — Memory rule saved: no standalone DB scripts; all DB mutations (seed, sanitize, migration) go through admin UI buttons (Settings page or /seo Quick Maintenance) not via *.ts in admin/scripts. Khalid established this 2026-05-28 after I tried to write a seed script for hreflang." },
      { type: "fix" as const, text: "Documents: created documents/tasks/SEO-MAINTENANCE-PAGE-PLAN.md (comprehensive master plan with phase checklists + decisions + deferrals). Updated documents/tasks/MARIAM-AUDIT-OPEN-ITEMS.md (hreflang item moved to Done). Updated documents/context/SESSION-LOG.md with full session block." },
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
