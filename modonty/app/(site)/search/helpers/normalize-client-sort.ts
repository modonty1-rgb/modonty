import type { ClientSortOption } from "./client-order-by";

const CLIENT_SORT_OPTIONS: ClientSortOption[] = [
  "name-asc",
  "name-desc",
  "articles-desc",
  "articles-asc",
  "newest",
  "oldest",
];

export function normalizeClientSort(s: unknown): ClientSortOption {
  return typeof s === "string" && CLIENT_SORT_OPTIONS.includes(s as ClientSortOption)
    ? (s as ClientSortOption)
    : "name-asc";
}
