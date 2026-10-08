import { z } from "zod";

import { getIndustryBySlug } from "@/app/(site)/industries/helpers/get-industry-by-slug";
import { getIndustryFeed } from "@/app/(site)/industries/data/get-industry-feed";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
});

/**
 * C10b — GET /api/mobile/v1/industries/:slug?page · public.
 * What `/industries/[slug]` renders: the industry, its feed (`getIndustryFeed`, sliced by
 * `FEED_PAGE_SIZE` exactly as `ArticlesFeed` slices it) and its partners (`getClientsList`
 * filtered by industry, as the page filters it).
 */
export const GET = handle("industry", async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const slug = decodeSlug((await params).slug);
  if (!slug) return fail("NOT_FOUND", MESSAGES.industryNotFound);

  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page } = query.value;

  const industry = await getIndustryBySlug(slug);
  if (!industry) return fail("NOT_FOUND", MESSAGES.industryNotFound);

  const [articles, allPartners] = await Promise.all([getIndustryFeed(industry.id), getClientsList()]);
  const partners = allPartners.filter((partner) => partner.industry?.slug === slug);

  const start = (page - 1) * FEED_PAGE_SIZE;
  const items = articles.slice(start, start + FEED_PAGE_SIZE);

  return ok(
    {
      industry: {
        id: industry.id,
        name: industry.name,
        slug: industry.slug,
        description: industry.description ?? null,
        socialImage: industry.socialImage ?? null,
        socialImageAlt: industry.socialImageAlt ?? null,
      },
      articles: { items, page, hasMore: articles.length > start + items.length },
      partners,
    },
    PUBLIC_CACHE,
  );
});
