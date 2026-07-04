"use server";

import { getCategoriesPage } from "@/app/api/helpers/category-queries";
import type { CategoryQueryOptions } from "@/lib/types";
import type { EntityCardProps } from "@/components/shared/EntityCard";

/**
 * `options` is bound via loadMoreCategories.bind(null, { search, sortBy }) in the
 * Server Component so the Client Component only has to pass `page`.
 */
export async function loadMoreCategories(
  options: CategoryQueryOptions,
  page: number
): Promise<{ items: EntityCardProps[]; hasMore: boolean }> {
  try {
    const { items, hasMore } = await getCategoriesPage(page, options);

    const cards: EntityCardProps[] = items.map((cat) => ({
      type: "category",
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.socialImage,
      imageAlt: cat.socialImageAlt,
      articleCount: cat.articleCount,
      recentArticleCount: cat.recentArticleCount,
      clientPreviews: cat.clientPreviews ?? [],
      clientCount: cat.clientCount ?? 0,
      digitalImpact: cat.digitalImpact,
    }));

    return { items: cards, hasMore };
  } catch (error) {
    console.error("[loadMoreCategories] Error:", error);
    return { items: [], hasMore: false };
  }
}
