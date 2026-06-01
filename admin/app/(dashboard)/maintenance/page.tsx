import { getOrphanStats } from "@/app/(dashboard)/database/actions/orphan-cleaner";
import { getIndexHealth } from "@/app/(dashboard)/database/actions/index-health";
import { getSlugIntegrity } from "@/app/(dashboard)/database/actions/slug-integrity";
import { getBrokenReferences } from "@/app/(dashboard)/database/actions/broken-references";
import { getSessionCleanerStats } from "@/app/(dashboard)/database/actions/session-cleaner";
import { getStaleVersionsStats } from "@/app/(dashboard)/database/actions/stale-versions";
import { getDuplicateSlugs } from "@/app/(dashboard)/database/actions/duplicate-slugs";
import { getLegalFormSanitizerStats } from "@/app/(dashboard)/database/actions/legalform-sanitizer";
import { getCanonicalSanitizerStats } from "@/app/(dashboard)/database/actions/canonical-sanitizer";
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
