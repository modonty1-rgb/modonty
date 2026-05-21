"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompactStatsHeader } from "./compact-stats-header";
import { HealthSummary } from "./health-summary";
import { BackupRestoreCard } from "./backup-restore-card";
import { DataTablesGroup } from "./data-tables-group";
import { DbToolsSection } from "./db-tools-section";
import { AutoMaintenancePanel } from "./auto-maintenance-panel";
import type { OrphanStats } from "../actions/orphan-cleaner";
import type { TTLIndexStatus } from "../actions/index-health";
import type { SlugIssue } from "../actions/slug-integrity";
import type { BrokenRefsResult } from "../actions/broken-references";
import type { SessionCleanerStats } from "../actions/session-cleaner";
import type { StaleVersionsStats } from "../actions/stale-versions";
import type { CollectionSize } from "../actions/collection-sizes";
import type { DuplicateSlugStats } from "../actions/duplicate-slugs";
import type { JsonLdIntegrityStats } from "../actions/jsonld-integrity";
import type { CanonicalSanitizerStats } from "../actions/canonical-url-sanitizer";
import type { LegalFormSanitizerStats } from "../actions/legalform-sanitizer";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  group: string;
}

interface DatabaseHealth {
  tables: TableInfo[];
  totalRecords: number;
  lastChecked: string;
  storageMB: number;
  collectionsCount: number;
}

interface Props {
  health: DatabaseHealth;
  isLocal: boolean;
  orphans: OrphanStats;
  indexHealth: TTLIndexStatus[];
  slugIssues: SlugIssue[];
  brokenRefs: BrokenRefsResult;
  sessionStats: SessionCleanerStats;
  staleVersions: StaleVersionsStats;
  collectionSizes: CollectionSize[];
  duplicateSlugs: DuplicateSlugStats;
  jsonLdIntegrity: JsonLdIntegrityStats;
  canonicalSanitizer: CanonicalSanitizerStats;
  legalFormSanitizer: LegalFormSanitizerStats;
}

// Compute attention/healthy split for the summary strip
function computeToolStatuses(props: Omit<Props, "health" | "isLocal">) {
  const statuses = {
    orphan: props.orphans.expiredOtps > 0,
    session: props.sessionStats.total > 0,
    duplicateSlugs: props.duplicateSlugs.crossClientSlugs > 0,
    ttlIndex: props.indexHealth.filter((i) => !i.exists).length > 0,
    slugIntegrity: props.slugIssues.reduce((s, i) => s + i.emptySlugs, 0) > 0,
    jsonLd: props.jsonLdIntegrity.staleCount > 0,
    canonical: props.canonicalSanitizer.staleCount > 0,
    legalForm: props.legalFormSanitizer.mappableCount > 0,
    brokenRefs: props.brokenRefs.total > 0,
  };

  const attention = Object.values(statuses).filter(Boolean).length;
  const healthy = Object.values(statuses).filter((s) => !s).length;
  return { attention, healthy };
}

// Count only the 6 issues that the one-click button can fix automatically
function computeAutoFixableCount(props: Omit<Props, "health" | "isLocal">) {
  let n = 0;
  if (props.orphans.expiredOtps > 0) n++;
  if (props.sessionStats.total > 0) n++;
  if (props.staleVersions.stale30Days > 0) n++;
  if (props.indexHealth.some((i) => !i.exists)) n++;
  if (props.jsonLdIntegrity.staleCount > 0) n++;
  if (props.canonicalSanitizer.staleCount > 0) n++;
  if (props.legalFormSanitizer.mappableCount > 0) n++;
  return n;
}

const TABLE_GROUPS = ["Core", "Content", "Audience", "Analytics", "System"];

export function DatabasePageShell(props: Props) {
  const { attention, healthy } = computeToolStatuses(props);
  const autoFixable = computeAutoFixableCount(props);
  const tableGroupsCount = TABLE_GROUPS.filter((g) =>
    props.health.tables.some((t) => t.group === g)
  ).length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      {/* 1. Compact header with stats pills */}
      <CompactStatsHeader health={props.health} />

      {/* 2. Health summary strip */}
      <HealthSummary
        attentionCount={attention}
        healthyCount={healthy}
        tableGroupsCount={tableGroupsCount}
      />

      {/* 3. Tabs */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="h-auto p-1 bg-muted/40 border">
          <TabsTrigger value="maintenance" className="gap-2">
            Maintenance
            {attention > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                {attention}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tables" className="gap-2">
            Data Tables
            <span className="text-[10px] text-muted-foreground">{tableGroupsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-4 space-y-4">
          <AutoMaintenancePanel attentionCount={autoFixable} />

          <DbToolsSection
            orphans={props.orphans}
            indexHealth={props.indexHealth}
            slugIssues={props.slugIssues}
            brokenRefs={props.brokenRefs}
            sessionStats={props.sessionStats}
            duplicateSlugs={props.duplicateSlugs}
            jsonLdIntegrity={props.jsonLdIntegrity}
            canonicalSanitizer={props.canonicalSanitizer}
            legalFormSanitizer={props.legalFormSanitizer}
          />
        </TabsContent>

        <TabsContent value="tables" className="mt-4">
          <DataTablesGroup tables={props.health.tables} collectionSizes={props.collectionSizes} />
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <BackupRestoreCard isLocal={props.isLocal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
