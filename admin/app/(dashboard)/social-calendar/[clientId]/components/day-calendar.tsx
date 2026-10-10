"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { DAY_NAMES, daysInMonth } from "../../helpers/dates";

/** رؤوس الأسبوع بالعربية (الحرف المميّز لكل يوم) — الاسم الكامل في التلميح. */
const WEEK_HEADERS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"] as const;

/**
 * تقويم الشهر في نموذج المنشور — نسخة القديم (`DayCalendar` — `EntryPageForm.tsx:102-176`).
 *
 * في الإنشاء وللشهر الحالي فقط: الأيام الماضية مقفلة، خضراء بعلامة إن كان فيها منشور وحمراء
 * باهتة إن لم يكن، واليوم محاط بحلقة. في التعديل لا قفل ولا تلوين (`today = null`).
 * الفرق المفروض الوحيد: عدد الأيام وأوّل يوم في الأسبوع من السنة الحقيقية لا «السنة الحالية».
 */
export function DayCalendar({
  year,
  month,
  value,
  postDays,
  today,
  onChange,
}: {
  year: number;
  month: number;
  value: number;
  postDays: number[];
  /** يوم اليوم إن كان النموذج إنشاءً والشهر المعروض هو الشهر الحالي، وإلّا null. */
  today: number | null;
  onChange: (day: number) => void;
}) {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-0.5">
      <div className="mb-1 grid grid-cols-7">
        {WEEK_HEADERS.map((h, i) => (
          <div key={h} className="flex h-5 items-center justify-center" title={DAY_NAMES[i]}>
            <span className="text-[11px] font-semibold text-muted-foreground/70">{h}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} className="h-7" />;
          const isPast = today !== null && d < today;
          const isToday = today === d;
          const isSelected = value === d;
          const hasPost = postDays.includes(d);

          if (isPast) {
            return (
              <div
                key={d}
                className={cn(
                  "flex h-7 flex-col items-center justify-center gap-px rounded-md text-[11px] font-medium leading-none",
                  hasPost ? "bg-emerald-500/15 text-emerald-600" : "bg-muted/40 text-muted-foreground/40",
                )}
                title={hasPost ? "يوم مضى — فيه منشور" : "يوم مضى"}
              >
                <span>{d}</span>
                {hasPost && <Check className="h-1.5 w-1.5" strokeWidth={4} />}
              </div>
            );
          }

          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-7 items-center justify-center rounded-md text-[11px] font-semibold leading-none transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isToday
                    ? "bg-primary/10 font-bold text-primary ring-1 ring-inset ring-primary/40"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
      {today !== null && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm ring-1 ring-inset ring-primary/40 bg-primary/10" />اليوم</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" />مضى وفيه منشور</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted" />مضى</span>
        </div>
      )}
    </div>
  );
}
