"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CheckCircle2, FileClock, Hourglass, Users2 } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import type { ClientGuideRow, GuidePlan } from "../helpers/get-clients-guide";

const N = new Intl.NumberFormat("en-US");
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Riyadh",
});
const num = (v: number | null) => (v != null ? N.format(v) : "—");
/** Nulls last whichever way the column is sorted — a client with no order is not «zero». */
const byNumber = (pick: (r: ClientGuideRow) => number | null) => (a: ClientGuideRow, b: ClientGuideRow) =>
  (pick(a) ?? Number.NEGATIVE_INFINITY) - (pick(b) ?? Number.NEGATIVE_INFINITY);

/**
 * Short headers (Mo · Awaiting · Left, full name on hover) and names cut at 240px: the long
 * headers pushed the table 5px past its box at 1280 with the sidebar open, and it scrolled.
 *
 * The shared `DataTable` (entity-standard #3: one density, search, sort, pagination) — English,
 * like every table in the admin (Khalid, 2026-09-24). Each cell is one line: the table's `h-10`
 * rows are the agreed scale, so no stacked sub-lines or progress bars.
 */
const columns: Column<ClientGuideRow>[] = [
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (r) => (
      <Link
        href={`/clients/${r.id}/edit`}
        title={r.name}
        className="block max-w-[240px] truncate hover:text-primary hover:underline"
      >
        {r.name}
      </Link>
    ),
  },
  {
    key: "planName",
    header: "Plan",
    sortable: true,
    render: (r) => r.planName ?? <span className="text-muted-foreground">No active order</span>,
  },
  {
    key: "serviceMonths",
    header: <span title="Months">Mo</span>,
    sortable: true,
    sortFn: byNumber((r) => (r.planName ? r.serviceMonths : null)),
    className: "w-[1%] text-center tabular-nums",
    render: (r) => (r.planName ? N.format(r.serviceMonths) : "—"),
  },
  {
    key: "agreed",
    header: "Agreed",
    sortable: true,
    sortFn: byNumber((r) => r.agreed),
    className: "w-[1%] text-center tabular-nums",
    render: (r) => num(r.agreed),
  },
  {
    key: "awaitingApproval",
    header: <span title="Awaiting client approval — in the client's console">Awaiting</span>,
    sortable: true,
    sortFn: byNumber((r) => r.awaitingApproval),
    className: "w-[1%] text-center tabular-nums",
    render: (r) => (
      <span
        className={r.awaitingApproval > 0 ? "font-bold text-sky-600 dark:text-sky-400" : "text-muted-foreground"}
        title={r.awaitingApproval > 0 ? "In the client's console, not approved yet" : undefined}
      >
        {N.format(r.awaitingApproval)}
      </span>
    ),
  },
  {
    key: "delivered",
    header: "Published",
    sortable: true,
    sortFn: byNumber((r) => r.delivered),
    className: "w-[1%] text-center tabular-nums",
    render: (r) => num(r.delivered),
  },
  {
    key: "remaining",
    header: <span title="Remaining = Agreed − Published">Left</span>,
    sortable: true,
    sortFn: byNumber((r) => r.remaining),
    className: "w-[1%] text-center tabular-nums",
    render: (r) => (
      <span
        className={cn(
          "font-bold",
          r.remaining != null && r.remaining > 0 && "text-amber-600 dark:text-amber-400",
          r.remaining === 0 && "text-emerald-600 dark:text-emerald-400",
          r.remaining != null && r.remaining < 0 && "text-rose-600 dark:text-rose-400"
        )}
        title={r.remaining != null && r.remaining < 0 ? "Published more than agreed" : undefined}
      >
        {num(r.remaining)}
      </span>
    ),
  },
  {
    key: "activatedAt",
    header: "Activated",
    sortable: true,
    sortFn: (a, b) => (a.activatedAt?.getTime() ?? 0) - (b.activatedAt?.getTime() ?? 0),
    className: "w-[1%] tabular-nums",
    render: (r) => (r.activatedAt ? DATE.format(r.activatedAt) : "—"),
  },
];

/**
 * The headline numbers as `KpiToggle` cards (entity-standard #4) — each card IS its filter:
 * one test picks the rows, and the number is summed over exactly those rows, so a card can
 * never promise more than a click shows. Computed after the plan pill, so both agree too.
 */
type KpiKey = "clients" | "left" | "awaiting" | "published";
const KPIS: Record<
  KpiKey,
  KpiMeta & {
    icon: React.ComponentType<{ className?: string }>;
    test: (r: ClientGuideRow) => boolean;
    sum: (r: ClientGuideRow) => number;
  }
> = {
  clients: {
    label: "clients with an active order",
    tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    icon: Users2,
    test: (r) => r.agreed != null,
    sum: () => 1,
  },
  left: {
    label: "articles left to write",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: FileClock,
    test: (r) => (r.remaining ?? 0) > 0,
    sum: (r) => r.remaining ?? 0,
  },
  awaiting: {
    label: "awaiting client approval",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500",
    icon: Hourglass,
    test: (r) => r.awaitingApproval > 0,
    sum: (r) => r.awaitingApproval,
  },
  published: {
    label: "published this term",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    icon: CheckCircle2,
    test: (r) => (r.delivered ?? 0) > 0,
    sum: (r) => r.delivered ?? 0,
  },
};

/**
 * The plans as `CountTab` pills (entity-standard #1): «All» first, then each plan with its
 * quota in the label and its client count in the counter segment. URL-driven (`?plan=`);
 * clicking the active pill clears it.
 */
export function ClientsGuideTable({
  rows,
  plans,
  title,
}: {
  rows: ClientGuideRow[];
  plans: GuidePlan[];
  /** The page heading — the plan pills sit at its end, on the same line (Khalid, 2026-09-24). */
  title: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("plan");
  const kpi = (params.get("kpi") as KpiKey | null) ?? null;
  const setParam = (key: "plan" | "kpi", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setPlan = (plan: string | null) => setParam("plan", plan);
  const byPlan = active ? rows.filter((r) => r.planName === active) : rows;
  const visible = kpi && KPIS[kpi] ? byPlan.filter(KPIS[kpi].test) : byPlan;

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1">
        {title}
        {plans.length ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5" role="group" aria-label="Plans">
            <CountTab label="All" count={N.format(rows.length)} active={!active} onClick={() => setPlan(null)} />
            {plans.map((p) => (
              <CountTab
                key={p.name}
                label={
                  <>
                    {p.name}
                    {p.articlesPerMonth != null ? (
                      <span className="ms-1.5 opacity-70 tabular-nums" dir="ltr">
                        {p.articlesPerMonth}/mo
                      </span>
                    ) : null}
                  </>
                }
                count={N.format(p.clients)}
                active={active === p.name}
                onClick={() => setPlan(active === p.name ? null : p.name)}
              />
            ))}
          </div>
        ) : null}
      </header>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {(Object.keys(KPIS) as KpiKey[]).map((key) => {
          const k = KPIS[key];
          const hits = byPlan.filter(k.test);
          const value = hits.reduce((s, r) => s + k.sum(r), 0);
          return (
            <KpiToggle
              key={key}
              meta={k}
              icon={k.icon}
              value={N.format(value)}
              active={kpi === key}
              disabled={hits.length === 0}
              onClick={() => setParam("kpi", kpi === key ? null : key)}
            />
          );
        })}
      </div>
      <DataTable
        data={visible}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search clients..."
        pageSize={25}
        emptyText="No clients found"
        rowClassName={(r) => (r.agreed == null ? "text-muted-foreground" : undefined)}
      />
    </div>
  );
}
