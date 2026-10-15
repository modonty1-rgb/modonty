"use client";

import { useState } from "react";
import { CircleCheck, Clock, FileQuestion, MessageCircleQuestion, MessagesSquare, Share2 } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { cn } from "@/lib/utils";
import type { ReaderQuestion, ReaderQuestionSource } from "../helpers/get-reader-questions";

/** جدول «مودو» و«أسئلة القرّاء» — صفٌّ لكل سؤال بعدد مرّاته ومكانه. معلومةٌ لا قرار. */
const NUM = new Intl.NumberFormat("ar-EG");
const dayFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });

const SOURCE: Record<ReaderQuestionSource, KpiMeta & { icon: React.ComponentType<{ className?: string }>; hint: string }> = {
  chat_unanswered: {
    label: "مودو لم يجب",
    hint: "سأله القارئ للمساعد ولا مقال عندنا يجيب — مقالٌ مفقود بلسان القارئ.",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500",
    icon: MessageCircleQuestion,
  },
  chat_redirect: {
    label: "مودو حوّل",
    hint: "المساعد أحاله لمكانٍ آخر — مقالٌ يجيب عنه يبقي القارئ عندنا.",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: Share2,
  },
  chat_faq: {
    label: "من محادثة",
    hint: "سؤالٌ حوّله مودو من محادثة إلى سؤالٍ تحت مقال.",
    tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500",
    icon: MessagesSquare,
  },
  article: {
    label: "تحت مقال",
    hint: "سؤالٌ كتبه قارئ تحت مقال لصاحبه — إن تكرّر فهو يستحق مقالاً مستقلاً.",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500",
    icon: FileQuestion,
  },
};

const columns: Column<ReaderQuestion>[] = [
  {
    key: "question",
    header: "السؤال",
    sortable: true,
    render: (r) => <span dir="auto" className="block max-w-[520px] whitespace-normal font-semibold leading-snug">{r.question}</span>,
  },
  {
    key: "source",
    header: "من أين",
    render: (r) => (
      <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", SOURCE[r.source].tone)} title={SOURCE[r.source].hint}>
        {SOURCE[r.source].label}
      </span>
    ),
  },
  {
    key: "answered",
    header: "صاحب المقال",
    render: (r) =>
      r.answered === null ? (
        <span className="text-muted-foreground">—</span>
      ) : r.answered ? (
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-emerald-700 dark:text-emerald-300"><CircleCheck className="h-3.5 w-3.5" />أجاب</span>
      ) : (
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-amber-700 dark:text-amber-300"><Clock className="h-3.5 w-3.5" />لم يُجب بعد</span>
      ),
  },
  {
    key: "context",
    header: "أين سُئل",
    render: (r) => <span dir="auto" className="block max-w-[260px] truncate text-sm text-muted-foreground" title={r.context ?? undefined}>{r.context ?? "—"}</span>,
  },
  {
    key: "count",
    header: "كم مرّة",
    sortable: true,
    sortFn: (a, b) => a.count - b.count,
    className: "text-center",
    render: (r) => <span className={cn("tabular-nums", r.count > 1 && "font-bold")}>{NUM.format(r.count)}</span>,
  },
  {
    key: "lastAskedAt",
    header: "آخر مرّة",
    sortable: true,
    sortFn: (a, b) => a.lastAskedAt.localeCompare(b.lastAskedAt),
    className: "text-center",
    render: (r) => <span className="whitespace-nowrap text-sm tabular-nums">{dayFmt.format(new Date(r.lastAskedAt))}</span>,
  },
];

/** `sources`: مصادر هذا التبويب وحدها — «مودو» ثلاثة، و«أسئلة القرّاء» واحد. */
export function ReaderQuestionsTable({ items, sources }: { items: ReaderQuestion[]; sources: ReaderQuestionSource[] }) {
  const showAnswered = sources.includes("article");
  const [kpi, setKpi] = useState<ReaderQuestionSource | null>(null);
  const visible = kpi ? items.filter((r) => r.source === kpi) : items;

  const kpiRow = (
    <div className="flex flex-wrap items-center gap-2">
      {sources.map((key) => {
        const hits = items.filter((r) => r.source === key).length;
        return (
          <KpiToggle key={key} meta={SOURCE[key]} icon={SOURCE[key].icon} value={hits} active={kpi === key} disabled={hits === 0} onClick={() => setKpi(kpi === key ? null : key)} />
        );
      })}
    </div>
  );

  return (
    <DataTable
      data={visible}
      columns={showAnswered ? columns : columns.filter((c) => c.key !== "answered")}
      searchKey="question"
      searchPlaceholder="ابحث في الأسئلة…"
      toolbar={kpiRow}
      pageSize={25}
      emptyText="لا أسئلة هنا"
      arabic
    />
  );
}
