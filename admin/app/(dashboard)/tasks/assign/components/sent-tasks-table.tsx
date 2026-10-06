"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AlarmClock, CheckCircle2, ClipboardCheck, ListTodo, Minus, Plus } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { TASK_PRIORITY_META, TASK_STATUSES, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";
import { cn } from "@/lib/utils";

import { EditSentTask } from "./edit-sent-task";

export interface SentTaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusKey;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  dueDate: Date | null;
  createdAt: Date;
  completedAt: Date | null;
  /** محسوبةٌ على الخادم — كي لا يختلف «الآن» بين الرسم الأوّل والمتصفّح. */
  late: boolean;
  assignee: { id: string; name: string | null; image: string | null } | null;
  assigneeName: string;
}

const N = new Intl.NumberFormat("ar-EG");
const DATE = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });
const PRIORITY_WEIGHT = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 } as const;

/** المتأخّرُ أحمر في كلّ مكان: البطاقة والشارة والموعد — لونٌ واحد لمعنى واحد. */
const LATE = "text-red-600 dark:text-red-400";

/** شارةُ الشيء الوحيد الذي يحتاج أحداً اليوم — تُرى بلا فتح شيء. */
function TaskFlag({ t }: { t: SentTaskRow }) {
  if (t.late) {
    return (
      <span className="whitespace-nowrap rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold leading-4 text-red-700 ring-1 ring-red-500/30 dark:text-red-300">
        متأخّرة
      </span>
    );
  }
  if (t.status === "REVIEW") {
    return (
      <Link
        href="/tasks/reviews"
        onClick={(e) => e.stopPropagation()}
        className="whitespace-nowrap rounded-full bg-amber-500/15 px-1.5 text-[10px] font-semibold leading-4 text-amber-700 ring-1 ring-amber-500/30 hover:underline dark:text-amber-300"
      >
        اعتمدها ←
      </Link>
    );
  }
  return null;
}

const TASK_GRID = "grid grid-cols-[2rem_minmax(0,1fr)_7rem_5rem_7rem] items-center gap-2";

/**
 * مهامُّ زميلٍ واحد تحت «+» سطرِه (خالد ٣ أكتوبر ٢٠٢٦: «يجيني طارق… لمّا أفتحه أشوف المهام اللي عنده،
 * ومن عنده أفتح تفصيلة ثانية لكل مهمّة»). كلُّ مهمّةٍ سطرٌ بـ«+» خاصّ يفتح نصَّها وتواريخها — واحدةٌ
 * مفتوحة في كلّ مرّة، كالجدول الأمّ.
 */
