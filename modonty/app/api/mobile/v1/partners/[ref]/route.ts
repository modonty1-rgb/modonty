import { mediaSrc } from "@modonty/shared/lib/media-src";

import { getPartnerSite } from "@/app/(partner)/clients/[slug]/helpers/get-partner-site";
import { getCachedHomeData } from "@/app/(partner)/clients/[slug]/helpers/get-cached-home-data";
import { getClientStats } from "@/app/(partner)/clients/[slug]/helpers/client-stats";
import { fail, handle, MESSAGES, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

/**
 * C12 — GET /api/mobile/v1/partners/:slug · public.
 * The partner page from the reads `/clients/[slug]` renders from: identity and contact
 * (`getPartnerSite`), every block's data — about, services, team, credentials, reviews, gallery,
 * FAQ, articles, reels, hours (`getCachedHomeData`, the object the console preview shares), and
 * the follower/view totals (`getClientStats`). Only ACTIVE partners exist here, as on the web.
 *
 * Projected: the site row also carries internal theme keys and brand guidelines — not for the wire.
 */
export const GET = handle("partner", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const site = await getPartnerSite(slug);
  if (!site) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const [home, stats] = await Promise.all([getCachedHomeData(slug), getClientStats(site.id)]);

  return ok(
    {
      partner: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        seoTitle: site.seoTitle ?? null,
        slogan: site.slogan ?? null,
        description: site.description ?? null,
        seoDescription: site.seoDescription ?? null,
        logo: mediaSrc(site.logoMedia) ?? null,
        hero: mediaSrc(site.heroImageMedia) ?? null,
        industry: site.industry?.name ?? null,
        isVerified: site.isVerified,
        phone: site.phone ?? null,
        email: site.email ?? null,
        url: site.url ?? null,
        sameAs: site.sameAs,
        address: {
          street: site.addressStreet ?? null,
          neighborhood: site.addressNeighborhood ?? null,
          city: site.addressCity ?? null,
          latitude: site.addressLatitude ?? null,
          longitude: site.addressLongitude ?? null,
        },
        foundingDate: site.foundingDate ?? null,
        legalName: site.legalName ?? null,
        cta: { mode: site.ctaMode, label: site.ctaLabel ?? null, url: site.ctaUrl ?? null },
        counts: {
          articles: site._count.articles,
          reviews: site._count.reviews,
          faqs: site._count.clientFaqs,
          gallery: site._count.media,
        },
      },
      home: home?.data ?? null,
      hiddenSections: home?.hiddenSections ?? [],
      stats,
    },
    PUBLIC_CACHE,
  );
});
