"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SeoCheckTally } from "./seo-health-card";

/**
 * One "Blocking 100%" chip. When the tally carries the failing entities, the chip is a
 * clickable popover that lists them — each name links straight to that entity's edit
 * page. Without items it stays a plain count (the shared card is used by sections that
 * don't provide the list yet). Tone follows the bucket: amber = owner lever, red = bug.
 */
export function SeoCheckChip({ check, tone }: { check: SeoCheckTally; tone: "content" | "system" }) {
  const amber = tone === "content";
  const chipClass = amber
    ? "border-amber-500/30 bg-amber-500/10"
    : "border-red-500/30 bg-red-500/10";
  const numClass = amber ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  const chipInner = (
    <>
      <span className={`font-extrabold tabular-nums ${numClass}`}>{check.failing}</span>
      <span className="text-muted-foreground">{check.label}</span>
    </>
  );

  // No drill-down data → plain, non-interactive chip (unchanged behaviour).
  if (!check.items || check.items.length === 0) {
    return (
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${chipClass}`}>
        {chipInner}
      </span>
    );
  }

  const hidden = check.failing - check.items.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors hover:brightness-110 ${chipClass}`}
        >
          {chipInner}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b px-3 py-2" dir="rtl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">{check.label}</span>
            <span className={`text-[11px] font-extrabold tabular-nums ${numClass}`}>{check.failing}</span>
          </div>
          {check.desc && (
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{check.desc}</p>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {check.items.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className="flex items-center justify-between gap-2 px-3 py-1.5 text-[12.5px] hover:bg-accent"
            >
              <span className="truncate">{it.name}</span>
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
            </Link>
          ))}
        </div>
        {hidden > 0 && (
          <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">+{hidden} أكثر</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
