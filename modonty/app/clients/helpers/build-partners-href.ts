import type { PartnersQuery } from "@/app/clients/helpers/parse-partners-query";

/**
 * `/clients` with one part of the query changed and the rest kept — so picking an
 * industry does not silently drop the search text, and searching does not drop the
 * industry. Defaults are left out of the URL, so «الكل» is a clean `/clients`.
 */
export function buildPartnersHref(current: PartnersQuery, patch: Partial<PartnersQuery>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.industry) params.set("industry", next.industry);
  // Any change of filter starts the list over — page 3 of the old result set means
  // nothing in the new one. Only an explicit page patch survives.
  if (patch.page && patch.page > 1) params.set("page", String(patch.page));

  const query = params.toString();
  return query ? `/clients?${query}` : "/clients";
}
