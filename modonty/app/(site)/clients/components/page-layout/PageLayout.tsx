import type { ReactNode } from "react";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { RightSidebar } from "@/app/(site)/clients/components/right-sidebar/RightSidebar";
import { LeftSidebar } from "@/app/(site)/clients/components/left-sidebar/LeftSidebar";
import { PartnersBar } from "@/app/(site)/clients/components/partners-bar/PartnersBar";
import { PartnersList } from "@/app/(site)/clients/components/partners-list/PartnersList";
import { filterPartners } from "@/app/(site)/clients/helpers/filter-partners";
import { sortPartners } from "@/app/(site)/clients/helpers/sort-partners";
import { countIndustries } from "@/app/(site)/clients/helpers/count-industries";
import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";

interface PageLayoutProps {
  /** Every active partner, straight from the cached query. */
  partners: ClientListItem[];
  query: PartnersQuery;
  /** Per-request slot created outside the cached data (reads the session). Passed through, never read. */
  userCard: ReactNode;
}

/**
 * The partners directory on the homepage shell: 300 · 600 · 300 at the same widths and
 * gaps, so moving between the two pages never moves the furniture. Filtering and sorting
 * run here, on the cached list, in memory — the URL is the only state.
 */
export function PageLayout({ partners, query, userCard }: PageLayoutProps) {
  // Counted before the industry filter, so picking «الرعاية الصحية» does not blank out
  // every other row's number — the rail has to stay usable after one click.
  const searched = filterPartners(partners, { ...query, industry: "" });
  const industryRows = countIndustries(searched);
  const visible = sortPartners(filterPartners(partners, query));
  const industryName = industryRows.find((row) => row.slug === query.industry)?.name ?? null;

  return (
    <ThreeColumnLayout
      right={<RightSidebar rows={industryRows} total={searched.length} query={query} />}
      center={
        <>
          <PartnersBar query={query} />
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
  );
}
