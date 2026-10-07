import { z } from "zod";

import { getMoreArticles } from "@/app/(site)/(homepage)/data/get-more-articles";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  category: z.string().trim().max(200).optional(),
  client: z.string().trim().max(200).optional(),
  view: z.enum(["latest", "popular", "audio"]).optional(),
});

/**
 * C2 — GET /api/mobile/v1/articles?page&category&client&view · public.
 * The homepage feed's pages (and a partner's / category's feed) — `getMoreArticles`, the function
 * the web's infinite scroll calls. Offset pages: the order is editorial (admin picks first).
 */
export const GET = handle("articles", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page, category, client, view } = query.value;
  const result = await getMoreArticles(page, category, client, view);
  return ok({ items: result.articles, page, hasMore: result.hasMore }, PUBLIC_CACHE);
});
