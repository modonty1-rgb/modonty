import { z } from "zod";

import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { loadPartnerHome } from "@/lib/mobile-api/load-partner-home";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const PAGE_SIZE = 20;
const ARTICLE_PATH = "/articles/";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
});

/**
 * C13 — GET /api/mobile/v1/partners/:slug/articles?page · public.
 * What `/clients/[slug]/articles` renders: the «posts» block of `getCachedHomeData` (shared
 * `getHomeData`, newest first, up to 60 — `shared/lib/partner-site/get-home-data.ts`). The web
 * shows them on one page; here they come in pages of 20. `date` is the web's display string
 * (Gregorian, month in words), not an ISO date. `slug` is read off the post's own link.
 */
export const GET = handle("partner-articles", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const loaded = await loadPartnerHome((await params).ref);
  if ("response" in loaded) return loaded.response;

  const { page } = query.value;
  const all = loaded.value.home.posts;
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE).map((p) => ({
    title: p.title,
    slug: p.href.startsWith(ARTICLE_PATH) ? p.href.slice(ARTICLE_PATH.length) : p.href,
    imageUrl: p.imageUrl,
    date: p.date,
    excerpt: p.excerpt,
    category: p.category,
  }));
  return ok({ items, page, hasMore: start + PAGE_SIZE < all.length, total: all.length }, PUBLIC_CACHE);
});
