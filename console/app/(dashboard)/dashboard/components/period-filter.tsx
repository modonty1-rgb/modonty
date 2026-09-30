import Link from "next/link";

import { ar } from "@/lib/ar";
import { cn } from "@/lib/utils";

import { DASHBOARD_PERIODS, type DashboardPeriod } from "../helpers/get-dashboard-period";

/** 7 · 28 · 90 days — plain links (`?period=`), so the page stays a server page and the choice survives a reload. */
export function PeriodFilter({ value }: { value: DashboardPeriod }) {
  return (
    <nav aria-label={ar.dashboard.periodAria} className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
      {DASHBOARD_PERIODS.map((p) => (
        <Link
          key={p}
          href={`/dashboard?period=${p}`}
          scroll={false}
          aria-current={p === value ? "page" : undefined}
          className={cn(
            "inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium transition-colors max-md:min-h-11",
            p === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {(p <= 10 ? ar.dashboard.periodDaysFew : ar.dashboard.periodDays).replace("{n}", String(p))}
        </Link>
      ))}
    </nav>
  );
}
