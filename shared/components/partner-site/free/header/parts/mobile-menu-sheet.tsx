"use client";

import { SiteLink } from "../../../parts/site-link";
import { ChevronLeft, Phone } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../ui/sheet";
import { WhatsAppButton } from "../../../parts/whatsapp-button";
import { PartnerAvatar } from "../../../../partner-avatar/PartnerAvatar";
import { asMedia } from "../../../../optimized-image";
import { useCurrentNavHref } from "./use-current-nav-href";
import type { HeaderData } from "../header-data";

interface MobileMenuSheetProps {
  data: HeaderData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The panel itself — in its own file so `next/dynamic` keeps Radix's dialog out of the
 * first bundle; it is fetched on the first tap of the burger and never on a visit that
 * does not open the menu.
 *
 * `side="left"`: the drawer enters from the edge the finger just touched. The burger sits
 * on the left of the partner header (measured 41px from the left on a 430×932 iPhone), and
 * a panel flying in from the opposite edge breaks the link between the tap and the motion.
 *
 * The layout is three bands, not one list. The first version was a bare list of links with
 * the phone buttons floating after it and 480px of dead panel below (measured: content
 * ≈450px inside a 938px panel). A visitor opens this menu for one of two reasons — to go
 * somewhere, or to call — so navigation takes the middle and grows, and contact is pinned
 * to the bottom where the thumb already rests.
 */
export function MobileMenuSheet({ data, open, onOpenChange }: MobileMenuSheetProps) {
  // Same rule as the desktop bar. `pathname === l.href` compared the percent-encoded path with
  // the raw Arabic href, so no page ever lit up on a partner with an Arabic slug (4 Oct 2026).
  const currentHref = useCurrentNavHref(data.links);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[86%] max-w-sm flex-col gap-0 p-0">
        {/* ① الهوية — الزائر يعرف أين هو قبل أن يقرأ رابطاً */}
        <SheetHeader className="shrink-0 border-b px-5 py-4 text-start">
          <div className="flex items-center gap-3 pe-11">
            {/* The header's own avatar — `object-cover` in a circle cut the name out of wordmark logos. */}
            <PartnerAvatar media={data.logoUrl ? asMedia(data.logoUrl, data.name) : null} name={data.name} size="standard" className="shrink-0" />
            <div className="min-w-0">
              <SheetTitle className="truncate text-base font-bold leading-tight">
                {data.name}
              </SheetTitle>
              {data.tagline ? (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{data.tagline}</p>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        {/* ② الملاحة — تأخذ ما بقي وتُمرَّر وحدها إن طالت */}
        <nav aria-label="الصفحات" className="min-h-0 flex-1 overflow-y-auto py-1">
          <ul>
            {data.links.map((l) => {
              const current = l.href === currentHref;
              return (
                <li key={l.href}>
                  <SiteLink
                    href={l.href}
                    onClick={close}
                    aria-current={current ? "page" : undefined}
                    // 52px: صفٌّ يجاوره صفّان يحتاج أكثر من الحدّ الأدنى المنفرد
                    // (Material 3: 48dp أدنى · Apple HIG: 44pt). والشريط الجانبي
                    // يحمل الحالة النشطة بلا لون خلفية — أهدأ ويبقى التباين سليماً.
                    className={`flex min-h-[52px] items-center gap-3 border-s-[3px] px-5 text-base transition-colors ${ current ? "border-s-primary bg-primary/5 font-bold text-foreground" : "border-s-transparent font-medium text-foreground/85 active:bg-muted" }`}
                  >
                    <span className="flex-1 truncate">{l.label}</span>
                    {/* في RTL الاتجاه إلى الأمام هو اليسار، فالسهم لا يُقلَب */}
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </SiteLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ③ التواصل — مثبَّت أسفل، في مدى الإبهام، ومحميّ من شريط الآيفون السفلي */}
        <div className="shrink-0 border-t bg-muted/30 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2">
            <WhatsAppButton href={data.whatsappHref} />
            {data.phone ? (
              <SiteLink
                href={`tel:${data.phone}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ps-radius-control,9999px)] border bg-background px-5 text-sm font-medium"
              >
                <Phone className="size-4" aria-hidden />
                <span dir="ltr">{data.phone}</span>
              </SiteLink>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
