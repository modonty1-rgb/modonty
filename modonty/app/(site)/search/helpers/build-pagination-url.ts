import type { SearchScope, ArticleSortOption } from "./get-search-results";
import type { ClientSortOption } from "./client-order-by";

export function buildPaginationUrl(
  query: string,
  scope: SearchScope,
  sortArticles: ArticleSortOption,
  sortClients: ClientSortOption,
  page: number
): string {
  const q = encodeURIComponent(query);
  const type = scope !== "all" ? `&type=${scope}` : "";
  const sortArticlesParam = sortArticles !== "newest" ? `&sort_articles=${sortArticles}` : "";
  const sortClientsParam = sortClients !== "name-asc" ? `&sort_clients=${sortClients}` : "";
  const pageParam = page !== 1 ? `&page=${page}` : "";
  return `/search?q=${q}${type}${sortArticlesParam}${sortClientsParam}${pageParam}`;
}
