import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";

// The four reads below moved here unchanged from `app/(site)/tags/[slug]/page.tsx` (7 Oct 2026)
// so the page and the reader mobile API read ONE source — same move as `/categories/[slug]`.

/**
 * The three reads the page body needs — cached, same fix as `/categories/[slug]` and for the
 * same reason the article page was fixed on 1 Sep 2026.
 *
 * They used to sit in a `Promise.all` at the root of `TagPage`: uncached database calls awaited
 * before a single byte could render, outside any `<Suspense>`. The docs shipped with this
 * version (`node_modules/next/dist/docs/01-app/02-guides/building.md:111`) say data accessed
 * outside a boundary «prevents the route from being prerendered, blocking the page load» —
 * the shape that took the article page down.
 *
 * All three are safely cacheable: a tag, the partners publishing under it, and their review
 * averages change on publish or on a new review, and both fire `revalidateTag`.
 */
async function getTagBySlug(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      jsonLdStructuredData: true,
    },
  });
}

async function getTagClients(slug: string, coreClientId: string | null) {
  "use cache";
  cacheTag("tags");
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      ...(coreClientId ? { id: { not: coreClientId } } : {}),
      articles: {
        some: {
          status: ArticleStatus.PUBLISHED,
          tags: { some: { tag: { slug } } },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      phone: true,
      addressCity: true,
      slogan: true,
      _count: { select: { articles: true } },
    },
  });
}

/** Review averages for the listed partners, keyed by the id list. */
async function getClientsRatings(clientIds: string[]) {
  "use cache";
  cacheTag("reviews");
  cacheLife("hours");
  if (clientIds.length === 0) return [];
  return db.clientReview.groupBy({
    by: ["clientId"],
    where: { clientId: { in: clientIds }, status: CommentStatus.APPROVED },
    _avg: { rating: true },
  });
}

// The count reads the clock (scheduled articles), and Next 16 forbids the current time in an
// uncached prerender scope — so it lives in its own cached function, like getTagForMetadata.
async function countTagArticles(slug: string) {
  "use cache";
  cacheTag("tags");
  cacheLife("hours");
  return db.article.count({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      tags: { some: { tag: { slug } } },
    },
  });
}

/**
 * Everything `/tags/[slug]` renders: the tag, the partners publishing under it (with their
 * review average and GA4 total), and how many articles carry it. `null` = no such tag.
 *
 * `coreClientId` (`getCoreClientId()`) is passed in: Modonty is the platform, not one of the
 * partners this page lists, and the page reads it outside its own error boundary.
 */
export async function getTagPageData(slug: string, coreClientId: string | null) {
  const [tag, clients, articleCount] = await Promise.all([
    getTagBySlug(slug),
    getTagClients(slug, coreClientId),
    // How many articles carry this tag — the read-link stays hidden at zero.
    countTagArticles(slug),
  ]);

  if (!tag) return null;

  const clientIds = clients.map((c) => c.id);

  const [ga4Stats, ratingsRaw] = await Promise.all([
    getClientsGA4Stats(),
    getClientsRatings(clientIds),
  ]);

  const ratingMap = new Map(ratingsRaw.map((r) => [r.clientId, r._avg.rating ?? 0]));

  return { tag, clients, articleCount, ga4Stats, ratingMap };
}
