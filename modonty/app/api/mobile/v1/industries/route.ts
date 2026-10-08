import { z } from "zod";

import { getIndustriesPage } from "@/app/(site)/industries/helpers/get-industries-page";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["clients", "name"]).optional(),
});

/**
 * C10a — GET /api/mobile/v1/industries?search&sort&page · public.
 * `getIndustriesPage` — the chunks `loadMoreIndustries` serves the web list.
 */
export const GET = handle("industries", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page, search, sort } = query.value;
  const { items, hasMore, total } = await getIndustriesPage(page, { search, sortBy: sort });
  return ok({ items, page, hasMore, total }, PUBLIC_CACHE);
});
