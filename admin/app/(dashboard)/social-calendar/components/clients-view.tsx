"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";

import { DataTable, type Column } from "@/components/admin/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveSocialCalendar } from "../actions";
import { MONTH_LABELS, parseMonthParam } from "../helpers/dates";
import type { CalendarRow } from "../helpers/queries";
import { ClientAvatar } from "./client-avatar";

type Filter = "all" | "active";
/** null = كل الكتّاب · NO_WRITER = بلا كاتب · غير ذلك اسم الكاتب. */
const NO_WRITER = "__none";

/** أين يفتح الكاليندر: الشهر الحالي إن كان فيه منشور، وإلّا آخر شهر نشط، وإلّا الشهر الحالي (القديم `resolveFirstMonth`). */
function firstMonth(client: CalendarRow, currentMonth: string): string {
  if (client.activeMonths.includes(currentMonth)) return currentMonth;
  return client.activeMonths[client.activeMonths.length - 1] ?? currentMonth;
}

/** «محتاج مراجعة» — يبقى حتى يُحفظ الكاليندر من إعداداته (`update-calendar.ts`). */
function ReviewBadge({ note }: { note: string }) {
  return (
    <span
      title={note}
      className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
    >
      محتاج مراجعة
    </span>
  );
}

function monthLabel(param: string | undefined): string {
  if (!param) return "—";
  const m = parseMonthParam(param);
  return m ? `${MONTH_LABELS[m.month]} ${m.year}` : param;
}

/**
 * الكاليندرات جدولاً — سقط عرض الكروت (خالد ١٢ أكتوبر ٢٠٢٦: الجدول يكفي، وأقلّ كوداً).
 * الصفّ كلّه رابط لكاليندره، و«الكل / لهم منشورات» بعدّاداتها جنب البحث، والأرشفة في آخر الصفّ
 * (خالد ١٢ أكتوبر ٢٠٢٦: «خلّها برّه في الجدول») — تُسترجع من «المؤرشفة» أسفل القسم.
 */
