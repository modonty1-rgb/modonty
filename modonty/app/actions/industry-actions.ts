"use server";

import { getIndustriesPage } from "@/app/api/helpers/industry-queries";
import type { IndustryQueryOptions } from "@/lib/types";
import type { EntityCardProps } from "@/components/shared/EntityCard";

/**
 * `options` is bound via loadMoreIndustries.bind(null, { search, sortBy }) in the
 * Server Component so the Client Component only has to pass `page`.
 * Industry cards use the partner count as the headline number (articleCount slot).
 */
export async function loadMoreIndustries(
  options: IndustryQueryOptions,
  page: number
): Promise<{ items: EntityCardProps[]; hasMore: boolean }> {
  try {
    const { items, hasMore } = await getIndustriesPage(page, options);

    const cards: EntityCardProps[] = items.map((industry) => ({
      type: "industry",
      name: industry.name,
      slug: industry.slug,
      imageUrl: industry.socialImage,
      imageAlt: industry.socialImageAlt,
      articleCount: industry.clientCount,
      clientPreviews: industry.clientPreviews,
      clientCount: industry.clientCount,
    }));

    return { items: cards, hasMore };
  } catch (error) {
    console.error("[loadMoreIndustries] Error:", error);
    return { items: [], hasMore: false };
  }
}
