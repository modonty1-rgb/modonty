import { mediaSrc } from "@modonty/shared/lib/media-src";

import { getCategoryPageData } from "@/lib/categories/get-category-page-data";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C8 — GET /api/mobile/v1/categories/:slug · public.
 * What `/categories/[slug]` renders — the category, its partners (the same card fields:
 * rating average, GA4 total, article count) and how many articles it holds. Its articles are
 * the archive filtered by category: `GET /articles/archive?category=<slug>`, the same link the
 * page's «اقرأ المقالات» opens.
 */
export const GET = handle("category", async (_request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const slug = decodeSlug((await params).slug);
  if (!slug) return fail("NOT_FOUND", MESSAGES.categoryNotFound);

  const data = await getCategoryPageData(slug, await getCoreClientId());
  if (!data) return fail("NOT_FOUND", MESSAGES.categoryNotFound);

  const { category, clients, articleCount, ga4Stats, ratingMap } = data;
  return ok(
    {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? null,
        socialImage: category.socialImage ?? null,
        socialImageAlt: category.socialImageAlt ?? null,
      },
      articleCount,
      partners: clients.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: mediaSrc(c.logoMedia) ?? null,
        hero: mediaSrc(c.heroImageMedia) ?? null,
        slogan: c.slogan ?? null,
        city: c.addressCity ?? null,
        phone: c.phone ?? null,
        averageRating: ratingMap.get(c.id) ?? 0,
        articleCount: c._count.articles,
        googleTotal: ga4Stats[c.slug]?.total ?? 0,
      })),
    },
    PUBLIC_CACHE,
  );
});
