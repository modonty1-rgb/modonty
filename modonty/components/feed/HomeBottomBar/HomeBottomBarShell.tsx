"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MazayaSheet } from "@/components/layout/MazayaSheet";
import { SortMenu } from "@/components/layout/RightSidebar/SortMenu";
import {
  IconCompass,
  IconCategory,
  IconIndustry,
  IconHash,
  IconClients,
  IconFilter,
  IconCheck,
  IconChevronLeft,
  IconGift,
} from "@/lib/icons";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

interface HomeBottomBarShellProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  partners: FilterOption[];
}

const PARTNER_SORT = [
  { value: "newest", label: "الأحدث" },
  { value: "name", label: "حسب الاسم" },
  { value: "articles", label: "الأكثر مقالات" },
] as const;
type PartnerSort = (typeof PARTNER_SORT)[number]["value"];

const formatCount = (n: number) => new Intl.NumberFormat("ar-SA").format(n);

const triggerClass =
  "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary active:bg-muted/50";

const rowClass =
  "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition-colors";

const tabTriggerClass = "flex-1 gap-1 text-xs";

const resetPill = (isActive: boolean) =>
  cn(
    "shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-muted/80"
  );

// One scrollable filter/discovery list — mirrors a single tab of the desktop DiscoveryCard.
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
        <Link
          href={exploreHref}
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
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
                    className={cn(
                      rowClass,
                      isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      {isActive && <IconCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                      <span className="truncate">{it.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatCount(it.count)}
                    </span>
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

export function HomeBottomBarShell({ categories, industries, tags, partners }: HomeBottomBarShellProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? undefined;
  const activeClient = searchParams.get("client") ?? undefined;

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [mazayaOpen, setMazayaOpen] = useState(false);

  const closeDiscover = () => setDiscoverOpen(false);
  const closePartners = () => setPartnersOpen(false);

  // Partners sheet: industry filter + one sort — 100% client-side on the loaded list.
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [partnerSort, setPartnerSort] = useState<PartnerSort>("newest");

  const partnerIndustries = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of partners) {
      if (!p.industry) continue;
      map.set(p.industry, (map.get(p.industry) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [partners]);

  const displayedPartners = useMemo(() => {
    const base = activeIndustry ? partners.filter((p) => p.industry === activeIndustry) : partners;
    if (partnerSort === "newest") return base;
    const arr = [...base];
    if (partnerSort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else arr.sort((a, b) => b.count - a.count); // الأكثر مقالات (count = articleCount)
    return arr;
  }, [partners, activeIndustry, partnerSort]);

  return (
    <nav
      aria-label="أدوات الصفحة الرئيسية"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-3">
        {/* ─── اكتشف (الفئات · الصناعات · الوسوم) ─── */}
        <Sheet open={discoverOpen} onOpenChange={setDiscoverOpen}>
          <SheetTrigger className={triggerClass}>
            <span className="relative">
              <IconCompass className="h-5 w-5" />
              {activeCategory && (
                <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </span>
            اكتشف
          </SheetTrigger>
          <SheetContent side="right" className="w-[88%] sm:max-w-sm p-0 flex flex-col">
            <SheetHeader className="px-4 pt-5 pb-3 text-start">
              <div className="ps-9">
                <SheetTitle className="text-base">اكتشف المحتوى</SheetTitle>
              </div>
              <SheetDescription className="text-xs">
                تصفّح حسب الفئة أو الصناعة أو الوسم
              </SheetDescription>
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
                  onClose={closeDiscover}
                  activeSlug={activeCategory}
                  showReset
                />
              </TabsContent>

              <TabsContent value="industries" className="mt-2 flex-1 min-h-0 overflow-hidden">
                <FilterList
                  items={industries}
                  hrefFor={(s) => `/industries/${encodeURIComponent(s)}`}
                  exploreHref="/industries"
                  onClose={closeDiscover}
                />
              </TabsContent>

              <TabsContent value="tags" className="mt-2 flex-1 min-h-0 overflow-hidden">
                <FilterList
                  items={tags}
                  hrefFor={(s) => `/tags/${encodeURIComponent(s)}`}
                  exploreHref="/tags"
                  onClose={closeDiscover}
                />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>

        {/* ─── الشركاء ─── */}
        <Sheet open={partnersOpen} onOpenChange={setPartnersOpen}>
          <SheetTrigger className={cn(triggerClass, "border-s border-border")}>
            <span className="relative">
              <IconClients className="h-5 w-5" />
              {activeClient && (
                <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </span>
            الشركاء
          </SheetTrigger>
          <SheetContent side="right" className="w-[88%] sm:max-w-sm p-0 flex flex-col">
            <SheetHeader className="px-4 pt-5 pb-3 text-start">
              <div className="flex items-center justify-between gap-2 ps-9">
                <SheetTitle className="text-base">الشركاء</SheetTitle>
                <Link href="/" onClick={closePartners} className={resetPill(!activeClient)}>
                  الكل
                </Link>
              </div>
              <SheetDescription className="text-xs">
                اختر شريكاً لعرض مقالاته في الصفحة الرئيسية
              </SheetDescription>
            </SheetHeader>
            {/* Industry filter (chips scroller) + one client-side sort — مبسّط للموبايل. */}
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
                <div
                  className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1"
                  role="tablist"
                  aria-label="تصفية الشركاء حسب الصناعة"
                >
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
                          isActive
                            ? "bg-accent font-bold text-accent-foreground"
                            : "bg-muted font-medium text-muted-foreground"
                        )}
                      >
                        {ind.name}
                        <span className={cn("text-[10px] font-bold", isActive ? "opacity-80" : "opacity-60")}>
                          {ind.count}
                        </span>
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
                        {/* Mirrors desktop NewClientItem: name/logo → partner page · bordered chip → feed filter */}
                        <div
                          className={cn(
                            "flex items-start gap-1 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
                              : "hover:bg-muted/50"
                          )}
                        >
                          {/* Primary action — visit the partner profile */}
                          <Link
                            href={`/clients/${encodeURIComponent(p.slug)}`}
                            onClick={closePartners}
                            className="flex min-w-0 flex-1 items-start gap-3 px-2 py-2"
                          >
                            <Avatar className={cn("h-8 w-8 shrink-0 overflow-hidden mt-0.5", BRAND_AVATAR_RADIUS)}>
                              <AvatarImage
                                src={p.logo}
                                alt={p.name}
                                className="object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                              <AvatarFallback className={cn("bg-primary text-[10px] font-medium text-primary-foreground", BRAND_AVATAR_RADIUS)}>
                                {p.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-medium text-foreground">{p.name}</span>
                              {p.industry && (
                                <span className="block truncate text-xs text-muted-foreground">{p.industry}</span>
                              )}
                            </span>
                          </Link>
                          {/* Secondary action — filter the home feed to this partner.
                              Hidden when the partner has no articles yet (mirrors desktop). */}
                          {p.count > 0 && (
                          <Link
                            href={`/?client=${encodeURIComponent(p.slug)}`}
                            onClick={closePartners}
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
        </Sheet>

        {/* ─── المزايا — opens the shared sheet (same one used in the desktop nav) ─── */}
        <button
          type="button"
          onClick={() => setMazayaOpen(true)}
          aria-haspopup="dialog"
          className={cn(triggerClass, "border-s border-border")}
        >
          <IconGift className="h-5 w-5" />
          المزايا
        </button>
      </div>

      <MazayaSheet open={mazayaOpen} onOpenChange={setMazayaOpen} />
    </nav>
  );
}
