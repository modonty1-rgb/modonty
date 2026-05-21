"use client";

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

export function CompactStatsHeader({ health }: { health: DatabaseHealth }) {
  const checkedAt = new Date(health.lastChecked);
  const formattedTime = checkedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = checkedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Database</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          آخر تحديث: {formattedTime} · {formattedDate}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <span className="size-1.5 rounded-full bg-primary" />
          {health.totalRecords.toLocaleString()} records
        </span>
        {health.storageMB > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-blue-500" />
            {health.storageMB} MB
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-yellow-500" />
          Free Tier
        </span>
      </div>
    </div>
  );
}
