import { IndustryCards } from "@/components/shared/industry-cards/IndustryCards";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import { industryArtwork } from "@/lib/industry-artwork";
import type { IndustryFilterRow } from "@/app/(site)/clients/helpers/count-industries";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";
import type { IndustryListItem } from "@/lib/types";

interface PartnersFilterBarProps {
  rows: IndustryFilterRow[];
  /** Every field with its artwork — the counts still come from `rows`, which are counted
      from the partners actually on the page, so a card's number can never disagree with
      what clicking it shows. */
  industries: IndustryListItem[];
  query: PartnersQuery;
}

/**
 * The MOBILE filter (Khalid, 21 Aug: the page was «very poor» on a phone — every filter
 * lived in a rail that is `hidden` below 1240px, so a phone visitor could not narrow the
 * directory at all). The cards are the SAME tile `/industries` shows (Khalid, 23 Aug:
 * «use standard card in the industry page»); only the destination differs — there a card
 * opens the field, here it filters the list, and the lit card clears the filter.
 * «المميّزون» and «الكل» sit in the icon row above the strip (23 Aug).
 *
 * Plain links, so the choice lives in the URL: the filtered list stays shareable,
 * crawlable and JavaScript-free. The caller hides this ≥1240px where the rail takes over.
 */
export function PartnersFilterBar({ rows, industries, query }: PartnersFilterBarProps) {
  const artwork = new Map(industries.map((industry) => [industry.slug, industry]));

  return (
    <IndustryCards
      ariaLabel="تصفية بالمجال"
      items={rows.map((row) => ({
        name: row.name,
        slug: row.slug,
        count: row.count,
        image: industryArtwork(artwork.get(row.slug)?.socialImage),
        imageAlt: artwork.get(row.slug)?.socialImageAlt ?? null,
      }))}
      currentSlug={query.featuredOnly ? "__featured__" : query.industry}
      clearHref={buildPartnersHref(query, { industry: "" })}
      buildHref={(slug) => buildPartnersHref(query, { industry: slug })}
    />
  );
}
