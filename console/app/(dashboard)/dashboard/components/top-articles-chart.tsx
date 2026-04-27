"use client";

import type { TopArticle } from "../helpers/dashboard-queries";

interface TopArticlesChartProps {
  data: TopArticle[];
  metricLabel: string;
}

export function TopArticlesChart({ data, metricLabel }: TopArticlesChartProps) {
  if (data.length === 0) return null;

  return (
    <ul className="space-y-3" role="list">
      {data.map((a, i) => {
        const max = Math.max(...data.map((x) => x.views), 1);
        const pct = (a.views / max) * 100;
        return (
          <li key={i} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground line-clamp-2 flex-1 leading-snug" title={a.title}>
                {a.title}
              </p>
              <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                {a.views.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
                role="presentation"
                aria-label={metricLabel}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
