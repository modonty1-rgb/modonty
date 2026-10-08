import { mediaSrc } from "@modonty/shared/lib/media-src";

import { getTagPageData } from "@/app/(site)/tags/[slug]/data/get-tag-page-data";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { fail, handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { CONTENT_MESSAGES } from "@/lib/mobile-api/messages-content";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C9 — GET /api/mobile/v1/tags/:slug · public.
 * What `/tags/[slug]` renders (`getTagPageData`, moved out of the page unchanged) — the tag, its
 * partners (the same card fields: rating average, GA4 total, article count) and how many
 * articles carry it. The page lists partners, not articles; its «اقرأ المقالات» link opens the
 * archive filtered by tag — for the app that is `GET /articles/archive?tag=<slug>`, exactly as
 * `/categories/:slug` does it.
 */
export const GET = handle("tag", async (_request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const slug = decodeSlug((await params).slug);
  if (!slug) return fail("NOT_FOUND", CONTENT_MESSAGES.tagNotFound);

  const data = await getTagPageData(slug, await getCoreClientId());
  if (!data) return fail("NOT_FOUND", CONTENT_MESSAGES.tagNotFound);

  const { tag, clients, articleCount, ga4Stats, ratingMap } = data;
  return ok(
    {
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description ?? null,
        socialImage: tag.socialImage ?? null,
        socialImageAlt: tag.socialImageAlt ?? null,
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
