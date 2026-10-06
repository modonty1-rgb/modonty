import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";

// The four reads below moved here unchanged from `app/(site)/categories/[slug]/page.tsx`
// (4 Oct 2026) so the page and the reader mobile API read ONE source.

// The count reads the clock (scheduled articles), and Next 16 forbids the current time in an
// uncached prerender scope — so it lives in its own cached function, like getCategoryForMetadata.
async function countCategoryArticles(slug: string) {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return db.article.count({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      category: { slug },
    },
  });
}

/**
 * The reads the page body needs — cached, for the same reason the article page was fixed on
 * 1 Sep 2026: uncached database calls awaited before a single byte could render, outside any
 * `<Suspense>`, held a healthy cached page hostage (next/dist/docs/01-app/02-guides/building.md).
 * A category, the partners publishing in it, and their review averages change on publish or on
 * a new review — both of which already fire `revalidateTag`.
 */
async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  return db.category.findUnique({
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

async function getCategoryClients(slug: string, coreClientId: string | null) {
  "use cache";
  cacheTag("categories");
  cacheTag("clients");
  cacheLife("hours");
  return db.client.findMany({
    where: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      ...(coreClientId ? { id: { not: coreClientId } } : {}),
      articles: {
        some: { status: ArticleStatus.PUBLISHED, category: { slug } },
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

/** Review averages for the listed partners. Keyed by the id list so a different page of
 *  partners gets its own entry rather than reusing another category's averages. */
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

/**
 * Everything `/categories/[slug]` renders: the category, the partners publishing in it (with
 * their review average and GA4 total), and how many articles it holds. `null` = no such category.
 *
 * `coreClientId` (`getCoreClientId()`) is passed in: Modonty is the platform, not one of the
 * partners this page lists, and the page reads it outside its own error boundary.
 */
export async function getCategoryPageData(slug: string, coreClientId: string | null) {
  const [category, clients, articleCount] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoryClients(slug, coreClientId),
    // How many articles this category actually holds — the read-link stays hidden at zero.
    countCategoryArticles(slug),
  ]);

  if (!category) return null;

  const clientIds = clients.map((c) => c.id);

  const [ga4Stats, ratingsRaw] = await Promise.all([
    getClientsGA4Stats(),
    getClientsRatings(clientIds),
  ]);

  const ratingMap = new Map(ratingsRaw.map((r) => [r.clientId, r._avg.rating ?? 0]));

  return { category, clients, articleCount, ga4Stats, ratingMap };
}