export function ClientsView({
  clients,
  currentMonth,
  canArchive,
}: {
  clients: CalendarRow[];
  currentMonth: string;
  canArchive: boolean;
}) {
  const router = useRouter();
  const [archiveTarget, setArchiveTarget] = useState<CalendarRow | null>(null);
  const [archiving, startArchive] = useTransition();

  function archive() {
    if (!archiveTarget) return;
    startArchive(async () => {
      const res = await archiveSocialCalendar(archiveTarget.id);
      if (!res.success) return void toast({ title: res.error, variant: "destructive" });
      toast({ title: `أُرشف «${archiveTarget.name}» — تسترجعه من «المؤرشفة» أسفل الصفحة`, variant: "success" });
      setArchiveTarget(null);
      router.refresh();
    });
  }
  const [filter, setFilter] = useState<Filter>("all");
  const [writer, setWriter] = useState<string | null>(null);

  const activeCount = useMemo(() => clients.filter((c) => c.totalPosts > 0).length, [clients]);
  // الكتّاب الموجودون فعلاً في القائمة، الأكثر كاليندرات أوّلاً — لا قائمة ثابتة تشيخ.
  const writers = useMemo(() => {
    const count = new Map<string, number>();
    for (const c of clients) count.set(c.writer ?? NO_WRITER, (count.get(c.writer ?? NO_WRITER) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => (a[0] === NO_WRITER ? 1 : b[0] === NO_WRITER ? -1 : b[1] - a[1]));
  }, [clients]);
  const shown = useMemo(
    () =>
      clients.filter(
        (c) => (filter === "all" || c.totalPosts > 0) && (writer === null || (c.writer ?? NO_WRITER) === writer),
      ),
    [clients, filter, writer],
  );

  const columns: Column<CalendarRow>[] = [
    {
      key: "name",
      header: "الاسم",
      sortable: true,
      render: (c) => (
        <span className="flex items-center gap-2">
          <ClientAvatar name={c.name} logoUrl={c.logoUrl} className="h-6 w-6 rounded-md text-[11px]" />
          <span className="font-semibold text-foreground">{c.name}</span>
          {c.reviewNote && <ReviewBadge note={c.reviewNote} />}
        </span>
      ),
    },
    {
      key: "writer",
      header: "الكاتب",
      sortable: true,
      sortFn: (a, b) => (a.writer ?? "").localeCompare(b.writer ?? ""),
      render: (c) => <span className={c.writer ? "text-foreground" : "text-muted-foreground"}>{c.writer ?? "—"}</span>,
    },
    {
      key: "totalPosts",
      header: "منشورات",
      sortable: true,
      className: "text-center",
      render: (c) => <span className="tabular-nums">{c.totalPosts}</span>,
    },
    {
      key: "months",
      header: "شهور",
      sortable: true,
      sortFn: (a, b) => a.activeMonths.length - b.activeMonths.length,
      className: "text-center",
      render: (c) => <span className="tabular-nums">{c.activeMonths.length}</span>,
    },
    {
      key: "lastMonth",
      header: "آخر شهر",
      sortable: true,
      sortFn: (a, b) => (a.activeMonths.at(-1) ?? "").localeCompare(b.activeMonths.at(-1) ?? ""),
      className: "text-center",
      render: (c) => <span className="text-muted-foreground">{monthLabel(c.activeMonths.at(-1))}</span>,
    },
    ...(canArchive
      ? [
          {
            key: "archive",
            sortable: false,
            header: "",
            className: "w-12 text-center",
            render: (c: CalendarRow) => (
              <button
                type="button"
                aria-label={`أرشفة ${c.name}`}
                title="أرشفة"
                onClick={(e) => {
                  e.stopPropagation(); // الصفّ رابط للكاليندر — الزرّ لا يفتحه
                  setArchiveTarget(c);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Archive className="h-4 w-4" />
              </button>
            ),
          } satisfies Column<CalendarRow>,
        ]
      : []),
  ];

  // فلتر الكاتب بجانب البحث (خالد ١٢ أكتوبر ٢٠٢٦: «توجل أقدر أفلتر باسم الكاتب»).
  const writerToggle = (
    <div className="inline-flex flex-wrap overflow-hidden rounded-lg border border-border bg-card">
      {[[null, clients.length] as const, ...writers].map(([w, count]) => (
        <button
          key={w ?? "all"}
          type="button"
          onClick={() => setWriter(w)}
          aria-pressed={writer === w}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            writer === w ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {w === null ? "كل الكتّاب" : w === NO_WRITER ? "بدون كاتب" : w}
          <span
            className={cn(
              "min-w-4 rounded-full px-1 text-center text-[10px] font-bold leading-4 tabular-nums",
              writer === w ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );

  // الفلتر في صفّ البحث لا فوقه (خالد ١٢ أكتوبر ٢٠٢٦: «جنب البحث عشان تستفيد من المساحة»).
  const filterToggle = (
    <div className="inline-flex overflow-hidden rounded-lg border border-border bg-card">
      {(
        [
          { f: "all", label: "الكل", count: clients.length },
          { f: "active", label: "لهم منشورات", count: activeCount },
        ] as const
      ).map(({ f, label, count }) => (
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          aria-pressed={filter === f}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
          <span
            className={cn(
              "min-w-4 rounded-full px-1 text-center text-[10px] font-bold leading-4 tabular-nums",
              filter === f ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <DataTable
        arabic
        data={shown}
        columns={columns}
        pageSize={20}
      searchKey="name"
        searchPlaceholder="ابحث بالاسم..."
        emptyText="لا توجد نتائج"
        toolbar={
          <>
            {writerToggle}
            {filterToggle}
          </>
        }
        onRowClick={(c) => router.push(`/social-calendar/${c.id}/${firstMonth(c, currentMonth)}`)}
      />

      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>أرشفة «{archiveTarget?.name}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              يختفي الكاليندر من هنا ومنشوراته باقية — تسترجعه متى شئت من «المؤرشفة» أسفل الصفحة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={archiving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiving}
              onClick={(e) => {
                e.preventDefault();
                archive();
              }}
            >
              {archiving ? "جاري الأرشفة..." : "أرشفة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
