import { getOrphanStats } from "@/lib/database/orphan-cleaner";
import { getIndexHealth } from "@/lib/database/index-health";
import { getSlugIntegrity } from "./actions/slug-integrity";
import { getBrokenReferences } from "./actions/broken-references";
import { getSessionCleanerStats } from "@/lib/database/session-cleaner";
import { getStaleVersionsStats } from "@/lib/database/stale-versions";
import { getDuplicateSlugs } from "./actions/duplicate-slugs";
import { getLegalFormSanitizerStats } from "@/lib/database/legalform-sanitizer";
import { getCanonicalSanitizerStats } from "@/lib/database/canonical-sanitizer";
import { getSiteUrlDriftStatus } from "@/lib/seo/site-url";
import { MaintenancePageShell } from "./components/maintenance-page-shell";

export default async function MaintenancePage() {
  const [
    orphans,
    indexHealth,
    slugIssues,
    brokenRefs,
    sessionStats,
    staleVersions,
    duplicateSlugs,
    legalFormSanitizer,
    canonicalSanitizer,
    siteUrlDrift,
  ] = await Promise.all([
    getOrphanStats(),
    getIndexHealth(),
    getSlugIntegrity(),
    getBrokenReferences(),
    getSessionCleanerStats(),
    getStaleVersionsStats(),
    getDuplicateSlugs(),
    getLegalFormSanitizerStats(),
    getCanonicalSanitizerStats(),
    getSiteUrlDriftStatus(),
  ]);

  return (
    <MaintenancePageShell
      orphans={orphans}
      indexHealth={indexHealth}
      slugIssues={slugIssues}
      brokenRefs={brokenRefs}
      sessionStats={sessionStats}
      staleVersions={staleVersions}
      duplicateSlugs={duplicateSlugs}
      legalFormSanitizer={legalFormSanitizer}
      canonicalSanitizer={canonicalSanitizer}
      siteUrlDrift={siteUrlDrift}
    />
  );
}
