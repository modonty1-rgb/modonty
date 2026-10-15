"use client";

import { useState } from "react";
import Link from "next/link";
import { Frown, Meh, Smile } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import type { NpsGroup, NpsRow } from "../helpers/get-nps-responses";

const dayFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" });

const GROUP: Record<NpsGroup, KpiMeta & { icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  promoter: { label: "مروّجون ٩–١٠", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", icon: Smile, badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  passive: { label: "محايدون ٧–٨", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: Meh, badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  detractor: { label: "منتقدون ٠–٦", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: Frown, badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};

const columns: Column<NpsRow>[] = [
  {
    key: "clientName",
    header: "العميل",
    sortable: true,
    render: (r) => (
      <Link href={`/clients/${r.clientId}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
        {r.clientName}
      </Link>
    ),
  },
  {
    key: "score",
    header: "التقييم",
    sortable: true,
    sortFn: (a, b) => a.score - b.score,
    className: "text-center",
    render: (r) => (
      <span className={cn("inline-block min-w-9 rounded-md px-2 py-1 text-sm font-bold tabular-nums", GROUP[r.group].badge)}>
        {r.score}
      </span>
    ),
  },
  {
    key: "comment",
    header: "السبب",
    render: (r) =>
      r.comment ? (
        <span dir="auto" className="block max-w-[520px] whitespace-normal text-sm leading-relaxed">{r.comment}</span>
      ) : (
        <span className="text-sm text-muted-foreground">بلا تعليق</span>
      ),
  },
  {
    key: "createdAt",
    header: "التاريخ",
    sortable: true,
    sortFn: (a, b) => a.createdAt.localeCompare(b.createdAt),
    render: (r) => <span className="whitespace-nowrap text-sm tabular-nums">{dayFmt.format(new Date(r.createdAt))}</span>,
  },
];

/** إجابات الاستبيان — كل إجابة صفّ، والفلاتر بالمجموعة. معلومةٌ للفريق: المنتقد يُتّصل به قبل أن يلغي. */
export function NpsTable({ rows, initial }: { rows: NpsRow[]; initial?: NpsGroup }) {
  const [group, setGroup] = useState<NpsGroup | null>(initial ?? null);
  const visible = group ? rows.filter((r) => r.group === group) : rows;

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(GROUP) as NpsGroup[]).map((g) => {
        const hits = rows.filter((r) => r.group === g).length;
        return <KpiToggle key={g} meta={GROUP[g]} icon={GROUP[g].icon} value={hits} active={group === g} disabled={hits === 0} onClick={() => setGroup(group === g ? null : g)} />;
      })}
    </div>
  );

  return <DataTable data={visible} columns={columns} searchKey="clientName" searchPlaceholder="ابحث باسم العميل…" toolbar={toolbar} pageSize={25} emptyText="لا إجابات هنا" arabic />;
}
