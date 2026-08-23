import type { ReactNode } from "react";
import Link from "next/link";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { RightSidebar } from "@/app/(site)/clients/components/right-sidebar/RightSidebar";
import { LeftSidebar } from "@/app/(site)/clients/components/left-sidebar/LeftSidebar";
import { PartnersBar } from "@/app/(site)/clients/components/partners-bar/PartnersBar";
import { PartnersList } from "@/app/(site)/clients/components/partners-list/PartnersList";
import { PartnersFilterBar } from "@/app/(site)/clients/components/partners-filter-bar/PartnersFilterBar";
import { TrustStripMobile } from "@/app/(site)/clients/components/trust-card/TrustStripMobile";
import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { ModontyFeaturedMark } from "@/components/icons/modonty-featured-mark";
import { cn } from "@/lib/utils";
import { formatClientsCount } from "@/lib/format-counts";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import { filterPartners } from "@/app/(site)/clients/helpers/filter-partners";
import { sortPartners } from "@/app/(site)/clients/helpers/sort-partners";
import { countIndustries } from "@/app/(site)/clients/helpers/count-industries";
import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";
import type { IndustryListItem } from "@/lib/types";

interface PageLayoutProps {
  /** Every active partner, straight from the cached query. */
  partners: ClientListItem[];
  /** Every field with its artwork — feeds the mobile filter cards' thumbnails. */
  industries: IndustryListItem[];
  query: PartnersQuery;
  /** Per-request slot created outside the cached data (reads the session). Passed through, never read. */
  userCard: ReactNode;
}

/**
 * The partners directory on the homepage shell: 300 · 600 · 300 at the same widths and
 * gaps, so moving between the two pages never moves the furniture. Filtering and sorting
 * run here, on the cached list, in memory — the URL is the only state.
 */
export function PageLayout({ partners, industries, query, userCard }: PageLayoutProps) {
  // Counted before the industry filter AND before «المميّزون», so neither one blanks out
  // the other's numbers — the filters have to stay usable after one click. Measured
  // 21 Aug: with `featuredOnly` folded in, «الكل» claimed «٨ شركاء» while being the very
  // link that returns to all 29, and every field's count shrank with no explanation.
  const searched = filterPartners(partners, { ...query, industry: "", featuredOnly: false });
  const industryRows = countIndustries(searched);
  const visible = sortPartners(filterPartners(partners, query));
  const industryName = industryRows.find((row) => row.slug === query.industry)?.name ?? null;

  return (
    <>
    <ThreeColumnLayout
      right={<RightSidebar rows={industryRows} total={searched.length} query={query} />}
      center={
        <>
          {/* MOBILE (<1240px): everything the rails carry is `hidden` there — so a phone
              visitor had no trust context and no way to filter 22 partners at all
              (Khalid, 21 Aug). Both come back here, above the list, and disappear again
              at 1240 where the rails take over. */}
          <div className="space-y-3 min-[1240px]:hidden">
            {/* The three doors stretched edge to edge (Khalid, 23 Aug: «make them stretch
                all in the div and add descriptive title and catchy word») — each tile is
                mark + name + one pulling line: the trust story, the whole directory, and
                the «المميّزون» filter that was the big amber card; same URL toggles. */}
            <div className="flex items-stretch gap-2">
              <TrustStripMobile />
              <Link
                href={buildPartnersHref(query, { industry: "", featuredOnly: false })}
                aria-current={!query.industry && !query.featuredOnly ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-2 py-2 text-primary-foreground motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  !query.industry && !query.featuredOnly && "ring-2 ring-primary ring-offset-2",
                )}
              >
                {/* The brand «M» with its diamond (Khalid, 23 Aug: «use this icon») — the
                    diamond keeps its accent teal over the primary ground. */}
                <ModontyPartnerMark className="h-6 w-6 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-bold leading-tight">كل الشركاء</span>
                  <span className="mt-0.5 block text-[10px] leading-none opacity-80">{formatClientsCount(searched.length)}</span>
                </span>
              </Link>
              <Link
                href={buildPartnersHref(query, { featuredOnly: !query.featuredOnly, industry: "" })}
                aria-current={query.featuredOnly ? "page" : undefined}
                className={cn(
                  // Lighter ground under the dark mark (Khalid, 23 Aug: «fix the color
                  // contrast, make background lighter») — the 400→500 amber swallowed it.
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 px-2 py-2 text-amber-950 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  query.featuredOnly && "ring-2 ring-amber-500 ring-offset-2",
                )}
              >
                <ModontyFeaturedMark className="h-6 w-6 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-bold leading-tight">المميّزون</span>
                  <span className="mt-0.5 block text-[10px] leading-none text-amber-800">نخبة الشركاء</span>
                </span>
              </Link>
            </div>
            <PartnersFilterBar rows={industryRows} industries={industries} query={query} />
          </div>
          {/* The search pill is desktop-only now (Khalid, 21 Aug: «remove») — the navbar
              already carries a search on a phone, and the field cards above are the
              faster way in. Hidden, not deleted; ≥1240px it is unchanged. */}
          <div className="hidden min-[1240px]:block">
            <PartnersBar query={query} />
          </div>
          <PartnersList
            partners={visible}
            industryCount={countIndustries(visible).length}
            industryName={industryName}
            query={query}
          />
        </>
      }
      left={<LeftSidebar userCard={userCard} />}
    />
    {/* This page's own two asks (Khalid, 21 Aug): «احجز» was the wrong bar here — every
        card already books at a NAMED partner, while the bar could only offer a generic
        booking page. The bar now carries what the cards cannot: joining as a partner,
        and browsing by field. Filtering premium lives with the filters above. */}
    <MobileCtaBar
      ariaLabel="صِر شريكاً أو تصفّح المجالات"
      primary={{ href: "https://www.jbrseo.com", label: "صِر شريكاً", icon: ModontyPartnerMark, external: true }}
      secondary={{ href: "/industries", label: "المجالات", icon: ModontyIndustriesMark }}
    />
    </>
  );
}
