import type { SearchScope } from "./get-search-results";

export function normalizeScope(type: unknown): SearchScope {
  return type === "clients" ? "clients" : type === "articles" ? "articles" : "all";
}
