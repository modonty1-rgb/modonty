import type { ClientListItem } from "@/lib/queries/get-clients-list";

export interface IndustryFilterRow {
  name: string;
  slug: string;
  count: number;
}

/**
 * The industry rows of the rail filter, counted from the partners already on the page —
 * not from a second query. That way the number beside «الرعاية الصحية» can never
 * disagree with how many cards clicking it actually shows.
 */
export function countIndustries(partners: ClientListItem[]): IndustryFilterRow[] {
  const rows = new Map<string, IndustryFilterRow>();

  for (const partner of partners) {
    const industry = partner.industry;
    if (!industry) continue;
    const row = rows.get(industry.slug);
    if (row) row.count += 1;
    else rows.set(industry.slug, { name: industry.name, slug: industry.slug, count: 1 });
  }

  return [...rows.values()].sort((first, second) => second.count - first.count || first.name.localeCompare(second.name, "ar"));
}
