"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const N = new Intl.NumberFormat("ar-EG");
const monthFmt = new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" });
const labelFmt = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" });
// الأسبوعُ يبدأ الأحد — أسبوعُ العمل في السعوديّة ومصر.
const WEEKDAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

/** `Date` → `yyyy-mm-dd` بالتوقيت المحلّيّ (`toISOString` يُزيح اليومَ شرقَ غرينتش). */
export function toDateInput(d: Date | null): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fromDateInput(v: string): Date | null {
  const [y, m, d] = v.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

/** آخرُ يوم عملٍ في الأسبوع — الخميس. اليومُ نفسُه إن كان خميساً. */
function endOfWorkWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  return d;
}

/**
 * الموعدُ زرٌّ صغير في سطر خصائص المهمّة يفتح: اختياراتٍ سريعة + شهراً عربيّاً.
 *
 * بدل `<input type="date">` (خالد ٣ أكتوبر ٢٠٢٦): كان يعرض «10/03/2026» أمريكيّاً من اليسار بجانب
 * عنوانٍ عربيّ، لأنّ المتصفّح يرسمه بلغة الجهاز لا الصفحة. و«بلا موعد» خيارٌ صريح — المهمّةُ الجديدة
 * لا تأخذ «اليوم» من تلقاء نفسها فتتأخّر غداً دون أن يقرّر أحد.
 */
export function DueDatePicker({ value, onChange, late = false }: { value: string; onChange: (v: string) => void; late?: boolean }) {
  const [open, setOpen] = useState(false);
  const chosen = fromDateInput(value);
  const [view, setView] = useState(() => {
    const base = chosen ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const quick = [
    { label: "اليوم", value: toDateInput(new Date()) },
    { label: "بكرة", value: toDateInput(plusDays(1)) },
    { label: "بعد ٣ أيام", value: toDateInput(plusDays(3)) },
    { label: "آخر الأسبوع", value: toDateInput(endOfWorkWeek()) },
  ];

  const first = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const today = toDateInput(new Date());
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          const base = chosen ?? new Date();
          setView(new Date(base.getFullYear(), base.getMonth(), 1));
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="الموعد"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors hover:bg-muted",
            chosen ? (late ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300" : "text-foreground") : "border-dashed text-muted-foreground",
          )}
        >
          <CalendarClock className="size-3.5" aria-hidden />
          {chosen ? labelFmt.format(chosen) : "بلا موعد"}
          {late ? " · متأخّرة" : ""}
        </button>
      </PopoverTrigger>
      <PopoverContent dir="rtl" align="start" className="w-64 space-y-2 p-2">
        <div className="grid grid-cols-2 gap-1">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => pick(q.value)}
              className={cn(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                value === q.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="rounded-md border p-1.5">
          <div className="mb-1 flex items-center justify-between">
            {/* في RTL: السهمُ الأيمن للشهر السابق، والأيسر للتالي. */}
            <button
              type="button"
              aria-label="الشهر السابق"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="rounded p-1 hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
            <span className="text-xs font-semibold">{monthFmt.format(view)}</span>
            <button
              type="button"
              aria-label="الشهر التالي"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="rounded p-1 hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-0.5 text-[10px] font-semibold text-muted-foreground">
                {w}
              </span>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const v = toDateInput(new Date(view.getFullYear(), view.getMonth(), d));
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => pick(v)}
                  className={cn(
                    "rounded py-1 text-xs tabular-nums transition-colors",
                    v === value ? "bg-primary font-bold text-primary-foreground" : "hover:bg-muted",
                    v === today && v !== value && "font-bold text-primary ring-1 ring-primary/40",
                  )}
                >
                  {N.format(d)}
                </button>
              );
            })}
          </div>
        </div>

        {value ? (
          <button
            type="button"
            onClick={() => pick("")}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            <X className="size-3" aria-hidden />
            بلا موعد
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
