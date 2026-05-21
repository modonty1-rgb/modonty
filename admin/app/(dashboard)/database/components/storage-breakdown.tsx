"use client";

import type { CollectionSize } from "../actions/collection-sizes";

// Distinct, accessible colors per collection for the stacked bar.
const PALETTE = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

export function StorageBreakdown({ collectionSizes }: { collectionSizes: CollectionSize[] }) {
  const tracked = collectionSizes.filter((c) => c.sizeMB > 0);
  const totalMB = tracked.reduce((s, c) => s + c.sizeMB, 0);

  if (tracked.length === 0) {
    return null;
  }

  // Sort largest → smallest for the bar order
  const sorted = [...tracked].sort((a, b) => b.sizeMB - a.sizeMB);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Storage Breakdown</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            What's taking up disk space — top {sorted.length} collections
          </p>
        </div>
        <span className="text-xs font-semibold tabular-nums">
          {totalMB.toFixed(2)} MB total
        </span>
      </div>

      {/* Stacked horizontal bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-muted">
        {sorted.map((col, i) => {
          const pct = (col.sizeMB / totalMB) * 100;
          return (
            <div
              key={col.collection}
              className={PALETTE[i % PALETTE.length]}
              style={{ width: `${pct}%` }}
              title={`${col.label} — ${col.sizeMB} MB (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        {sorted.map((col, i) => {
          const pct = (col.sizeMB / totalMB) * 100;
          return (
            <li key={col.collection} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-sm shrink-0 ${PALETTE[i % PALETTE.length]}`} />
                <span className="truncate">{col.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums text-muted-foreground">
                <span>{col.sizeMB} MB</span>
                <span className="font-semibold text-foreground w-10 text-end">{pct.toFixed(1)}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
