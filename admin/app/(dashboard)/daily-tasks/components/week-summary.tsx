import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PersonWeek } from "../helpers/get-weekly-report";

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
              <th className="px-3 py-2 text-right">الشخص</th>
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
              people.map((p) => (
                <tr key={p.staffId ?? "unassigned"} className={cn("border-b last:border-0", p.lateNow > 0 && "bg-red-500/5")}>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2 font-semibold">
                      {p.image ? (
                        <img src={p.image} alt="" className="size-6 rounded-full object-cover" />
                      ) : (
                        <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold">
                          {p.name.charAt(0)}
                        </span>
                      )}
                      {p.name}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
