import { z } from "zod";

import { getArticles } from "@/lib/queries/get-articles";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

/** The web page shows the first 5 (`getArticles({ limit: 5 })`); the app pages through 20 at a time. */
const NEWS_PAGE_SIZE = 20;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
});

/**
 * C19 — GET /api/mobile/v1/news?page · public.
 * `getArticles` — the read behind `/news`' «من أحدث المقالات على مدونتي»: published articles,
 * newest first, every publisher (the web page does not filter to Modonty's own), as
 * `ArticleResponse`.
 */
export const GET = handle("news", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page } = query.value;
  const { articles, pagination } = await getArticles({ page, limit: NEWS_PAGE_SIZE });
  return ok({ items: articles, page, hasMore: page < pagination.totalPages, total: pagination.total }, PUBLIC_CACHE);
});
