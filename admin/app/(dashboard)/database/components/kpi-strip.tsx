"use client";

import { Database, HardDrive, FolderTree, Clock, AlertTriangle } from "lucide-react";

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

interface BackupInfo {
  lastBackup: { timestamp: Date; collections: number; sizeRaw: string } | null;
  totalCount: number;
  rotationLimit: number;
}

// MongoDB Atlas Flex — 5 GB storage included in the $8/mo base fee
const FLEX_INCLUDED_MB = 5120;

function timeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function backupAgeTone(d: Date): "fresh" | "stale" | "critical" {
  const hoursAgo = (Date.now() - d.getTime()) / 3_600_000;
  if (hoursAgo < 24) return "fresh";
  if (hoursAgo < 72) return "stale";
  return "critical";
}

export function KpiStrip({
  health,
  backup,
}: {
  health: DatabaseHealth;
  backup: BackupInfo;
}) {
  const storagePercent = Math.min((health.storageMB / FLEX_INCLUDED_MB) * 100, 100);
  const storageTone =
    storagePercent < 50 ? "emerald" : storagePercent < 80 ? "amber" : "red";

  const backupAge = backup.lastBackup ? backupAgeTone(backup.lastBackup.timestamp) : "critical";
  const backupTone = backupAge === "fresh" ? "emerald" : backupAge === "stale" ? "amber" : "red";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Records */}
      <Card>
        <CardIcon tone="violet">
          <Database className="h-4 w-4" />
        </CardIcon>
        <CardBody>
          <CardLabel>Total Records</CardLabel>
          <CardValue>{health.totalRecords.toLocaleString()}</CardValue>
          <CardHint>across {health.tables.length} tables</CardHint>
        </CardBody>
      </Card>

      {/* Storage */}
      <Card>
        <CardIcon tone={storageTone}>
          <HardDrive className="h-4 w-4" />
        </CardIcon>
        <CardBody>
          <div className="flex items-baseline justify-between gap-2">
            <CardLabel>Storage</CardLabel>
            <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
              {storagePercent.toFixed(1)}%
            </span>
          </div>
          <CardValue>
            {health.storageMB} <span className="text-xs font-normal text-muted-foreground">MB / 5 GB</span>
          </CardValue>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all ${
                storageTone === "emerald"
                  ? "bg-emerald-500"
                  : storageTone === "amber"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.max(storagePercent, 2)}%` }}
            />
          </div>
          <CardHint>MongoDB Atlas Flex · 5 GB included</CardHint>
        </CardBody>
      </Card>

      {/* Collections */}
      <Card>
        <CardIcon tone="blue">
          <FolderTree className="h-4 w-4" />
        </CardIcon>
        <CardBody>
          <CardLabel>Collections</CardLabel>
          <CardValue>{health.collectionsCount || health.tables.length}</CardValue>
          <CardHint>MongoDB collections</CardHint>
        </CardBody>
      </Card>

      {/* Last Backup */}
      <Card>
        <CardIcon tone={backupTone}>
          {backupTone === "red" ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        </CardIcon>
        <CardBody>
          <CardLabel>Last Backup</CardLabel>
          {backup.lastBackup ? (
            <>
              <CardValue className="text-base">{timeAgo(backup.lastBackup.timestamp)}</CardValue>
              <CardHint>
                {backup.lastBackup.collections} collections · {backup.lastBackup.sizeRaw}
              </CardHint>
            </>
          ) : (
            <>
              <CardValue className="text-base text-red-500">No backups</CardValue>
              <CardHint>Run a backup soon</CardHint>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-3.5 flex items-start gap-3">{children}</div>;
}

const TONE_BG: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-500",
  red: "bg-red-500/15 text-red-500",
  blue: "bg-blue-500/15 text-blue-500",
};

function CardIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${TONE_BG[tone] ?? TONE_BG.violet}`}>
      {children}
    </div>
  );
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-w-0">{children}</div>;
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{children}</div>;
}

function CardValue({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-lg font-bold leading-tight mt-0.5 ${className}`}>{children}</div>;
}

function CardHint({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-muted-foreground mt-1">{children}</div>;
}
