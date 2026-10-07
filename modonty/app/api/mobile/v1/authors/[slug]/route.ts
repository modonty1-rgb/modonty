import { z } from "zod";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { getAuthorArticles, AUTHOR_PAGE_SIZE } from "@/app/(site)/authors/[slug]/data/get-author-articles";
import { getAuthorBySlug } from "@/app/(site)/authors/[slug]/data/get-author-by-slug";
import { MODONTY_AUTHOR_SLUG } from "@/constants";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { fail, handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { CONTENT_MESSAGES } from "@/lib/mobile-api/messages-content";
import { decodeSlug } from "@/lib/mobile-api/params";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
});

/**
 * C18 — GET /api/mobile/v1/authors/:slug?page · public.
 * What `/authors/[slug]` renders, from the two reads moved out of the page unchanged:
 * `getAuthorBySlug` (the profile) and `getAuthorArticles` (20 per page, the 21st row = «more»).
 * The platform-brand author (`MODONTY_AUTHOR_SLUG`) also carries the platform's official
 * channels (`getPlatformSocialLinks`), as the page's publisher header does.
 *
 * Projected: the row also carries SEO title/description, canonical, stored JSON-LD and metadata
 * blobs — not for the wire. The email is public on the page (its «تواصل» mailto link).
 */
export const GET = handle("author", async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const slug = decodeSlug((await params).slug);
  if (!slug) return fail("NOT_FOUND", CONTENT_MESSAGES.authorNotFound);

  const author = await getAuthorBySlug(slug);
  if (!author) return fail("NOT_FOUND", CONTENT_MESSAGES.authorNotFound);

  const { page } = query.value;
  const isOrg = author.slug === MODONTY_AUTHOR_SLUG;
  const [chunk, socialLinks] = await Promise.all([
    getAuthorArticles(author.id, page),
    isOrg ? getPlatformSocialLinks() : Promise.resolve([]),
  ]);

  return ok(
    {
      author: {
        id: author.id,
        name: author.name,
        slug: author.slug,
        firstName: author.firstName ?? null,
        lastName: author.lastName ?? null,
        bio: author.bio ?? null,
        image: author.image ?? null,
        imageAlt: author.imageAlt ?? null,
        url: author.url ?? null,
        jobTitle: author.jobTitle ?? null,
        verified: author.verificationStatus,
        email: author.email ?? null,
        linkedIn: author.linkedIn ?? null,
        twitter: author.twitter ?? null,
        facebook: author.facebook ?? null,
        sameAs: author.sameAs,
        credentials: author.credentials,
        expertiseAreas: author.expertiseAreas,
        memberOf: author.memberOf,
      },
      isOrganization: isOrg,
      socialLinks,
      articles: chunk.slice(0, AUTHOR_PAGE_SIZE).map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        datePublished: a.datePublished,
        image: mediaSrc(a.featuredImage) ?? null,
        imageBlur: a.featuredImage?.blurDataURL ?? null,
        imageAlt: a.featuredImage?.altText ?? null,
      })),
      page,
      hasMore: chunk.length > AUTHOR_PAGE_SIZE,
    },
    PUBLIC_CACHE,
  );
});
