"use client";

import { useState } from "react";
import { Hourglass, TrendingUp, TriangleAlert } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import type { IdeaResult } from "../helpers/get-idea-results";

/** جدول «النتائج» — الفكرة · مقالها · رقمه في قوقل · الحكم بعد ٣٠ يوماً. */
// قبل ٣٠ يوماً قوقل لم يرتّب المقال بعد — الصفر «مبكر» لا «فشل»
const MATURE_DAYS = 30;
const NUM = new Intl.NumberFormat("ar-EG");
const POS = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });
const dayFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });

type Verdict = "early" | "working" | "silent";
const verdictOf = (r: IdeaResult): Verdict =>
  r.daysSince < MATURE_DAYS ? "early" : (r.gsc?.impressions ?? 0) > 0 ? "working" : "silent";

const VERDICT: Record<Verdict, KpiMeta & { icon: React.ComponentType<{ className?: string }>; text: (r: IdeaResult) => string }> = {
  working: {
    label: "نفعت — تظهر في قوقل",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    icon: TrendingUp,
    text: () => "نفعت",
  },
  silent: {
    label: "لم تظهر بعد ٣٠ يوماً",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500",
    icon: TriangleAlert,
    text: () => "لم تظهر",
  },
  early: {
    label: "مبكر — أقل من ٣٠ يوماً",
    tone: "bg-muted text-muted-foreground",
    ring: "ring-border",
    icon: Hourglass,
    text: (r) => `يُحكم بعد ${NUM.format(MATURE_DAYS - r.daysSince)} يوماً`,
  },
};

const columns: Column<IdeaResult>[] = [
  {
    key: "topic",
    header: "الفكرة",
    render: (r) => (
      <span className="flex max-w-[300px] flex-col">
        <span dir="auto" className="font-semibold leading-snug">{r.topic}</span>
        {r.fieldName && <span className="text-xs text-muted-foreground">{r.fieldName}</span>}
      </span>
    ),
  },
  {
    key: "articleTitle",
    header: "المقال",
    render: (r) => (
      <a href={r.articleUrl} target="_blank" rel="noopener noreferrer" dir="auto" className="block max-w-[320px] text-sm text-primary hover:underline">
        {r.articleTitle}
      </a>
    ),
  },
  {
    key: "daysSince",
    header: "منذ النشر",
    sortable: true,
    sortFn: (a, b) => a.daysSince - b.daysSince,
    className: "text-center",
    render: (r) => <span className="whitespace-nowrap text-sm tabular-nums" title={dayFmt.format(new Date(r.writtenAt))}>{NUM.format(r.daysSince)} يوماً</span>,
  },
  {
    key: "gsc",
    header: "الظهور · الضغطات",
    sortable: true,
    sortFn: (a, b) => (a.gsc?.impressions ?? -1) - (b.gsc?.impressions ?? -1),
    className: "text-center",
    render: (r) =>
      r.gsc === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="tabular-nums">
          <span className="font-semibold">{NUM.format(r.gsc.impressions)}</span> · {NUM.format(r.gsc.clicks)}
          {r.gsc.impressions > 0 && <span className="block text-xs text-muted-foreground">المركز {POS.format(r.gsc.position)}</span>}
        </span>
      ),
  },
  {
    key: "verdict",
    header: "الحكم",
    render: (r) => {
      const v = VERDICT[verdictOf(r)];
      return <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", v.tone)}>{v.text(r)}</span>;
    },
  },
];

export function ResultsTable({ items }: { items: IdeaResult[] }) {
  const [kpi, setKpi] = useState<Verdict | null>(null);
  const visible = kpi ? items.filter((r) => verdictOf(r) === kpi) : items;

  const kpiRow = (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(VERDICT) as Verdict[]).map((key) => {
        const hits = items.filter((r) => verdictOf(r) === key).length;
        return <KpiToggle key={key} meta={VERDICT[key]} icon={VERDICT[key].icon} value={hits} active={kpi === key} disabled={hits === 0} onClick={() => setKpi(kpi === key ? null : key)} />;
      })}
    </div>
  );

  return <DataTable data={visible} columns={columns} toolbar={kpiRow} pageSize={25} emptyText="لا نتائج هنا" arabic />;
}
