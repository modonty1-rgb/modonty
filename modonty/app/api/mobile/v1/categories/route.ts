import { z } from "zod";

import { getCategoriesPage } from "@/app/(site)/categories/helpers/get-categories-page";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["name", "articles", "trending", "recent"]).optional(),
});

/**
 * C7 — GET /api/mobile/v1/categories?search&sort&page · public.
 * `getCategoriesPage` — the same chunks `loadMoreCategories` serves the web list.
 */
export const GET = handle("categories", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page, search, sort } = query.value;
  const { items, hasMore, total } = await getCategoriesPage(page, { search, sortBy: sort });
  return ok({ items, page, hasMore, total }, PUBLIC_CACHE);
});
