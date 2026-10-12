import Link from "next/link";

import { cn } from "@/lib/utils";

import { MONTH_LABELS, formatMonthParam } from "../../../helpers/dates";

/**
 * شهور السنة سطراً واحداً فوق المؤشّرات، بنمط التوجل نفسه (خالد ١٢ أكتوبر ٢٠٢٦: «افردها واستخدم
 * التوجل ستايل تبعنا») — بدل القائمة المنسدلة في الرأس. كل شهر بعدد منشوراته، والفارغ باهت لا مخفي.
 * التنقّل بين السنوات مؤجّل بقراره (١٢ أكتوبر) — السنة تبقى في رابط الشهر (`2026-10`).
 */
export function MonthToggle({
  calendarId,
  year,
  activeMonth,
  counts,
}: {
  calendarId: string;
  year: number;
  activeMonth: number;
  counts: number[];
}) {
  const href = (y: number, m: number) => `/social-calendar/${calendarId}/${formatMonthParam(y, m)}`;

  return (
    <nav aria-label="شهور السنة">
      <div className="grid grid-cols-6 overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-12">
        {MONTH_LABELS.map((label, i) => {
          const active = i === activeMonth;
          const count = counts[i] ?? 0;
          return (
            <Link
              key={label}
              href={href(year, i)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : count > 0
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
              <span
                className={cn(
                  "min-w-4 rounded-full px-1 text-center text-[10px] font-bold leading-4 tabular-nums",
                  active ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
