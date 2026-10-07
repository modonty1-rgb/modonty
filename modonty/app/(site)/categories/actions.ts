"use server";

import { getCategoriesPage } from "./helpers/get-categories-page";
import { categoryToCard } from "./helpers/category-to-card";
import type { CategoryQueryOptions } from "@/lib/types";
import type { EntityCardProps } from "@/components/listing/EntityCard";

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

    const cards: EntityCardProps[] = items.map(categoryToCard);

    return { items: cards, hasMore };
  } catch (error) {
    console.error("[loadMoreCategories] Error:", error);
    return { items: [], hasMore: false };
  }
}
