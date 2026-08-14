"use client";

import Link from "next/link";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconCategory, IconIndustry, IconHash, IconCheck, IconChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

// Lazy-loaded on first open (dynamic import in HomeBottomBarShell) → this Sheet's
// JS (Radix Tabs + the list rendering) never ships until the user taps "اكتشف".

const rowClass = "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition-colors";
const tabTriggerClass = "flex-1 gap-1 text-xs";
const formatCount = (n: number) => new Intl.NumberFormat("ar-SA").format(n);
const resetPill = (isActive: boolean) =>
  cn(
    "shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
  );

function FilterList({
  items,
  hrefFor,
  exploreHref,
  onClose,
  activeSlug,
  showReset = false,
}: {
  items: FilterOption[];
  hrefFor: (slug: string) => string;
  exploreHref: string;
  onClose: () => void;
  activeSlug?: string;
  showReset?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-2">
        <Link href={exploreHref} onClick={onClose} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
          استكشف الكل
        </Link>
        {showReset && (
          <Link href="/" onClick={onClose} className={resetPill(!activeSlug)}>
            الكل
          </Link>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin" dir="rtl">
        <ul className="px-4 pb-6 space-y-0.5">
          {items.length === 0 ? (
            <li className="py-3 text-xs text-muted-foreground">لا يوجد عناصر حالياً</li>
          ) : (
            items.map((it) => {
              const isActive = activeSlug === it.slug;
              return (
                <li key={it.slug}>
                  <Link
                    href={hrefFor(it.slug)}
                    onClick={onClose}
                    className={cn(rowClass, isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      {isActive && <IconCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                      <span className="truncate">{it.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatCount(it.count)}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

interface DiscoverSheetContentProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  activeCategory?: string;
  onClose: () => void;
}

export function DiscoverSheetContent({ categories, industries, tags, activeCategory, onClose }: DiscoverSheetContentProps) {
  return (
    <SheetContent side="right" className="w-[88%] sm:max-w-sm p-0 flex flex-col">
      <SheetHeader className="px-4 pt-5 pb-3 text-start">
        <div className="ps-9">
          <SheetTitle className="text-base">اكتشف المحتوى</SheetTitle>
        </div>
        <SheetDescription className="text-xs">تصفّح حسب الفئة أو الصناعة أو الوسم</SheetDescription>
      </SheetHeader>

      <Tabs defaultValue="categories" className="flex flex-1 min-h-0 flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="categories" className={tabTriggerClass}>
            <IconCategory className="h-3.5 w-3.5 shrink-0" />
            الفئات
          </TabsTrigger>
          <TabsTrigger value="industries" className={tabTriggerClass}>
            <IconIndustry className="h-3.5 w-3.5 shrink-0" />
            الصناعات
          </TabsTrigger>
          <TabsTrigger value="tags" className={tabTriggerClass}>
            <IconHash className="h-3.5 w-3.5 shrink-0" />
            الوسوم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <FilterList
            items={categories}
            hrefFor={(s) => `/?category=${encodeURIComponent(s)}`}
            exploreHref="/categories"
            onClose={onClose}
            activeSlug={activeCategory}
            showReset
          />
        </TabsContent>

        <TabsContent value="industries" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <FilterList items={industries} hrefFor={(s) => `/industries/${encodeURIComponent(s)}`} exploreHref="/industries" onClose={onClose} />
        </TabsContent>

        <TabsContent value="tags" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <FilterList items={tags} hrefFor={(s) => `/tags/${encodeURIComponent(s)}`} exploreHref="/tags" onClose={onClose} />
        </TabsContent>
      </Tabs>
    </SheetContent>
  );
}
