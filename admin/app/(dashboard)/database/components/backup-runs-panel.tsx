import { AlertTriangle, CheckCircle2, CloudUpload, HardDrive, XCircle } from "lucide-react";

import type { BackupRunsReport } from "../actions/backup-runs";

/**
 * Shows when the last backup landed and which database it copied.
 *
 * `dbName` is on every row on purpose: for months the manual script copied the test
 * database while its output said only "Backup successful", and nothing on any screen
 * would have revealed it. The name is now impossible to miss.
 */

const SOURCE_LABEL: Record<string, string> = {
  VERCEL_CRON: "Daily cron",
  LOCAL_DUMP: "Local dump",
  RESTORE_TEST: "Restore drill",
};

function mb(bytes: number | null): string {
  if (bytes === null) return "—";
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function ago(hours: number | null): string {
  if (hours === null) return "never";
  if (hours < 1) return "less than an hour ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function BackupRunsPanel({ report }: { report: BackupRunsReport }) {
  const { runs, lastSuccess, hoursSinceSuccess, health, failedSinceSuccess } = report;

  const tone =
    health === "ok"
      ? { ring: "ring-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 }
      : health === "late"
        ? { ring: "ring-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", Icon: AlertTriangle }
        : { ring: "ring-red-500/30", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", Icon: XCircle };

  const headline =
    health === "never"
      ? "No successful daily backup yet"
      : health === "missing"
        ? `No backup for ${ago(hoursSinceSuccess)} — check the cron`
        : health === "late"
          ? `Last backup ${ago(hoursSinceSuccess)} — due now`
          : `Last backup ${ago(hoursSinceSuccess)}`;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CloudUpload className="h-4 w-4 text-muted-foreground" />
          Backup history
        </h2>
        <span className="text-[11px] text-muted-foreground">
          Daily to a private Bunny zone · last 10 runs
        </span>
      </div>

      <div className={`mx-3 mt-3 rounded-lg px-3 py-2 ring-1 ${tone.ring} ${tone.bg}`}>
        <div className="flex items-center gap-2 text-xs">
          <tone.Icon className={`h-4 w-4 shrink-0 ${tone.text}`} />
          <span className={`font-semibold ${tone.text}`}>{headline}</span>
          {lastSuccess && (
            <span className="text-muted-foreground">
              · <code className="font-mono">{lastSuccess.dbName}</code> ·{" "}
              {lastSuccess.collections ?? 0} collections ·{" "}
              {(lastSuccess.documents ?? 0).toLocaleString("en-US")} docs
            </span>
          )}
          {failedSinceSuccess > 0 && (
            <span className="ms-auto font-semibold text-red-600 dark:text-red-400 shrink-0">
              {failedSinceSuccess} failed since
            </span>
          )}
        </div>
      </div>

      {runs.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-muted-foreground">
          No runs recorded yet — the first daily backup will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-[11px]">
                <th className="text-start font-medium pb-1.5">When</th>
                <th className="text-start font-medium pb-1.5">Database</th>
                <th className="text-start font-medium pb-1.5">Source</th>
                <th className="text-end font-medium pb-1.5">Collections</th>
                <th className="text-end font-medium pb-1.5">Documents</th>
                <th className="text-end font-medium pb-1.5">Size</th>
                <th className="text-end font-medium pb-1.5">Took</th>
                <th className="text-end font-medium pb-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-1.5 tabular-nums whitespace-nowrap">
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: "Asia/Riyadh",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(r.startedAt)}
                  </td>
                  <td className="py-1.5">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <HardDrive className="h-3 w-3 text-muted-foreground" />
                      {r.dbName}
                    </span>
                  </td>
                  <td className="py-1.5 text-muted-foreground">
                    {SOURCE_LABEL[r.source] ?? r.source}
                  </td>
                  <td className="py-1.5 text-end tabular-nums">{r.collections ?? "—"}</td>
                  <td className="py-1.5 text-end tabular-nums">
                    {r.documents?.toLocaleString("en-US") ?? "—"}
                  </td>
                  <td className="py-1.5 text-end tabular-nums">{mb(r.sizeBytes)}</td>
                  <td className="py-1.5 text-end tabular-nums">
                    {r.durationMs ? `${Math.round(r.durationMs / 1000)}s` : "—"}
                  </td>
                  <td className="py-1.5 text-end">
                    {r.status === "SUCCESS" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">OK</span>
                    ) : r.status === "RUNNING" ? (
                      <span className="text-muted-foreground">running…</span>
                    ) : (
                      <span
                        className="text-red-600 dark:text-red-400 font-semibold"
                        title={r.errorText ?? undefined}
                      >
                        FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
