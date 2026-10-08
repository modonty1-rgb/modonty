import { z } from "zod";

import { getArticlesArchive } from "@/lib/articles/archive/get-articles-archive";
import { getArticlesFilters } from "@/lib/articles/archive/get-articles-filters";
import { filterByReadingTime } from "@/lib/articles/archive/reading-time-buckets";
import { ARCHIVE_PAGE_SIZE } from "@/app/(site)/articles/helpers/archive-page-size";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  sort: z.enum(["newest", "mostRead", "mostEngaged"]).optional(),
  time: z.enum(["short", "medium", "long"]).optional(),
  industry: z.string().trim().max(200).optional(),
  category: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(200).optional(),
  search: z.string().trim().max(100).optional(),
  modonty: z.enum(["1"]).optional(),
  withFilters: z.enum(["1"]).optional(),
});

/**
 * C3 — GET /api/mobile/v1/articles/archive · public.
 * `/articles` with its filters — the same three steps `articles/api/list/route.ts` takes:
 * `getArticlesArchive` → `filterByReadingTime` → slice by `ARCHIVE_PAGE_SIZE`.
 * `withFilters=1` adds the filter options (`getArticlesFilters`) for the first screen.
 */
export const GET = handle("articles-archive", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const q = query.value;

  const [matches, filters] = await Promise.all([
    getArticlesArchive({
      coreOnly: q.modonty === "1",
      industrySlug: q.industry,
      categorySlug: q.category,
      tagSlug: q.tag,
      search: q.search,
      sort: q.sort,
    }),
    q.withFilters === "1" ? getArticlesFilters() : Promise.resolve(undefined),
  ]);

  const articles = filterByReadingTime(matches, q.time);
  const start = (q.page - 1) * ARCHIVE_PAGE_SIZE;
  const items = articles.slice(start, start + ARCHIVE_PAGE_SIZE);

  return ok(
    { items, page: q.page, hasMore: articles.length > start + items.length, ...(filters ? { filters } : {}) },
    PUBLIC_CACHE,
  );
});
