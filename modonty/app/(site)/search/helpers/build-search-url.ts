import type { SearchScope, ArticleSortOption } from "./get-search-results";
import type { ClientSortOption } from "./client-order-by";

export function buildSearchUrl(
  query: string,
  scope: SearchScope,
  sortArticles: ArticleSortOption,
  sortClients: ClientSortOption,
  overrides: { sort_articles?: ArticleSortOption; sort_clients?: ClientSortOption; page?: number } = {}
): string {
  const q = encodeURIComponent(query);
  const type = scope !== "all" ? `&type=${scope}` : "";
  const sa = overrides.sort_articles ?? sortArticles;
  const sc = overrides.sort_clients ?? sortClients;
  const sortArticlesParam = sa !== "newest" ? `&sort_articles=${sa}` : "";
  const sortClientsParam = sc !== "name-asc" ? `&sort_clients=${sc}` : "";
  const pageParam = overrides.page !== undefined && overrides.page !== 1 ? `&page=${overrides.page}` : "";
  return `/search?q=${q}${type}${sortArticlesParam}${sortClientsParam}${pageParam}`;
}