function PersonTasks({ tasks }: { tasks: SentTaskRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="ms-8 overflow-hidden rounded-md border bg-card shadow-sm">
      <div className={cn(TASK_GRID, "border-b bg-muted/50 px-2 py-1.5 text-[11px] font-bold text-muted-foreground")}>
        <span />
        <span>المهمّة</span>
        <span>الحالة</span>
        <span>الأولويّة</span>
        <span>الموعد</span>
      </div>
      {tasks.map((t) => {
        const open = openId === t.id;
        return (
          <div key={t.id} className={cn("border-b last:border-0", t.late && "bg-red-500/5")}>
            <div
              className={cn(TASK_GRID, "cursor-pointer px-2 py-1.5 text-[13px] hover:bg-muted/40", t.status === "DONE" && "text-muted-foreground")}
              onClick={() => setOpenId(open ? null : t.id)}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-label={`تفاصيل: ${t.title}`}
                className="flex size-6 items-center justify-center rounded border text-muted-foreground hover:bg-muted"
              >
                {open ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
              </button>
              <span className="flex min-w-0 items-start gap-2">
                <EditSentTask task={{ ...t, position: 0, assignedBy: null }} />
                <TaskFlag t={t} />
              </span>
              <span>
                <span className={cn("whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold", TASK_STATUS_META[t.status].tone)}>
                  {TASK_STATUS_META[t.status].labelAr}
                </span>
              </span>
              <span>
                <span className={cn("whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold", TASK_PRIORITY_META[t.priority].tone)}>
                  {TASK_PRIORITY_META[t.priority].labelAr}
                </span>
              </span>
              <span className="whitespace-nowrap tabular-nums">
                {t.dueDate ? (
                  <span className={t.late ? cn("font-bold", LATE) : "text-muted-foreground"}>{DATE.format(t.dueDate)}</span>
                ) : t.status === "DONE" ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">ما حدّد موعد</span>
                )}
              </span>
            </div>
            {open ? (
              <div className="px-2 pb-2">
                <TaskDetails t={t} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface PersonRow {
  id: string;
  name: string;
  tasks: SentTaskRow[];
  open: number;
  inProgress: number;
  review: number;
  late: number;
  done: number;
}

/** لونٌ لكلّ حالة — نفسُ نقطة فلتر «الحالة» ونفسُ شارة السطر، فالشريطُ يُقرأ بلا شرح. */
const STAGES = [
  { key: "done", label: "منجَزة", bar: "bg-emerald-500" },
  { key: "review", label: "بانتظار الاعتماد", bar: "bg-amber-500" },
  { key: "inProgress", label: "قيد التنفيذ", bar: "bg-blue-500" },
  { key: "todo", label: "لم تبدأ", bar: "bg-slate-400" },
] as const;

const countCell = (n: number, tone: string) => <span className={n ? cn("font-bold", tone) : "text-muted-foreground/60"}>{N.format(n)}</span>;

/** السطرُ الرئيسيّ = الزميل: كم عنده، وأين وصل، وكم تأخّر. */
const personColumns: Column<PersonRow>[] = [
  {
    key: "name",
    header: "الزميل",
    sortable: true,
    render: (p) => (
      <span className="flex items-center gap-2">
        <bdi className="font-semibold">{p.name}</bdi>
        {p.late > 0 ? (
          <span className="whitespace-nowrap rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold leading-4 text-red-700 ring-1 ring-red-500/30 dark:text-red-300">
            {N.format(p.late)} متأخّرة
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "total",
    header: "المهام",
    sortable: true,
    sortFn: (a, b) => a.tasks.length - b.tasks.length,
    className: "w-[1%] text-center tabular-nums",
    render: (p) => <span className="font-bold">{N.format(p.tasks.length)}</span>,
  },
  {
    key: "open",
    header: "مفتوحة",
    sortable: true,
    sortFn: (a, b) => a.open - b.open,
    className: "w-[1%] text-center tabular-nums",
    render: (p) => countCell(p.open, "text-blue-600 dark:text-blue-400"),
  },
  {
    key: "review",
    header: "بانتظار اعتمادك",
    sortable: true,
    sortFn: (a, b) => a.review - b.review,
    className: "w-[1%] whitespace-nowrap text-center tabular-nums",
    render: (p) => countCell(p.review, "text-amber-600 dark:text-amber-400"),
  },
  {
    key: "done",
    header: "منجَزة",
    sortable: true,
    sortFn: (a, b) => a.done - b.done,
    className: "w-[1%] text-center tabular-nums",
    render: (p) => countCell(p.done, "text-emerald-600 dark:text-emerald-400"),
  },
  {
    key: "progress",
    header: "التقدّم",
    sortable: true,
    sortFn: (a, b) => a.done / a.tasks.length - b.done / b.tasks.length,
    className: "w-[28%]",
    render: (p) => {
      const counts = { done: p.done, review: p.review, inProgress: p.inProgress, todo: p.tasks.length - p.done - p.review - p.inProgress };
      const pct = Math.round((p.done / p.tasks.length) * 100);
      return (
        <span className="flex items-center gap-2">
          <span
            className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label={STAGES.map((st) => `${st.label} ${counts[st.key]}`).join("، ")}
          >
            {STAGES.map((st) =>
              counts[st.key] > 0 ? (
                <span key={st.key} className={cn("h-full", st.bar)} style={{ width: `${(counts[st.key] / p.tasks.length) * 100}%` }} />
              ) : null,
            )}
          </span>
          <span className="w-9 text-end text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{N.format(pct)}٪</span>
        </span>
      );
    },
  },
];

/** تحت «+»: نصُّ المهمّة كما كُتب، وتواريخُها. */
function TaskDetails({ t }: { t: SentTaskRow }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,1fr)_1px_auto]"
      groups={[
        <div key="details" className="min-w-0 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground/80">التفاصيل</p>
          {t.description ? (
            <p dir="auto" className="whitespace-pre-line text-sm leading-relaxed">
              {t.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">بلا تفاصيل — اضغط العنوان لإضافتها.</p>
          )}
        </div>,
        <FactGroup key="dates" title="التواريخ">
          <Fact label="أُسندت" value={DATE.format(t.createdAt)} />
          <Fact
            label="الموعد"
            value={t.dueDate ? DATE.format(t.dueDate) : <span className="text-muted-foreground">ما حدّد</span>}
            tone={t.late ? LATE : undefined}
          />
          <Fact
            label="أُنجزت"
            value={t.completedAt ? DATE.format(t.completedAt) : <span className="text-muted-foreground">لسّا</span>}
            tone={t.completedAt ? "text-emerald-600 dark:text-emerald-400" : undefined}
          />
        </FactGroup>,
      ]}
    />
  );
}

/** البطاقةُ هي الفلتر: اختبارٌ واحد يعدّ الرقمَ ويختار الأسطر، فلا تَعِد بطاقةٌ بأكثر ممّا تُظهر. */
type KpiKey = "open" | "late" | "review" | "done";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (t: SentTaskRow) => boolean }> = {
  open: {
    label: "مفتوحة",
    tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    icon: ListTodo,
    test: (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  },
  late: {
    label: "متأخّرة",
    tone: "bg-red-500/15 text-red-600 dark:text-red-400",
    ring: "ring-red-500",
    icon: AlarmClock,
    test: (t) => t.late,
  },
  review: {
    label: "بانتظار اعتمادك",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: ClipboardCheck,
    test: (t) => t.status === "REVIEW",
  },
  done: {
    label: "منجَزة",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    icon: CheckCircle2,
    test: (t) => t.status === "DONE",
  },
};

export function SentTasksTable({ rows }: { rows: SentTaskRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") as TaskStatusKey | null;
  const kpi = (params.get("kpi") as KpiKey | null) ?? null;
  const setParam = (key: "status" | "kpi", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // الحالةُ ثم البطاقة تختاران المهامّ، والزملاءُ يُبنَون ممّا بقي — فالأرقامُ تطابق ما يُفتح.
  const byStatus = status ? rows.filter((r) => r.status === status) : rows;
  const visible = kpi && KPIS[kpi] ? byStatus.filter(KPIS[kpi].test) : byStatus;

  const groups = new Map<string, PersonRow>();
  for (const t of visible) {
    const id = t.assignee?.id ?? "none";
    const g = groups.get(id) ?? { id, name: t.assigneeName, tasks: [], open: 0, inProgress: 0, review: 0, late: 0, done: 0 };
    g.tasks.push(t);
    if (t.status === "TODO" || t.status === "IN_PROGRESS") g.open += 1;
    if (t.status === "IN_PROGRESS") g.inProgress += 1;
    if (t.status === "REVIEW") g.review += 1;
    if (t.status === "DONE") g.done += 1;
    if (t.late) g.late += 1;
    groups.set(id, g);
  }
  // مَن تأخّر أوّلاً، ثم الأثقلُ حِملاً — مَن يحتاج متابعةً اليوم في الأعلى.
  const people = [...groups.values()].sort((a, b) => b.late - a.late || b.open - a.open || b.tasks.length - a.tasks.length);
  // داخل الزميل: المتأخّرُ ثم بانتظار الاعتماد ثم الباقي بالأولويّة، والمنجَزُ آخراً.
  const rank = (t: SentTaskRow) => (t.late ? 0 : t.status === "REVIEW" ? 1 : t.status === "DONE" ? 3 : 2);
  for (const p of people) p.tasks.sort((a, b) => rank(a) - rank(b) || PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="الحالة">
            <CountTab label="الكل" count={N.format(rows.length)} active={!status} onClick={() => setParam("status", null)} />
            {TASK_STATUSES.map((s) => {
              const n = rows.filter((r) => r.status === s).length;
              return (
                <CountTab
                  key={s}
                  label={
                    <span className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", TASK_STATUS_META[s].dot)} aria-hidden />
                      {TASK_STATUS_META[s].labelAr}
                    </span>
                  }
                  count={N.format(n)}
                  active={status === s}
                  disabled={n === 0 && status !== s}
                  onClick={() => setParam("status", status === s ? null : s)}
                />
              );
            })}
          </FilterRow>
        </section>
        <section aria-label="الأرقام">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(KPIS) as KpiKey[]).map((key) => {
              const k = KPIS[key];
              const n = byStatus.filter(k.test).length;
              return (
                <KpiToggle
                  variant="tile"
                  key={key}
                  meta={k}
                  icon={k.icon}
                  value={N.format(n)}
                  active={kpi === key}
                  disabled={n === 0}
                  onClick={() => setParam("kpi", kpi === key ? null : key)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <DataTable
        arabic
        data={people}
        columns={personColumns}
        // بلا بحث: الفريقُ عشرةٌ يُرَون في نظرة (خالد ٣ أكتوبر ٢٠٢٦: «ماله داعي»).
        pageSize={25}
        emptyText="لا مهامّ هنا"
        renderExpanded={(p) => <PersonTasks tasks={p.tasks} />}
        expandLabel={(p) => `مهامّ ${p.name}`}
      />
    </div>
  );
}
