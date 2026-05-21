import { getDatabaseHealth } from "./actions/database-health";
import { getOrphanStats } from "./actions/orphan-cleaner";
import { getIndexHealth } from "./actions/index-health";
import { getSlugIntegrity } from "./actions/slug-integrity";
import { getBrokenReferences } from "./actions/broken-references";
import { getSessionCleanerStats } from "./actions/session-cleaner";
import { getStaleVersionsStats } from "./actions/stale-versions";
import { getCollectionSizes } from "./actions/collection-sizes";
import { getDuplicateSlugs } from "./actions/duplicate-slugs";
import { getJsonLdIntegrityStats } from "./actions/jsonld-integrity";
import { getCanonicalUrlSanitizerStats } from "./actions/canonical-url-sanitizer";
import { getLegalFormSanitizerStats } from "./actions/legalform-sanitizer";
import { DatabasePageShell } from "./components/database-page-shell";

export default async function DatabasePage() {
  const [
    health,
    orphans,
    indexHealth,
    slugIssues,
    brokenRefs,
    sessionStats,
    staleVersions,
    collectionSizes,
    duplicateSlugs,
    jsonLdIntegrity,
    canonicalSanitizer,
    legalFormSanitizer,
  ] = await Promise.all([
    getDatabaseHealth(),
    getOrphanStats(),
    getIndexHealth(),
    getSlugIntegrity(),
    getBrokenReferences(),
    getSessionCleanerStats(),
    getStaleVersionsStats(),
    getCollectionSizes(),
    getDuplicateSlugs(),
    getJsonLdIntegrityStats(),
    getCanonicalUrlSanitizerStats(),
    getLegalFormSanitizerStats(),
  ]);

  const isLocal = process.env.NODE_ENV !== "production";

  return (
    <DatabasePageShell
      health={health}
      isLocal={isLocal}
      orphans={orphans}
      indexHealth={indexHealth}
      slugIssues={slugIssues}
      brokenRefs={brokenRefs}
      sessionStats={sessionStats}
      staleVersions={staleVersions}
      collectionSizes={collectionSizes}
      duplicateSlugs={duplicateSlugs}
      jsonLdIntegrity={jsonLdIntegrity}
      canonicalSanitizer={canonicalSanitizer}
      legalFormSanitizer={legalFormSanitizer}
    />
  );
}
