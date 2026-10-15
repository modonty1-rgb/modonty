"use client";

import { useState } from "react";
import { FileQuestion, MousePointerClick, TrendingUp } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import type { GscKind, GscOpportunity } from "../helpers/get-gsc-opportunities";

/**
 * جدول «فرص قوقل» على وصفة Advanced Table: الصفّ = صفحةٌ يعرضها قوقل وما نعمله بها، والكلمات
 * كلّها خلف «+». معلومةٌ لا قرار — لا أزرار حالة.
 */
const NUM = new Intl.NumberFormat("ar-EG");
const POS = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("ar-EG", { style: "percent", maximumFractionDigits: 1 });

type Action = { label: string; hint: string; tone: string };
const action = (r: GscOpportunity, kind: GscKind): Action =>
  kind === "click"
    ? { label: "عدّل العنوان والوصف", hint: "قوقل يعرضنا في الأعلى والناس لا تضغط — العنوان والوصف لا يقنعان.", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" }
    : r.isArticle
      ? { label: "قوِّ المقال", hint: "نحن في الصفحة الثانية أو الثالثة — مقالٌ أوفى ينقلنا للأولى.", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" }
      : { label: "اكتب مقالاً مخصّصاً", hint: "قوقل يعرض صفحةً ليست مقالاً لهذه الكلمات — لا مقال عندنا يجيب عنها.", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" };

const columns: Column<GscOpportunity>[] = [
  {
    key: "pageLabel",
    header: "الصفحة",
    sortable: true,
    render: (r) => (
      <span className="flex max-w-[420px] flex-col gap-0.5">
        <span dir="auto" className="font-semibold leading-snug" title={r.pageUrl}>{r.pageLabel}</span>
        <span dir="auto" className="truncate text-xs text-muted-foreground">أعلى كلمة: {r.queries[0]?.query}</span>
      </span>
    ),
  },
  {
    key: "kinds",
    header: "ما العمل",
    render: (r) => (
      <span className="flex flex-col items-start gap-1">
        {r.kinds.map((k) => {
          const a = action(r, k);
          return <span key={k} className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", a.tone)} title={a.hint}>{a.label}</span>;
        })}
      </span>
    ),
  },
  {
    key: "impressions",
    header: "مرّات الظهور",
    sortable: true,
    sortFn: (a, b) => a.impressions - b.impressions,
    className: "text-center",
    render: (r) => <span className="font-semibold tabular-nums">{NUM.format(r.impressions)}</span>,
  },
  {
    key: "position",
    header: "المركز",
    sortable: true,
    sortFn: (a, b) => a.position - b.position,
    className: "text-center",
    render: (r) => <span className="tabular-nums">{POS.format(r.position)}</span>,
  },
  {
    key: "clicks",
    header: "الضغطات",
    sortable: true,
    sortFn: (a, b) => a.clicks - b.clicks,
    className: "text-center",
    render: (r) => (
      <span className="tabular-nums">
        {NUM.format(r.clicks)} <span className="text-xs text-muted-foreground">({PCT.format(r.clicks / Math.max(1, r.impressions))})</span>
      </span>
    ),
  },
  {
    key: "queries",
    header: "الكلمات",
    className: "text-center",
    render: (r) => <span className="tabular-nums text-muted-foreground">{NUM.format(r.queries.length)}</span>,
  },
];

function GscDetails({ r }: { r: GscOpportunity }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)]"
      groups={[
        <FactGroup key="queries" title={`الكلمات (${NUM.format(r.queries.length)})`}>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1 text-start font-medium">الكلمة</th>
                <th className="py-1 text-center font-medium">الظهور</th>
                <th className="py-1 text-center font-medium">المركز</th>
                <th className="py-1 text-center font-medium">الضغطات</th>
                <th className="py-1 text-start font-medium">العمل</th>
              </tr>
            </thead>
            <tbody>
              {r.queries.slice(0, 15).map((q) => (
                <tr key={q.query} className="border-t">
                  <td dir="auto" className="py-1">{q.query}</td>
                  <td className="py-1 text-center tabular-nums">{NUM.format(q.impressions)}</td>
                  <td className="py-1 text-center tabular-nums">{POS.format(q.position)}</td>
                  <td className="py-1 text-center tabular-nums">{NUM.format(q.clicks)}</td>
                  <td className="py-1 text-xs text-muted-foreground">{action(r, q.kind).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.queries.length > 15 && <p className="text-xs text-muted-foreground">و{NUM.format(r.queries.length - 15)} كلمة أخرى أقلّ ظهوراً.</p>}
        </FactGroup>,
        <FactGroup key="why" title="ما العمل">
          {r.kinds.map((k) => {
            const a = action(r, k);
            return <Fact key={k} label={a.label} value={<span className="block whitespace-normal text-sm font-normal leading-relaxed text-muted-foreground">{a.hint}</span>} />;
          })}
          <a href={r.pageUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sm text-primary hover:underline">
            افتح الصفحة على مدونتي
          </a>
        </FactGroup>,
      ]}
    />
  );
}

type KpiKey = "near" | "click" | "noArticle";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: GscOpportunity) => boolean }> = {
  near: { label: "قريبة من الصفحة الأولى", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", icon: TrendingUp, test: (r) => r.kinds.includes("near") && r.isArticle },
  noArticle: { label: "بلا مقال يجيب عنها", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: FileQuestion, test: (r) => r.kinds.includes("near") && !r.isArticle },
  click: { label: "نظهر ولا أحد يضغط", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: MousePointerClick, test: (r) => r.kinds.includes("click") },
};

export function GscTable({ items }: { items: GscOpportunity[] }) {
  const [kpi, setKpi] = useState<KpiKey | null>(null);
  const visible = kpi ? items.filter(KPIS[kpi].test) : items;

  const kpiRow = (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(KPIS) as KpiKey[]).map((key) => {
        const k = KPIS[key];
        const hits = items.filter(k.test).length;
        return (
          <KpiToggle key={key} meta={k} icon={k.icon} value={hits} active={kpi === key} disabled={hits === 0} onClick={() => setKpi(kpi === key ? null : key)} />
        );
      })}
    </div>
  );

  return (
    <DataTable
      data={visible}
      columns={columns}
      searchKey="pageLabel"
      searchPlaceholder="ابحث في الصفحات…"
      toolbar={kpiRow}
      pageSize={25}
      emptyText="لا فرص هنا"
      arabic
      renderExpanded={(r) => <GscDetails r={r} />}
      expandLabel={(r) => `كلمات ${r.pageLabel}`}
    />
  );
}
