import { z } from "zod";

import { getTagsPage } from "@/app/(site)/tags/helpers/get-tags-page";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  search: z.string().trim().max(100).optional(),
  // `TagQueryOptions.sortBy` (tags/helpers/tag-types.ts) — default "articles", as on the web.
  sort: z.enum(["name", "articles", "trending"]).optional(),
});

/**
 * C9 — GET /api/mobile/v1/tags?search&sort&page · public.
 * `getTagsPage` — the same 20-item chunks of `getTagsEnhanced` that `loadMoreTags` serves the
 * web list (`tags/actions.ts`).
 */
export const GET = handle("tags", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page, search, sort } = query.value;
  const { items, hasMore, total } = await getTagsPage(page, { search, sortBy: sort });
  return ok({ items, page, hasMore, total }, PUBLIC_CACHE);
});
