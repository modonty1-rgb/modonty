"use client";

import { Fragment, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "@/components/link";
import { MobileModoGateway } from "@/components/feed/MobileModoGateway";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { IconCalendar, IconCompass, IconClients, IconSearch, IconShoppingBag } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ClientServiceAction, FilterOption } from "./types";

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
interface HomeBottomBarShellProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  partners: FilterOption[];
  services: ClientServiceAction[];
}

const triggerClass =
  "relative grid size-11 place-items-center rounded-xl text-muted-foreground transition-colors active:bg-primary/10 active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function HomeBottomBarShell({ categories, industries, tags, partners, services }: HomeBottomBarShellProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? undefined;
  const activeClient = searchParams.get("client") ?? undefined;

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverMounted, setDiscoverMounted] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [partnersMounted, setPartnersMounted] = useState(false);
  const actions = ([
    services.find((service) => service.visual === "booking"),
    services.find((service) => service.visual === "shop"),
  ]).filter((service): service is ClientServiceAction => Boolean(service));

  return (
    <>
      <nav
        aria-label="أدوات استكشاف الصفحة الرئيسية"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[60] md:hidden",
          (discoverOpen || partnersOpen) && "invisible"
        )}
      >
        <div className="pointer-events-auto mx-auto flex h-14 w-fit items-center justify-center gap-0.5">
          <Link href="/search" aria-label="بحث" className={triggerClass}>
            <IconSearch className="h-5 w-5" />
          </Link>

          <Sheet open={discoverOpen} onOpenChange={(open) => { if (open) setDiscoverMounted(true); setDiscoverOpen(open); }}>
            <SheetTrigger className={triggerClass} aria-label="اكتشف">
              <span className="relative">
                <IconCompass className="h-5 w-5" />
                {activeCategory && <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
              </span>
            </SheetTrigger>
            {discoverMounted && <DiscoverSheetContent categories={categories} industries={industries} tags={tags} activeCategory={activeCategory} onClose={() => setDiscoverOpen(false)} />}
          </Sheet>

          <Sheet open={partnersOpen} onOpenChange={(open) => { if (open) setPartnersMounted(true); setPartnersOpen(open); }}>
            <SheetTrigger className={triggerClass} aria-label="الشركاء">
              <span className="relative">
                <IconClients className="h-5 w-5" />
                {activeClient && <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
              </span>
            </SheetTrigger>
            {partnersMounted && <PartnersSheetContent partners={partners} activeClient={activeClient} onClose={() => setPartnersOpen(false)} />}
          </Sheet>
        </div>
      </nav>

      {actions.length > 0 && (
        <nav aria-label="خدمات العملاء" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
          <MobileModoGateway />
          <div className="flex items-center px-3 py-2">
            {actions.map((service, index) => {
              const isBooking = service.visual === "booking";
              const Icon = isBooking ? IconCalendar : IconShoppingBag;
              return (
                <Fragment key={service.id}>
                  {actions.length === 2 && index === 1 && <span className="w-14 shrink-0" aria-hidden="true" />}
                  <Link href={`/clients?service=${encodeURIComponent(service.id)}`} className={cn("inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-accent/35 px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", actions.length === 2 && (index === 0 ? "rounded-se-none" : "rounded-ss-none"), isBooking ? "bg-accent/20 text-primary-foreground" : "bg-accent/10 text-accent")}>
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {isBooking ? "احجز الآن" : "تسوق الآن"}
                  </Link>
                </Fragment>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
