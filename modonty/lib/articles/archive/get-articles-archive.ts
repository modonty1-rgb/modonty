import { cacheTag, cacheLife } from "next/cache";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { safeLiteralSearch } from "@/lib/search/safe-literal-search";

import type { FeedPost } from "@/lib/types";

/**
 * A row plus what makes it trustworthy. Kept local instead of widening the shared `FeedPost`:
 * only this page renders trust marks, and a field nobody else fills is a field that goes stale.
 */
export type ArchiveArticle = FeedPost & {
  /** The partner's official papers were checked. */
  verified: boolean;
  /** A named licence or accreditation, when there is one. */
  credential: string | null;
};

/** The three orders the visitor can pick. Anything else falls back to newest. */
export type ArchiveSort = "newest" | "mostRead" | "mostEngaged";

export interface ArchiveQuery {
  coreOnly?: boolean;
  industrySlug?: string;
  categorySlug?: string;
  tagSlug?: string;
  /** Free text over title and excerpt — the rail search box. */
  search?: string;
  sort?: ArchiveSort;
}

/**
 * One bounded read, sliced per page — the same shape `/clients` and `/industries` use. At 117
 * published articles a skip/take round-trip per page costs more than it saves, and the whole
 * result is cached under the `articles` tag anyway.
 */
const MAX_ARCHIVE_ARTICLES = 300;

const archiveSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  seoDescription: true,
  datePublished: true,
  createdAt: true,
  readingTimeMinutes: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      // شارة التوثيق — خانةُ الأدمن وحدها منذ ١٧ سبتمبر. كانت تُشتقّ من verificationImageUrl،
      // أي من صورةٍ يرفعها العميل بنفسه لا من فحصٍ منّا.
      isVerified: true,
      credentials: { select: { name: true } },
    },
  },
  featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
  audioUrl: true,
  likesCount: true,
  commentsCount: true,
  favoritesCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;

type ArchivePayload = Prisma.ArticleGetPayload<{ select: typeof archiveSelect }>;

/** `coreClientId` is read once per query, not per row — see `FeedPost.isCore`. */
function mapArchiveArticle(a: ArchivePayload, coreClientId: string | null): ArchiveArticle {
  return {
    isCore: coreClientId !== null && a.client.id === coreClientId,
    id: a.id,
    title: a.title,
    // The writer's excerpt is preferred; imported articles may only have a search
    // description, which is still better than leaving the feed card blank.
    excerpt: a.excerpt ?? a.seoDescription ?? undefined,
    image: mediaSrc(a.featuredImage) ?? undefined,
    imageBlur: a.featuredImage?.blurDataURL ?? undefined,
    slug: a.slug,
    publishedAt: a.datePublished || a.createdAt,
    clientName: a.client.name,
    clientSlug: a.client.slug,
    clientId: a.client.id,
    clientLogo: mediaSrc(a.client.logoMedia) ?? undefined,
    readingTimeMinutes: a.readingTimeMinutes ?? undefined,
    hasAudio: !!a.audioUrl,
    likes: a.likesCount || 0,
    comments: a.commentsCount || 0,
    favorites: a.favoritesCount || 0,
    views: a.viewsCount || 0,
    status: "published",
    verified: a.client.isVerified,
    credential: a.client.credentials[0]?.name?.trim() || null,
  };
}

function orderFor(sort: ArchiveSort | undefined): Prisma.ArticleOrderByWithRelationInput[] {
  if (sort === "mostRead") return [{ viewsCount: "desc" }, { datePublished: "desc" }, { id: "desc" }];
  if (sort === "mostEngaged") return [{ likesCount: "desc" }, { commentsCount: "desc" }, { id: "desc" }];
  return [{ datePublished: "desc" }, { id: "desc" }];
}

/**
 * The archive itself: every published article, narrowed by whatever the visitor picked.
 *
 * The industry filter reaches through the partner (`client.industryId`) because an article has no
 * industry of its own — the business axis belongs to whoever wrote it. That indirection is exactly
 * why the industry↔category link is DERIVED and not stored: it is a fact about the articles, and
 * it changes every time one is published.
 */
export async function getArticlesArchive(query: ArchiveQuery = {}): Promise<ArchiveArticle[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  const literalSearch = safeLiteralSearch(query.search);

  // One extra read per query (cached alongside the articles), so every card downstream —
  // including the ones infinite scroll fetches later — knows whether modonty wrote it.
  const coreClientId = await getCoreClientId();
  if (query.coreOnly && !coreClientId) return [];

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      /**
       * Both conditions are OR-groups, so they go inside AND. Written as two sibling `OR` keys
       * the second silently replaced the first — and the one it replaced is the guard that keeps
       * scheduled articles out of the list.
       */
      AND: [
        { OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }] },
        ...(literalSearch
          ? [
              {
                OR: [
                  { title: { contains: literalSearch, mode: "insensitive" as const } },
                  { excerpt: { contains: literalSearch, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
      ],
      // A main category brings its sub-categories' articles with it — its count in the rail
      // already includes them (`get-articles-filters.ts`), so the list must match the number.
      ...(query.categorySlug && {
        category: { OR: [{ slug: query.categorySlug }, { parent: { is: { slug: query.categorySlug } } }] },
      }),
      ...(query.coreOnly && { clientId: coreClientId! }),
      ...(query.tagSlug && { tags: { some: { tag: { slug: query.tagSlug } } } }),
      ...(query.industrySlug && {
        client: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          industry: { slug: query.industrySlug },
        },
      }),
    },
    select: archiveSelect,
    orderBy: orderFor(query.sort),
    take: MAX_ARCHIVE_ARTICLES,
  });

  return articles.map((a) => mapArchiveArticle(a, coreClientId));
}
