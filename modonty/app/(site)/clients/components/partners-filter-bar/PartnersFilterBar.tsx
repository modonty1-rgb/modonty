import { IndustryCards } from "@/components/shared/industry-cards/IndustryCards";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import type { IndustryFilterRow } from "@/app/(site)/clients/helpers/count-industries";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";
import type { IndustryListItem } from "@/lib/types";

interface PartnersFilterBarProps {
  rows: IndustryFilterRow[];
  /** How many partners pay for the spotlight — drives the «المميّزون» filter card. */
  featuredCount: number;
  /** Every field with its artwork — the counts still come from `rows`, which are counted
      from the partners actually on the page, so a card's number can never disagree with
      what clicking it shows. */
  industries: IndustryListItem[];
  query: PartnersQuery;
}

/**
 * The MOBILE filter (Khalid, 21 Aug: the page was «very poor» on a phone — every filter
 * lived in a rail that is `hidden` below 1240px, so a phone visitor could not narrow the
 * directory at all). It is the SAME `IndustryCards` component `/industries` uses; only
 * the destination differs — there a card opens the field, here it filters the list.
 *
 * Plain links, so the choice lives in the URL: the filtered list stays shareable,
 * crawlable and JavaScript-free. The caller hides this ≥1240px where the rail takes over.
 */
export function PartnersFilterBar({ rows, featuredCount, industries, query }: PartnersFilterBarProps) {
  const artwork = new Map(industries.map((industry) => [industry.slug, industry]));

  return (
    <IndustryCards
      ariaLabel="تصفية بالمجال"
      featured={{
        href: buildPartnersHref(query, { featuredOnly: !query.featuredOnly, industry: "" }),
        count: featuredCount,
        isActive: query.featuredOnly,
      }}
      items={rows.map((row) => ({
        name: row.name,
        slug: row.slug,
        count: row.count,
        image: artwork.get(row.slug)?.socialImage ?? null,
        imageAlt: artwork.get(row.slug)?.socialImageAlt ?? null,
      }))}
      // «الكل» clears the field AND the featured filter — it is the way back.
      currentSlug={query.featuredOnly ? "__featured__" : query.industry}
      allHref={buildPartnersHref(query, { industry: "", featuredOnly: false })}
      buildHref={(slug) => buildPartnersHref(query, { industry: slug })}
    />
  );
}
