import { z } from "zod";

import { getTrendingArticles } from "@/app/(site)/trending/helpers/get-trending-articles";
import { handle, ok, PUBLIC_CACHE_SHORT } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

/** The page's own choices (`trending/page.tsx`): 7, 14 or 30 days, 12 articles. */
const TRENDING_LIMIT = 12;

const querySchema = z.object({
  days: z.coerce.number().pipe(z.union([z.literal(7), z.literal(14), z.literal(30)])).default(7),
});

/**
 * C19 — GET /api/mobile/v1/trending?days=7|14|30 · public.
 * `getTrendingArticles(12, days)` — what `/trending` renders: published articles of the period
 * ranked by the time-weighted score (`calculate-trending-score.ts`). The function is not
 * `"use cache"` (React `cache` only), so the CDN holds it a short minute, not five.
 */
export const GET = handle("trending", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { days } = query.value;
  const items = await getTrendingArticles(TRENDING_LIMIT, days);
  return ok({ items, days }, PUBLIC_CACHE_SHORT);
});
