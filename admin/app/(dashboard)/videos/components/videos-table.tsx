"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, Clock, Send } from "lucide-react";
import type { VideoJobStatus } from "@prisma/client";

import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { FilterRow } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { JOB_STATUS_BADGE, JOB_STATUS_LABEL } from "../helpers/video-labels";

export type VideoRow = {
  id: string;
  title: string;
  client: string;
  status: VideoJobStatus;
  revision: number;
  updatedAt: string;
  shorts: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  failed: number;
  total: number;
  lastError: string | null;
  searchText: string;
};

const N = new Intl.NumberFormat("ar-EG");
const STATUSES: VideoJobStatus[] = ["READY_FOR_REVIEW", "NEEDS_ATTENTION", "DONE"];
type Tile = "pending" | "approved" | "attention" | "done";
const TILE: Record<Tile, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: VideoRow) => boolean }> = {
  pending: { label: "فيها بنود تنتظر قرارك", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: Clock, test: (r) => r.pending > 0 },
  approved: { label: "معتمد ينتظر النشر", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: Send, test: (r) => r.approved > 0 },
  attention: { label: "يحتاج تدخل", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: CircleAlert, test: (r) => r.status === "NEEDS_ATTENTION" },
  done: { label: "خلصت", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", icon: CircleCheck, test: (r) => r.status === "DONE" },
};
const age = (iso: string) => {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  return h < 1 ? "الحين" : h < 24 ? `قبل ${N.format(h)} ساعة` : `قبل ${N.format(Math.round(h / 24))} يوم`;
};

/** **الفيديوهات — Advanced Table**: صف لكل مقالة، والضغط يفتح صفحة القرار. فوق: الحالة يساراً، وما يحتاج يدك يميناً. */
export function VideosTable({ rows }: { rows: VideoRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<VideoJobStatus | null>(null);
  const [tile, setTile] = useState<Tile | null>(null);
  const byStatus = status ? rows.filter((r) => r.status === status) : rows;
  const visible = tile ? byStatus.filter(TILE[tile].test) : byStatus;

  const columns: Column<VideoRow>[] = [
    {
      key: "title",
      header: "المقالة",
      sortable: true,
      render: (r) => (
        <Link href={`/videos/${r.id}`} className="block min-w-0 max-w-[22rem]" onClick={(e) => e.stopPropagation()}>
          <span className="line-clamp-1 font-medium hover:underline" dir="auto">{r.title}</span>
          <span className="text-xs text-muted-foreground" dir="auto">{r.client}</span>
        </Link>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (r) => (
        <span className="flex flex-col items-start gap-1">
          <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", JOB_STATUS_BADGE[r.status])}>{JOB_STATUS_LABEL[r.status]}</span>
          {r.lastError ? <span className="line-clamp-1 max-w-[14rem] text-[11px] text-rose-700 dark:text-rose-300" title={r.lastError}>{r.lastError}</span> : null}
        </span>
      ),
    },
    {
      key: "items",
      header: "البنود",
      render: (r) => (
        <span className="flex flex-wrap gap-1 text-xs">
          {r.pending ? <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-700 dark:text-amber-300">{N.format(r.pending)} تنتظر</span> : null}
          {r.approved ? <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-700 dark:text-sky-300">{N.format(r.approved)} معتمد</span> : null}
          {r.published ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">{N.format(r.published)} منشور</span> : null}
          {r.rejected ? <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-rose-700 dark:text-rose-300">{N.format(r.rejected)} مرفوض</span> : null}
          {r.failed ? <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300">{N.format(r.failed)} فشل</span> : null}
          {r.total === 0 ? <span className="text-muted-foreground">لسه ما وصلت ملفات</span> : null}
        </span>
      ),
    },
    {
      key: "revision",
      header: "النسخة",
      className: "text-center",
      render: (r) => <span className="tabular-nums text-muted-foreground">{N.format(r.revision)}</span>,
    },
    {
      key: "updatedAt",
      header: "آخر تحديث",
      sortable: true,
      sortFn: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{age(r.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
        <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="الحالة">
            <CountTab label="الكل" count={N.format(rows.length)} active={!status} onClick={() => setStatus(null)} />
            {STATUSES.map((s) => {
              const c = rows.filter((r) => r.status === s).length;
              return <CountTab key={s} label={JOB_STATUS_LABEL[s]} count={N.format(c)} active={status === s} disabled={c === 0 && status !== s} onClick={() => setStatus(status === s ? null : s)} />;
            })}
          </FilterRow>
        </section>
        <section aria-label="يحتاج يدك">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(TILE) as Tile[]).map((t) => {
              const hits = byStatus.filter(TILE[t].test).length;
              return <KpiToggle key={t} variant="tile" meta={TILE[t]} icon={TILE[t].icon} value={N.format(hits)} active={tile === t} disabled={hits === 0 && tile !== t} onClick={() => setTile(tile === t ? null : t)} />;
            })}
          </div>
        </section>
      </div>
      <DataTable
        data={visible}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="ابحث بعنوان المقالة أو العميل…"
        pageSize={25}
        onRowClick={(r) => router.push(`/videos/${r.id}`)}
        emptyText={rows.length === 0 ? "لسه ما وصل أي فيديو من المصنع." : "ما فيه فيديوهات بهذا الفلتر."}
        arabic
      />
    </div>
  );
}
