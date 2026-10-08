"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { daysInMonth } from "../../helpers/dates";

const WEEK_HEADERS = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"] as const;

/**
 * تقويم الشهر في نموذج المنشور (القديم `DayCalendar` — `EntryPageForm.tsx:102-176`).
 *
 * الأيام الماضية من الشهر الحالي ملوّنة كالقديم: أخضر بعلامة إن كان فيها منشور، وأحمر باهت إن
 * لم يكن. الفرق (س٩): تبقى قابلة للاختيار — لتوثيق محتوى نُشر فعلاً — بدل أن تُقفل.
 * عدد الأيام وأوّل يوم في الأسبوع من السنة الحقيقية، لا من «السنة الحالية».
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
  /** يوم اليوم إن كان الشهر المعروض هو الشهر الحالي، وإلّا null. */
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
        {WEEK_HEADERS.map((h) => (
          <div key={h} className="flex h-5 items-center justify-center">
            <span className="text-[9px] font-semibold text-muted-foreground/40">{h}</span>
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
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-7 flex-col items-center justify-center gap-px rounded-md text-[11px] font-semibold leading-none transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isPast
                    ? hasPost
                      ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                      : "bg-red-400/10 text-red-400/70 hover:bg-red-400/20"
                    : isToday
                      ? "bg-primary/10 font-bold text-primary ring-1 ring-inset ring-primary/40"
                      : hasPost
                        ? "text-emerald-600 hover:bg-muted/50"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span>{d}</span>
              {hasPost && !isSelected && <Check className="h-1.5 w-1.5" strokeWidth={4} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
