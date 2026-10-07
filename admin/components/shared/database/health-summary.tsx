"use client";

import { AlertTriangle, CheckCircle2, Database } from "lucide-react";

interface Props {
  attentionCount: number;
  healthyCount: number;
  tableGroupsCount: number;
  hideGroups?: boolean;
}

export function HealthSummary({ attentionCount, healthyCount, tableGroupsCount, hideGroups = false }: Props) {
  return (
    <div className={`grid grid-cols-1 ${hideGroups ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3`}>
      <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${
        attentionCount > 0
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "border-green-500/30 bg-green-500/5"
      }`}>
        <div className={`size-9 rounded-lg flex items-center justify-center ${
          attentionCount > 0 ? "bg-yellow-500/15 text-yellow-500" : "bg-green-500/15 text-green-500"
        }`}>
          {attentionCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </div>
        <div>
          <div className={`text-lg font-bold leading-none ${
            attentionCount > 0 ? "text-yellow-600 dark:text-yellow-300" : "text-green-600 dark:text-green-300"
          }`}>
            {attentionCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {attentionCount > 0 ? "tools need attention" : "all tools healthy"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 flex items-center gap-3">
        <div className="size-9 rounded-lg bg-green-500/15 flex items-center justify-center text-green-500">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-lg font-bold leading-none text-green-600 dark:text-green-300">{healthyCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">tools healthy</div>
        </div>
      </div>

      {!hideGroups && (
        <div className="rounded-xl border bg-card p-3.5 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-bold leading-none">{tableGroupsCount}</div>
            <div className="text-[11px] text-muted-foreground mt-1">data table groups</div>
          </div>
        </div>
      )}
    </div>
  );
}
