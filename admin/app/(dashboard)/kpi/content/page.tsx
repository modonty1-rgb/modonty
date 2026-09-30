import Link from "next/link";

import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { cn } from "@/lib/utils";

import { WriterCard } from "./components/writer-card";
import { ALL_TIME, getContentKpis } from "./helpers/get-content-kpis";

export const metadata = { title: "Content KPI" };

// «All time» added by Khalid (30 Sep 2026): «من البداية لحد اللحظة».
const PERIODS = [7, 28, 90, ALL_TIME] as const;

/**
 * **KPI › Content** (Khalid, 30 Sep 2026) — the first page of the KPI section; Graphics, Sales and
 * the rest follow as their own pages. One card per writer, ranked by the clicks Google sent to his
 * clients. Staff performance, so ADMIN only.
 */
export default async function ContentKpiPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") {
    return <p className="px-5 py-10 text-sm text-muted-foreground">This page is for admins only.</p>;
  }

  const raw = Number((await searchParams).period);
  const days = (PERIODS as readonly number[]).includes(raw) ? raw : 28;

  let data: Awaited<ReturnType<typeof getContentKpis>> | null = null;
  try {
    data = await getContentKpis(days);
  } catch (error) {
    console.error("[ContentKpiPage]", error);
  }

  let rank = 0;
  return (
    <div className="space-y-4 px-4 pb-6 sm:px-5">
      <header className="flex flex-wrap items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-semibold">Content KPI</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Each writer&apos;s clients in Google Search (Search Console · modonty.com)
            {data && ` · ${data.range.start} → ${data.range.end}`}
            {data?.range.prevStart && `, change vs ${data.range.prevStart} → ${data.range.prevEnd}`}
            {data && !data.range.prevStart && " (Search Console keeps 16 months)"}
          </p>
        </div>
        <nav className="inline-flex rounded-lg border bg-card p-0.5" aria-label="Period">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/kpi/content?period=${p}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                p === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={p === days ? "page" : undefined}
            >
              {p === ALL_TIME ? "All time" : `${p} days`}
            </Link>
          ))}
        </nav>
      </header>

      {!data ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Couldn&apos;t reach Search Console right now — try again in a minute.
        </p>
      ) : data.writers.length === 0 ? (
        <p className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">No writers yet — assign an editor to a client first.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.writers.map((w) => (
            <WriterCard key={w.id ?? "unassigned"} writer={w} rank={w.id === null ? null : ++rank} compare={data.range.prevStart !== null} />
          ))}
        </div>
      )}
    </div>
  );
}
