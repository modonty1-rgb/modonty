import { getDatabaseHealth } from "./actions/database-health";
import { getOrphanStats } from "./actions/orphan-cleaner";
import { getIndexHealth } from "./actions/index-health";
import { getSlugIntegrity } from "./actions/slug-integrity";
import { getBrokenReferences } from "./actions/broken-references";
import { getSessionCleanerStats } from "./actions/session-cleaner";
import { getStaleVersionsStats } from "./actions/stale-versions";
import { getCollectionSizes } from "./actions/collection-sizes";
import { getDuplicateSlugs } from "./actions/duplicate-slugs";
import { DatabaseOverview } from "./components/database-overview";
import { DbToolsSection } from "./components/db-tools-section";

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
  ]);

  const isLocal = process.env.NODE_ENV !== "production";

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Database Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Live snapshot — {health.totalRecords.toLocaleString()} records
          {health.storageMB > 0 ? ` · ${health.storageMB} MB` : ""}
        </p>
      </div>
      <DatabaseOverview health={health} isLocal={isLocal} />
      <DbToolsSection
        orphans={orphans}
        indexHealth={indexHealth}
        slugIssues={slugIssues}
        brokenRefs={brokenRefs}
        sessionStats={sessionStats}
        staleVersions={staleVersions}
        collectionSizes={collectionSizes}
        duplicateSlugs={duplicateSlugs}
      />
    </div>
  );
}
