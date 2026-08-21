import Link from "next/link";
import { PartnerCard } from "@/components/shared/partner-card/PartnerCard";
import { PartnerCardMobile } from "@/components/shared/partner-card/PartnerCardMobile";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import { buttonVariants } from "@/components/ui/button";
import { messages, formatCount, fill } from "@/lib/i18n/messages";
import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";

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
        {/* The heading names what is on screen: filtering to «المميّزون» while the title
            still said «كل الشركاء» told the visitor the wrong thing (measured 21 Aug). */}
        <h1 id="partners-heading" className="text-base font-bold text-foreground">
          {query.featuredOnly
            ? industryName
              ? `الشركاء المميّزون في ${industryName}`
              : "الشركاء المميّزون"
            : industryName
              ? fill(text.headingByIndustry, { industry: industryName })
              : text.headingAllPartners}
        </h1>
        {partners.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatCount(partners.length, counts.partnersCount)} في {formatCount(industryCount, counts.industriesCount)}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        // The empty state names what the visitor actually did. Filtering «المميّزون» in a
        // field with none used to answer «ما لقينا أحد بهذا البحث — جرّب كلمة أقصر» to
        // someone who never typed a word (measured 21 Aug).
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            {query.featuredOnly && !query.q
              ? industryName
                ? `ما في شريك مميّز في ${industryName} بعد`
                : "ما في شركاء مميّزون بعد"
              : text.noResultsTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {query.featuredOnly && !query.q
              ? industryName
                ? "شوف كل شركاء هذا المجال، أو تصفّح الشركاء كلهم."
                : "تصفّح الشركاء كلهم."
              : text.noResultsHint}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {query.featuredOnly && industryName && (
              <Link
                href={buildPartnersHref(query, { featuredOnly: false })}
                className={buttonVariants({ variant: "outline", className: "min-h-11" })}
              >
                كل شركاء {industryName}
              </Link>
            )}
            <Link href="/clients" className={buttonVariants({ variant: "outline", className: "min-h-11" })}>
              {text.showAllPartnersButton}
            </Link>
          </div>
        </div>
      ) : (
        // Below 1240px the compact card: the full one ran ~300px each, so a phone showed
        // two partners per screen (measured 21 Aug). Desktop keeps the full card exactly.
        rows.map((partner) => (
          <div key={partner.id}>
            <div className="min-[1240px]:hidden">
              <PartnerCardMobile partner={partner} />
            </div>
            <div className="hidden min-[1240px]:block">
              <PartnerCard partner={partner} />
            </div>
          </div>
        ))
      )}

      {/* Crawlable chunk links, same shape as the articles feed: a real <a> at the true
          bottom, so a visitor who refreshed mid-list still has a way forward. */}
      {(query.page > 1 || hasMore) && (
        <nav aria-label={text.paginationNavAriaLabel} className="flex items-center justify-between gap-3 border-t border-border pt-4">
          {query.page > 1 ? (
            <Link href={buildPartnersHref(query, { page: query.page - 1 })} // 44px touch floor below the desktop breakpoint; ≥1240px the link keeps its old box.
              className="inline-flex items-center text-sm font-medium text-link hover:underline max-[1239px]:min-h-11">
              {text.previousPageLink}
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link href={buildPartnersHref(query, { page: query.page + 1 })} // 44px touch floor below the desktop breakpoint; ≥1240px the link keeps its old box.
              className="inline-flex items-center text-sm font-medium text-link hover:underline max-[1239px]:min-h-11">
              {text.nextPageLink}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
