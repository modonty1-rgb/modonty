"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "@/components/link";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { IconCompass, IconClients, IconGift, IconSearch } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

// Each sheet's body is code-split and mounted ONLY on first open (Next.js official
// "load on demand" pattern — docs/01-app/02-guides/lazy-loading.mdx). The bar itself
// stays light: tapping a tab is what pulls its Radix + list JS, nothing before.
const DiscoverSheetContent = dynamic(
  () => import("./DiscoverSheetContent").then((m) => ({ default: m.DiscoverSheetContent })),
  { ssr: false }
);
const PartnersSheetContent = dynamic(
  () => import("./PartnersSheetContent").then((m) => ({ default: m.PartnersSheetContent })),
  { ssr: false }
);
const MazayaSheet = dynamic(
  () => import("@/components/layout/MazayaSheet").then((m) => ({ default: m.MazayaSheet })),
  { ssr: false }
);

interface HomeBottomBarShellProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  partners: FilterOption[];
}

const triggerClass =
  "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary active:bg-muted/50";

export function HomeBottomBarShell({ categories, industries, tags, partners }: HomeBottomBarShellProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? undefined;
  const activeClient = searchParams.get("client") ?? undefined;

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverMounted, setDiscoverMounted] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [partnersMounted, setPartnersMounted] = useState(false);
  const [mazayaOpen, setMazayaOpen] = useState(false);
  const [mazayaMounted, setMazayaMounted] = useState(false);

  return (
    <nav
      aria-label="أدوات الصفحة الرئيسية"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4">
        {/* ─── بحث (رابط مباشر — لا Sheet) ─── */}
        <Link href="/search" aria-label="بحث" className={triggerClass}>
          <IconSearch className="h-5 w-5" />
          بحث
        </Link>

        {/* ─── اكتشف (الفئات · الصناعات · الوسوم) — محتواه lazy عند أول فتح ─── */}
        <Sheet
          open={discoverOpen}
          onOpenChange={(o) => {
            if (o) setDiscoverMounted(true);
            setDiscoverOpen(o);
          }}
        >
          <SheetTrigger className={triggerClass}>
            <span className="relative">
              <IconCompass className="h-5 w-5" />
              {activeCategory && (
                <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </span>
            اكتشف
          </SheetTrigger>
          {discoverMounted && (
            <DiscoverSheetContent
              categories={categories}
              industries={industries}
              tags={tags}
              activeCategory={activeCategory}
              onClose={() => setDiscoverOpen(false)}
            />
          )}
        </Sheet>

        {/* ─── الشركاء — محتواه lazy عند أول فتح ─── */}
        <Sheet
          open={partnersOpen}
          onOpenChange={(o) => {
            if (o) setPartnersMounted(true);
            setPartnersOpen(o);
          }}
        >
          <SheetTrigger className={cn(triggerClass, "border-s border-border")}>
            <span className="relative">
              <IconClients className="h-5 w-5" />
              {activeClient && (
                <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </span>
            الشركاء
          </SheetTrigger>
          {partnersMounted && (
            <PartnersSheetContent
              partners={partners}
              activeClient={activeClient}
              onClose={() => setPartnersOpen(false)}
            />
          )}
        </Sheet>

        {/* ─── المزايا — نفس شيت المزايا المشترك، lazy عند أول فتح ─── */}
        <button
          type="button"
          onClick={() => {
            setMazayaMounted(true);
            setMazayaOpen(true);
          }}
          className={cn(triggerClass, "border-s border-border")}
        >
          <IconGift className="h-5 w-5" />
          المزايا
        </button>
      </div>

      {mazayaMounted && <MazayaSheet open={mazayaOpen} onOpenChange={setMazayaOpen} />}
    </nav>
  );
}
