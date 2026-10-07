import { z } from "zod";

import { getSearchResults } from "@/app/(site)/search/helpers/get-search-results";
import { handle, ok, PUBLIC_CACHE_SHORT } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  q: z.string().trim().min(2).max(100),
  type: z.enum(["all", "articles", "partners"]).default("all"),
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  sortArticles: z.enum(["newest", "oldest", "title"]).default("newest"),
  sortPartners: z
    .enum(["name-asc", "name-desc", "articles-desc", "articles-asc", "newest", "oldest"])
    .default("name-asc"),
});

/**
 * S1 — GET /api/mobile/v1/search?q&type&page&sortArticles&sortPartners · public.
 * `getSearchResults` — exactly what `/search` shows: articles 20 a page, partners top 10.
 */
export const GET = handle("search", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { q, type, page, sortArticles, sortPartners } = query.value;

  const { posts, clients, total, totalPages } = await getSearchResults({
    q,
    scope: type === "partners" ? "clients" : type,
    sortArticles,
    sortClients: sortPartners,
    page,
  });

  return ok(
    {
      articles: { items: posts, page, total, totalPages, hasMore: page < totalPages },
      partners: clients,
    },
    PUBLIC_CACHE_SHORT,
  );
});
