"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/tasks/task-config";
import { cn } from "@/lib/utils";
import type { PersonWeek, WeekTask } from "../helpers/get-weekly-report";

const dueFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });

/** المتأخّرُ أوّلاً، ثم ما عند المنفّذ، ثم ما ينتظر الاعتماد، والمنجَزُ آخراً. */
const rank = (t: WeekTask) => (t.late ? 0 : t.status === "TODO" || t.status === "IN_PROGRESS" ? 1 : t.status === "REVIEW" ? 2 : 3);

/**
 * مهامُّ الشخص تحت سطره — بدل قسمٍ ثانٍ تحت الجدول يعيد نفس الأسماء (خالد ٣ أكتوبر ٢٠٢٦).
 * كلُّ مهمّةٍ سطر: الحالة · العنوان (يُفتح لتفاصيله) · الأولويّة إن ارتفعت · الموعد.
 */
function PersonWeekTasks({ tasks }: { tasks: WeekTask[] }) {
  if (tasks.length === 0) return <p className="px-3 py-3 text-[12px] text-muted-foreground">لا مهامّ هذا الأسبوع.</p>;
  const sorted = [...tasks].sort((a, b) => rank(a) - rank(b));
  return (
    <ul className="divide-y rounded-md border bg-background">
      {sorted.map((t) => (
        <li key={t.id} className={cn("grid grid-cols-[7rem_minmax(0,1fr)_auto] items-start gap-2 px-3 py-1.5", t.late && "bg-red-500/5")}>
          <span className={cn("mt-0.5 w-fit whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_STATUS_META[t.status].tone)}>
            {TASK_STATUS_META[t.status].labelAr}
          </span>
          <details className="group min-w-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px]">
              <span className="truncate font-medium group-open:whitespace-normal">{t.title}</span>
              {t.priority === "HIGH" || t.priority === "URGENT" ? (
                <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_PRIORITY_META[t.priority].tone)}>
                  {TASK_PRIORITY_META[t.priority].labelAr}
                </span>
              ) : null}
            </summary>
            <p className="mt-1 whitespace-pre-line border-s-2 ps-2 text-[12px] text-muted-foreground">{t.description || "بلا تفاصيل."}</p>
          </details>
          <span
            className={cn(
              "whitespace-nowrap text-[11px] tabular-nums",
              t.late ? "font-bold text-red-600 dark:text-red-400" : t.completedOnTime === false ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
            )}
          >
            {t.dueDate ? dueFmt.format(t.dueDate) : "بلا موعد"}
            {t.late ? " · متأخّرة" : t.completedOnTime === false ? " · أُنجزت بعد موعدها" : t.completedOnTime ? " · في موعدها" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

const N = new Intl.NumberFormat("ar-EG");

function Delta({ now, before }: { now: number; before: number }) {
  if (now === before) return <span className="text-muted-foreground">= الأسبوع الماضي</span>;
  const up = now > before;
  return (
    <span className={up ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
      {up ? "▲" : "▼"} {N.format(Math.abs(now - before))} عن الماضي
    </span>
  );
}

/**
 * **جدولُ الأسبوع — سطرٌ لكلّ شخص** بأرقامٍ تُقرأ حكماً: أُسند · أنجز · في موعده · متأخّر الآن.
 *
 * يسبق التفاصيل: التقريرُ يُقرأ من الخلاصة إلى المهمّة، لا العكس. والمتأخّرُ يُصبغ لأنّه
 * السؤالُ الذي يُفتح التقريرُ من أجله.
 */
export function WeekSummary({
  people,
  label,
  prevHref,
  nextHref,
}: {
  people: PersonWeek[];
  label: string;
  prevHref: string;
  nextHref: string | null;
}) {
  // سطرٌ مفتوحٌ واحد — كالجداول الأخرى، كي لا تُقرأ مهامُّ شخصٍ تحت اسم غيره.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const total = people.reduce(
    (a, p) => ({
      assigned: a.assigned + p.assigned,
      completed: a.completed + p.completed,
      onTime: a.onTime + p.onTime,
      withDue: a.withDue + p.completedWithDue,
      late: a.late + p.lateNow,
      last: a.last + p.completedLastWeek,
    }),
    { assigned: 0, completed: 0, onTime: 0, withDue: 0, late: 0, last: 0 },
  );

  return (
    <section className="flex flex-col gap-2" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* التنقّلُ بين الأسابيع — السابقُ دائماً، والتالي حتى الأسبوع الحاليّ فقط. */}
        <div className="flex items-center gap-1">
          <Link
            href={prevHref}
            aria-label="الأسبوع السابق"
            className="grid size-8 place-items-center rounded-md border hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </Link>
          <span className="min-w-52 px-2 text-center text-sm font-semibold">{label}</span>
          {nextHref ? (
            <Link
              href={nextHref}
              aria-label="الأسبوع التالي"
              className="grid size-8 place-items-center rounded-md border hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span className="grid size-8 place-items-center rounded-md border opacity-30" aria-hidden>
              <ChevronLeft className="size-4" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span>أُسند <b className="text-[14px] tabular-nums text-foreground">{N.format(total.assigned)}</b></span>
          <span>أنجز <b className="text-[14px] tabular-nums text-foreground">{N.format(total.completed)}</b></span>
          <span>
            في موعده <b className="text-[14px] tabular-nums text-foreground">{total.withDue ? `${N.format(Math.round((total.onTime / total.withDue) * 100))}٪` : "—"}</b>
          </span>
          <span>
            متأخّر الآن{" "}
            <b className={cn("text-[14px] tabular-nums", total.late ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {N.format(total.late)}
            </b>
          </span>
          <Delta now={total.completed} before={total.last} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b bg-muted/60 text-[12px] font-bold">
              <th className="px-3 py-2 text-right">الشخص <span className="font-normal text-muted-foreground">— اضغط لمهامّه</span></th>
              <th className="px-3 py-2 text-right">أُسند له</th>
              <th className="px-3 py-2 text-right">أنجز</th>
              <th className="px-3 py-2 text-right">في موعده</th>
              <th className="px-3 py-2 text-right">متأخّر الآن</th>
              <th className="px-3 py-2 text-right">مقارنةً بالماضي</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  لا عمل مسجَّل في هذا الأسبوع.
                </td>
              </tr>
            ) : (
              people.map((p) => {
                const key = p.staffId ?? "unassigned";
                const open = openKey === key;
                return (
                  <Fragment key={key}>
                    <tr
                      className={cn("cursor-pointer border-b last:border-0 hover:bg-muted/40", p.lateNow > 0 && "bg-red-500/5", open && "bg-muted/50")}
                      onClick={() => setOpenKey(open ? null : key)}
                      aria-expanded={open}
                    >
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2 font-semibold">
                          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
                          {p.image ? (
                            <img src={p.image} alt="" className="size-6 rounded-full object-cover" />
                          ) : (
                            <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold">{p.name.charAt(0)}</span>
                          )}
                          <bdi>{p.name}</bdi>
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{N.format(p.assigned)}</td>
                      <td className="px-3 py-2 font-bold tabular-nums">{N.format(p.completed)}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {p.completedWithDue ? `${N.format(p.onTime)} من ${N.format(p.completedWithDue)}` : "—"}
                      </td>
                      <td className={cn("px-3 py-2 font-bold tabular-nums", p.lateNow ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                        {N.format(p.lateNow)}
                      </td>
                      <td className="px-3 py-2 text-[12px]">
                        <Delta now={p.completed} before={p.completedLastWeek} />
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-b bg-muted/20">
                        <td colSpan={6} className="px-3 py-2">
                          <PersonWeekTasks tasks={p.tasks} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
