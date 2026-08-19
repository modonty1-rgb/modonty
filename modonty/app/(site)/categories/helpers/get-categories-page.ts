import type { CategoryResponse, CategoryQueryOptions } from "@/lib/types";
import { CATEGORIES_PAGE_SIZE } from "./categories-page-size";
import { getCategoriesEnhanced } from "./get-categories-enhanced";

export async function getCategoriesPage(
  page: number,
  options: CategoryQueryOptions = {}
): Promise<{ items: CategoryResponse[]; hasMore: boolean; total: number }> {
  const all = await getCategoriesEnhanced(options);
  const start = (page - 1) * CATEGORIES_PAGE_SIZE;
  const items = all.slice(start, start + CATEGORIES_PAGE_SIZE);
  return { items, hasMore: start + CATEGORIES_PAGE_SIZE < all.length, total: all.length };
}
