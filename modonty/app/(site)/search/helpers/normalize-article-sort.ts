import type { ArticleSortOption } from "./get-search-results";

export function normalizeArticleSort(s: unknown): ArticleSortOption {
  return s === "oldest" || s === "title" ? s : "newest";
}
