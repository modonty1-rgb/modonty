"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { MONTH_LABELS, formatMonthParam } from "../../../helpers/dates";

/**
 * الشهر قائمة منسدلة بجانب اسم العميل (موكب التقويم ١١ أكتوبر ٢٠٢٦) بدل شريط الشهور.
 * تعرض الشهور التي فيها منشورات بعدّاداتها، والشهر المفتوح ولو فارغاً.
 */
export function MonthSelect({
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
  const months = MONTH_LABELS.map((label, i) => ({ label, i, count: counts[i] ?? 0 })).filter(
    (m) => m.count > 0 || m.i === activeMonth,
  );
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted">
        {MONTH_LABELS[activeMonth]} {year}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {months.map((m) => (
          <DropdownMenuItem key={m.i} asChild>
            <Link
              href={`/social-calendar/${calendarId}/${formatMonthParam(year, m.i)}`}
              aria-current={m.i === activeMonth ? "page" : undefined}
              className={cn("flex justify-between gap-3", m.i === activeMonth && "font-bold text-primary")}
            >
              {m.label}
              <span className="text-[11px] tabular-nums text-muted-foreground">{m.count}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
