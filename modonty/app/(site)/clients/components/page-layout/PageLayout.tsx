import type { ReactNode } from "react";
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
            <TrustStripMobile />
            <PartnersFilterBar
              rows={industryRows}
              featuredCount={searched.filter((partner) => partner.isFeatured).length}
              industries={industries}
              query={query}
            />
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
