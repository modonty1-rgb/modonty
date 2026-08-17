import type { ClientListItem } from "@/lib/queries/get-clients-list";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";

/** Arabic hamza and yaa are typed several ways; folding them makes «احمد» find «أحمد». */
function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ً-ْ]/g, "");
}

/**
 * The two filters the URL can carry, applied to the cached list in memory: the industry
 * picked in the rail, and the free text typed in the bar (name · description · industry ·
 * city).
 */
export function filterPartners(partners: ClientListItem[], query: PartnersQuery): ClientListItem[] {
  const needle = fold(query.q);

  return partners.filter((partner) => {
    if (query.industry && partner.industry?.slug !== query.industry) return false;
    if (!needle) return true;

    const haystack = fold(
      [partner.name, partner.description, partner.industry?.name, partner.city].filter(Boolean).join(" "),
    );
    return haystack.includes(needle);
  });
}
