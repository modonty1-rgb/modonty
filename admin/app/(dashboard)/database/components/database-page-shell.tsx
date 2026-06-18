import { KpiStrip } from "./kpi-strip";
import { AtlasClusterCard } from "./atlas-cluster-card";
import { StorageBreakdown } from "./storage-breakdown";
import { DataTablesGroup } from "./data-tables-group";
import { BackupRestoreCard } from "./backup-restore-card";
import type { CollectionSize } from "../actions/collection-sizes";
import type { BackupInfo } from "../actions/backup-info";
import type { AtlasReport } from "@/lib/atlas/atlas-client";

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
  collectionSizes: CollectionSize[];
  backup: BackupInfo;
  atlas: AtlasReport | null;
  isLocal: boolean;
}

export function DatabasePageShell({ health, collectionSizes, backup, atlas, isLocal }: Props) {
  const checkedAt = new Date(health.lastChecked);
  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Database</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Last checked:{" "}
          {checkedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          {" · "}
          {checkedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <KpiStrip health={health} backup={backup} />

      <AtlasClusterCard report={atlas} />

      <StorageBreakdown collectionSizes={collectionSizes} />

      <DataTablesGroup tables={health.tables} />

      <BackupRestoreCard isLocal={isLocal} />
    </div>
  );
}
