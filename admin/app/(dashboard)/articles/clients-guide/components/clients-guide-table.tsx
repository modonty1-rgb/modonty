"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CheckCircle2, FileClock, Hourglass, Users2 } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import type { ClientGuideRow, GuidePlan, GuideWriter } from "../helpers/get-clients-guide";

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
 * The main row answers «who, by whom, on what, how far» — the detail under «+» carries the rest
 * of the quota (Khalid, 27 Sep 2026: «السطر الرئيسي المعلومات الأساسية… الزايد يديني تفاصيل
 * أكثر… مثل الطلبات»). Months, agreed, awaiting and dates moved down there.
 *
 * The shared `DataTable` (entity-standard #3: one density, search, sort, pagination) — English,
 * like every table in the admin (Khalid, 2026-09-24).
 */
const columns: Column<ClientGuideRow>[] = [
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (r) => (
      <span className="flex items-center gap-2">
        <Link
          href={`/clients/${r.id}/edit`}
          title={r.name}
          onClick={(e) => e.stopPropagation()}
          className="block max-w-[260px] truncate hover:text-primary hover:underline"
        >
          {r.name}
        </Link>
        {/* The one status that needs someone today stays visible without opening the row. */}
        {r.awaitingApproval > 0 ? (
          <span
            className="whitespace-nowrap rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold leading-4 text-sky-700 ring-1 ring-sky-500/30 dark:text-sky-300"
            title="In the client's console, not approved yet"
          >
            {N.format(r.awaitingApproval)} awaiting
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "writerName",
    header: "Writer",
    sortable: true,
    render: (r) => (r.writerName ? <span dir="auto">{r.writerName}</span> : <span className="text-muted-foreground">No writer</span>),
  },
  {
    key: "planName",
    header: "Plan",
    sortable: true,
    render: (r) => r.planName ?? <span className="text-muted-foreground">No active order</span>,
  },
  {
    key: "delivered",
    header: <span title="Published since service start, of the agreed total">Published</span>,
    sortable: true,
    sortFn: byNumber((r) => r.delivered),
    className: "w-[1%] tabular-nums",
    render: (r) =>
      r.agreed != null && r.delivered != null ? (
        <span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{N.format(r.delivered)}</span>
          <span className="text-muted-foreground"> / {N.format(r.agreed)}</span>
        </span>
      ) : (
        "—"
      ),
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
];

/**
 * The colour of each meaning — the SAME as the four cards above (Khalid, 27 Sep 2026: «العب
 * بالألوان… تمييز»): emerald published · sky awaiting the client · amber left to write.
 * Plan figures and dates stay neutral, so the colour only ever marks progress.
 */
const TONE = {
  published: "text-emerald-600 dark:text-emerald-400",
  awaiting: "text-sky-600 dark:text-sky-400",
  left: "text-amber-600 dark:text-amber-400",
} as const;

/**
 * The article pipeline, in the order an article travels — each stage with ONE colour used for
 * its number and its piece of the bar. Published/with-client/left keep the colours of the cards
 * above; the new stages take their own. Plain words, not the enum names (Khalid, 27 Sep 2026).
 */
const STAGES = [
  { key: "published", label: "Published", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { key: "scheduled", label: "Scheduled", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
  { key: "approved", label: "Approved", text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500" },
  { key: "withClient", label: "Waiting for approval", text: "text-sky-600 dark:text-sky-400", bar: "bg-sky-500" },
  { key: "changes", label: "Needs changes", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" },
  { key: "draft", label: "Draft", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
  { key: "writing", label: "Writing", text: "text-slate-600 dark:text-slate-300", bar: "bg-slate-400" },
  { key: "notStarted", label: "Not started", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500/25" },
] as const;

/** Everything else about the client's quota — under the row's «+». */
function QuotaDetails({ r }: { r: ClientGuideRow }) {
  if (!r.planName || r.agreed == null) {
    return <p className="ms-8 text-xs text-muted-foreground">No active order — no quota to count yet.</p>;
  }
  const done = r.delivered ?? 0;
  const p = r.pipeline;
  const inWork = p.scheduled + p.approved + p.withClient + p.changes + p.draft + p.writing;
  const left = Math.max(0, r.agreed - done);
  const counts: Record<(typeof STAGES)[number]["key"], number> = {
    published: done,
    ...p,
    // What is owed and not yet on anyone's desk — «left» minus what is already in the pipeline.
    notStarted: Math.max(0, left - inWork),
  };
  const total = Math.max(r.agreed, done + inWork);
  const share = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const pctDone = r.agreed > 0 ? Math.min(100, Math.round((done / r.agreed) * 100)) : 0;
  return (
    <DetailCard
      columns="lg:grid-cols-[auto_1px_minmax(0,1fr)_1px_auto]"
      groups={[
        <FactGroup key="plan" title="Plan">
          <Fact label="Per month" value={r.articlesPerMonth != null ? N.format(r.articlesPerMonth) : "—"} />
          <Fact
            label="Months"
            value={
              <>
                {N.format(r.serviceMonths)}
                {r.bonusMonths ? (
                  <span className="ms-1 text-xs font-normal text-muted-foreground">
                    ({N.format(r.paidMonths)} paid + {N.format(r.bonusMonths)} free)
                  </span>
                ) : null}
              </>
            }
          />
          <Fact label="Total" value={N.format(r.agreed)} hint="Per month × months" />
        </FactGroup>,
        <FactGroup key="progress" title="Progress" spread>
          {STAGES.map((st) => (
            <Fact
              key={st.key}
              label={st.label}
              value={N.format(counts[st.key])}
              tone={counts[st.key] > 0 ? st.text : "text-muted-foreground/60"}
              // The dot is the stage's colour in the bar below — ties the number to its piece.
              dot={st.key === "notStarted" ? "bg-amber-500/60" : st.bar}
            />
          ))}
        </FactGroup>,
        <FactGroup key="dates" title="Dates">
          <Fact label="Activated" value={r.activatedAt ? DATE.format(r.activatedAt) : "—"} />
          <Fact label="Started" value={r.serviceStartedAt ? DATE.format(r.serviceStartedAt) : <span className="text-muted-foreground">Not yet</span>} />
          <Fact
            label="First published"
            value={r.firstPublishedAt ? DATE.format(r.firstPublishedAt) : <span className="text-muted-foreground">Not yet</span>}
          />
        </FactGroup>,
      ]}
      footer={
        // One bar, every stage in its colour, in the order an article moves.
        <div className="flex items-center gap-3">
          <div
            className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={STAGES.map((st) => `${st.label} ${counts[st.key]}`).join(", ")}
          >
            {STAGES.map((st) =>
              counts[st.key] > 0 ? <div key={st.key} className={cn("h-full", st.bar)} style={{ width: `${share(counts[st.key])}%` }} /> : null,
            )}
          </div>
          <span className={cn("whitespace-nowrap text-xs font-semibold tabular-nums", TONE.published)}>{pctDone}% published</span>
        </div>
      }
    />
  );
}

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
    // Arabic by Khalid's call (27 Sep 2026) — the team reads these four at a glance.
    label: "عميل بطلب ساري",
    tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    icon: Users2,
    test: (r) => r.agreed != null,
    sum: () => 1,
  },
  left: {
    label: "مقال باقي للكتابة",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: FileClock,
    test: (r) => (r.remaining ?? 0) > 0,
    sum: (r) => r.remaining ?? 0,
  },
  awaiting: {
    label: "بانتظار موافقة العميل",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500",
    icon: Hourglass,
    test: (r) => r.awaitingApproval > 0,
    sum: (r) => r.awaitingApproval,
  },
  published: {
    label: "منشور في هذه الفترة",
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
  writers,
  title,
}: {
  rows: ClientGuideRow[];
  plans: GuidePlan[];
  writers: GuideWriter[];
  /** The page heading — the plan pills sit at its end, on the same line (Khalid, 2026-09-24). */
  title: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("plan");
  const kpi = (params.get("kpi") as KpiKey | null) ?? null;
  const writer = params.get("writer");
  const setParam = (key: "plan" | "kpi" | "writer", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setPlan = (plan: string | null) => setParam("plan", plan);
  // Writer first, then plan: each row of pills counts within the one above it.
  const byWriter = writer ? rows.filter((r) => (writer === "none" ? r.writerId === null : r.writerId === writer)) : rows;
  const byPlan = active ? byWriter.filter((r) => r.planName === active) : byWriter;
  const visible = kpi && KPIS[kpi] ? byPlan.filter(KPIS[kpi].test) : byPlan;

  return (
    <div className="space-y-3">
      {/*
        Broad to narrow, top to bottom (Khalid, 27 Sep 2026: «رتب المنطقة اللي فوق الجدول»):
        the heading, then WHO writes (writer), then WHAT they sold (plan), then the status cards
        that sum what those two left — each row counts inside the one above it.
      */}
      <header>{title}</header>
      {/*
        Two panels (Khalid, 27 Sep 2026: «قسمين… الرايتر والبلان… والأربع مربعات كبيرة»):
        what you choose on the left, what it adds up to on the right. Stacks on narrow screens.
      */}
      {/* Filters take exactly their pills' width (no empty tail); the four cards share the rest. */}
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
        <section aria-label="Filters" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          {writers.length ? (
            <FilterRow label="Writer">
              <CountTab label="All" count={N.format(rows.length)} active={!writer} onClick={() => setParam("writer", null)} />
              {writers.map((w) => (
                <CountTab
                  key={w.id}
                  label={<span dir="auto">{w.name}</span>}
                  count={N.format(w.clients)}
                  active={writer === w.id}
                  onClick={() => setParam("writer", writer === w.id ? null : w.id)}
                />
              ))}
            </FilterRow>
          ) : null}
          {plans.length ? (
            <FilterRow label="Plan">
              <CountTab label="All" count={N.format(byWriter.length)} active={!active} onClick={() => setPlan(null)} />
              {plans.map((p) => {
                const n = writer ? byWriter.filter((r) => r.planName === p.name).length : p.clients;
                return (
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
                    count={N.format(n)}
                    active={active === p.name}
                    // A plan none of this writer's clients is on stays visible (the zero says so)
                    // but cannot be picked into an empty table.
                    disabled={n === 0 && active !== p.name}
                    onClick={() => setPlan(active === p.name ? null : p.name)}
                  />
                );
              })}
            </FilterRow>
          ) : null}
        </section>
        <section aria-label="Totals">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(KPIS) as KpiKey[]).map((key) => {
              const k = KPIS[key];
              const hits = byPlan.filter(k.test);
              const value = hits.reduce((s, r) => s + k.sum(r), 0);
              return (
                <KpiToggle
                  variant="tile"
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
        </section>
      </div>
      <DataTable
        data={visible}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search clients..."
        pageSize={25}
        emptyText="No clients found"
        rowClassName={(r) => (r.agreed == null ? "text-muted-foreground" : undefined)}
        renderExpanded={(r) => <QuotaDetails r={r} />}
        expandLabel={(r) => `Quota details of ${r.name.trim()}`}
      />
    </div>
  );
}
