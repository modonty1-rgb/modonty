import Link from "next/link";
import { PartnerCard } from "@/components/shared/partner-card/PartnerCard";
import { buildPartnersHref } from "@/app/clients/helpers/build-partners-href";
import { buttonVariants } from "@/components/ui/button";
import { messages, formatCount, fill } from "@/lib/i18n/messages";
import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { PartnersQuery } from "@/app/clients/helpers/parse-partners-query";

const text = messages.clients.partnersList;
const counts = messages.clients.counts;

/** Cards per chunk. Small enough that «التالية» is a real page, not a formality. */
const PAGE_SIZE = 12;

interface PartnersListProps {
  /** Already filtered and sorted — this component only chunks and draws. */
  partners: ClientListItem[];
  /** How many industries the visible partners cover — the line under the title. */
  industryCount: number;
  /** The industry name when one is picked, so the h1 says what the visitor is looking at. */
  industryName: string | null;
  query: PartnersQuery;
}

export function PartnersList({ partners, industryCount, industryName, query }: PartnersListProps) {
  const start = (query.page - 1) * PAGE_SIZE;
  const rows = partners.slice(start, start + PAGE_SIZE);
  const hasMore = partners.length > start + PAGE_SIZE;

  return (
    <section aria-labelledby="partners-heading" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 id="partners-heading" className="text-base font-bold text-foreground">
          {industryName ? fill(text.headingByIndustry, { industry: industryName }) : text.headingAllPartners}
        </h1>
        {partners.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatCount(partners.length, counts.partnersCount)} في {formatCount(industryCount, counts.industriesCount)}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">{text.noResultsTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{text.noResultsHint}</p>
          <Link href="/clients" className={buttonVariants({ variant: "outline", className: "mt-4 min-h-11" })}>
            {text.showAllPartnersButton}
          </Link>
        </div>
      ) : (
        rows.map((partner) => <PartnerCard key={partner.id} partner={partner} />)
      )}

      {/* Crawlable chunk links, same shape as the articles feed: a real <a> at the true
          bottom, so a visitor who refreshed mid-list still has a way forward. */}
      {(query.page > 1 || hasMore) && (
        <nav aria-label={text.paginationNavAriaLabel} className="flex items-center justify-between gap-3 border-t border-border pt-4">
          {query.page > 1 ? (
            <Link href={buildPartnersHref(query, { page: query.page - 1 })} className="text-sm font-medium text-link hover:underline">
              {text.previousPageLink}
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={buildPartnersHref(query, { page: query.page + 1 })} className="text-sm font-medium text-link hover:underline">
              {text.nextPageLink}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
