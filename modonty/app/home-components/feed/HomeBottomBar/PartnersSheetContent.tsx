"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SortMenu } from "@/app/home-components/RightSidebar/SortMenu";
import { IconFilter } from "@/lib/icons";
import { BRAND_AVATAR_RADIUS } from "@/constants";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

// Lazy-loaded on first open → the partner list + filter/sort JS (Radix Avatar/dropdown)
// never ships until the user taps "الشركاء". Filter/sort state lives here (owned by the
// content), so it resets each mount — acceptable for an on-demand mobile sheet.

const PARTNER_SORT = [
  { value: "newest", label: "الأحدث" },
  { value: "name", label: "حسب الاسم" },
  { value: "articles", label: "الأكثر مقالات" },
] as const;
type PartnerSort = (typeof PARTNER_SORT)[number]["value"];

const formatCount = (n: number) => new Intl.NumberFormat("ar-SA").format(n);
const resetPill = (isActive: boolean) =>
  cn(
    "shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
  );

interface PartnersSheetContentProps {
  partners: FilterOption[];
  activeClient?: string;
  onClose: () => void;
}

export function PartnersSheetContent({ partners, activeClient, onClose }: PartnersSheetContentProps) {
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [partnerSort, setPartnerSort] = useState<PartnerSort>("newest");

  const partnerIndustries = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of partners) {
      if (!p.industry) continue;
      map.set(p.industry, (map.get(p.industry) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [partners]);

  const displayedPartners = useMemo(() => {
    const base = activeIndustry ? partners.filter((p) => p.industry === activeIndustry) : partners;
    if (partnerSort === "newest") return base;
    const arr = [...base];
    if (partnerSort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [partners, activeIndustry, partnerSort]);

  return (
    <SheetContent side="right" className="w-[88%] sm:max-w-sm p-0 flex flex-col">
      <SheetHeader className="px-4 pt-5 pb-3 text-start">
        <div className="flex items-center justify-between gap-2 ps-9">
          <SheetTitle className="text-base">الشركاء</SheetTitle>
          <Link href="/" onClick={onClose} className={resetPill(!activeClient)}>
            الكل
          </Link>
        </div>
        <SheetDescription className="text-xs">اختر شريكاً لعرض مقالاته في الصفحة الرئيسية</SheetDescription>
      </SheetHeader>

      {partnerIndustries.length > 1 && (
        <div className="space-y-2 px-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <SortMenu
              ariaLabel="ترتيب الشركاء"
              menuLabel="ترتيب الشركاء"
              options={PARTNER_SORT}
              value={partnerSort}
              onChange={(v) => setPartnerSort(v as PartnerSort)}
            />
            {activeIndustry !== null && (
              <button
                type="button"
                onClick={() => setActiveIndustry(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <span aria-hidden className="text-[13px] leading-none">×</span>
                كل الصناعات
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1" role="tablist" aria-label="تصفية الشركاء حسب الصناعة">
            {partnerIndustries.map((ind) => {
              const isActive = activeIndustry === ind.name;
              return (
                <button
                  key={ind.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndustry(ind.name)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition-colors",
                    isActive ? "bg-accent font-bold text-accent-foreground" : "bg-muted font-medium text-muted-foreground"
                  )}
                >
                  {ind.name}
                  <span className={cn("text-[10px] font-bold", isActive ? "opacity-80" : "opacity-60")}>{ind.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin" dir="rtl">
        <ul className="px-4 pb-6 space-y-1">
          {displayedPartners.length === 0 ? (
            <li className="py-3 text-xs text-muted-foreground">
              {activeIndustry ? "لا شركاء في هذا القطاع" : "لا يوجد شركاء حالياً"}
            </li>
          ) : (
            displayedPartners.map((p) => {
              const isActive = activeClient === p.slug;
              return (
                <li key={p.slug}>
                  <div
                    className={cn(
                      "flex items-start gap-1 rounded-lg transition-colors",
                      isActive ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : "hover:bg-muted/50"
                    )}
                  >
                    <Link
                      href={`/clients/${encodeURIComponent(p.slug)}`}
                      onClick={onClose}
                      className="flex min-w-0 flex-1 items-start gap-3 px-2 py-2"
                    >
                      <Avatar className={cn("h-8 w-8 shrink-0 overflow-hidden mt-0.5", BRAND_AVATAR_RADIUS)}>
                        <AvatarImage src={p.logo} alt={p.name} className="object-cover" loading="lazy" decoding="async" />
                        <AvatarFallback className={cn("bg-primary text-[10px] font-medium text-primary-foreground", BRAND_AVATAR_RADIUS)}>
                          {p.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-medium text-foreground">{p.name}</span>
                        {p.industry && <span className="block truncate text-xs text-muted-foreground">{p.industry}</span>}
                      </span>
                    </Link>
                    {p.count > 0 && (
                      <Link
                        href={`/?client=${encodeURIComponent(p.slug)}`}
                        onClick={onClose}
                        aria-label={`اعرض مقالات ${p.name} في الموجز (${p.count})`}
                        title={`مقالات ${p.name}`}
                        className={cn(
                          "me-2 mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors",
                          isActive
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <IconFilter className="h-3.5 w-3.5" aria-hidden />
                        <span className="tabular-nums">{formatCount(p.count)}</span>
                      </Link>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </SheetContent>
  );
}
