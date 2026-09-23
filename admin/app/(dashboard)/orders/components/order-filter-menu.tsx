"use client";

import { Check, ListFilter, X } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterItem {
  href: string;
  label: string;
  count: number;
  active: boolean;
  hint?: string;
}

export interface FilterSection {
  title: string;
  items: FilterItem[];
}

/**
 * **الحالةُ والسوقُ والبوّابةُ في قائمةٍ واحدة** (خالد ٢٣ سبتمبر ٢٠٢٦: «شيل التشويش البصري…
 * تنحطّ في منيو»). كانت أربعَ عشرةَ حبّةً في صفّ العنوان، يُقرأ منها عادةً واحدة.
 *
 * الفلترُ يبقى في الرابط (`?status=` · `?market=` · `?provider=`) فيُحفظ ويُرسل لزميل، وكلُّ
 * بندٍ رابطٌ لا حالةُ متصفّح. والنشطُ يُكتب على الزرّ نفسِه ومعه ✕ يمسحه — فلا يُنسى فلترٌ
 * مخفيٌّ في قائمةٍ مغلقة وتُقرأ الأرقامُ ناقصة. والبندُ الصفريّ باهتٌ لا مخفيّ: غيابُه يُقرأ
 * «لم يُحسب»، وحضورُه بصفرٍ يقول «لا شيء».
 */
export function OrderFilterMenu({ sections }: { sections: FilterSection[] }) {
  const active = sections.flatMap((s) => s.items).find((i) => i.active);

  return (
    <div className="flex items-center">
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-7 items-center gap-1.5 border px-2.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "rounded-s-full border-primary bg-primary text-primary-foreground"
                : "rounded-full bg-card text-foreground hover:bg-accent",
            )}
          >
            <ListFilter className="size-3.5" aria-hidden />
            {active ? (
              <>
                {active.label}
                <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[10px] tabular-nums">{active.count}</span>
              </>
            ) : (
              "فلترة"
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {sections.map((section, i) => (
            <DropdownMenuGroup key={section.title}>
              {i > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">{section.title}</DropdownMenuLabel>
              {section.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    title={item.hint}
                    className={cn("flex items-center gap-2 text-[12.5px]", item.count === 0 && !item.active && "text-muted-foreground/60")}
                  >
                    <Check className={cn("size-3.5 shrink-0", item.active ? "text-primary" : "invisible")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    <span className="tabular-nums text-[11px] text-muted-foreground">{item.count}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {active ? (
        <Link
          href="/orders"
          aria-label={`امسح فلتر ${active.label}`}
          className="inline-flex h-7 items-center rounded-e-full border border-s-0 border-primary bg-primary px-1.5 text-primary-foreground hover:bg-primary/90"
        >
          <X className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
