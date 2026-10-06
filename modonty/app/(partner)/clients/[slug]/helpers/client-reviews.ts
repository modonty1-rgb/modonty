import { cacheTag, cacheLife } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { clientSlugTag } from "@modonty/shared/lib/cache/client-cache-tags";

// NOTE: getClientReviewsBySlug below reads ARTICLE comments (Comment via
// article.clientId) — the legacy "reviews" that show article discussion as if it
// were client reviews. It is replaced by getClientReviews (real ClientReview =
// star rating of the client's SERVICE) and will be removed with client-reviews-preview.tsx.

export interface ClientReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null } | null;
}

export interface ClientReviewsData {
  reviews: ClientReviewItem[];
  /** Average of APPROVED ratings, 0 when none. Feeds AggregateRating + the «تقييم» stat. */
  averageRating: number;
  reviewCount: number;
}

/** Real client-service reviews (ClientReview): APPROVED list + aggregate. */
export async function getClientReviews(
  rawSlug: string,
  limit = 20,
): Promise<ClientReviewsData> {
  "use cache";
  cacheTag("clients");
  // Hours, not minutes (plan أ٦, 2 Oct 2026). «minutes» was the stopgap for a console that
  // could not bust modonty's cache; it can now — every console write to reviews, the page FAQ
  // and the gallery goes through regenerateClientSeo(), which calls revalidateModontyTag
  // ("clients") (console/.../regenerate-client-seo.ts). Left at minutes, this one helper
  // capped the WHOLE partner page at a one-minute life: measured on prod, `X-Vercel-Cache:
  // STALE` with `Age` back to 0 within minutes, and a 2.1 s first byte for the unlucky visitor.
  cacheLife("hours");
  const decodedSlug = decodeURIComponent(rawSlug);
  cacheTag(clientSlugTag(decodedSlug)); // this partner only — see shared/lib/cache/client-cache-tags.ts

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { reviews: [], averageRating: 0, reviewCount: 0 };

  // Select reviewerId (scalar, always present) instead of the reviewer relation:
  // a deleted user leaves an orphaned authorId, and Prisma throws on a required
  // relation that resolves to null — one orphan would crash the whole page/build.
  // We resolve authors separately and tolerate the missing ones (author: null).
  const [rawReviews, agg] = await Promise.all([
    db.clientReview.findMany({
      where: { clientId: client.id, status: CommentStatus.APPROVED },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewerId: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.clientReview.aggregate({
      where: { clientId: client.id, status: CommentStatus.APPROVED },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const authorIds = [...new Set(rawReviews.map((r) => r.reviewerId))];
  const authors = authorIds.length
    ? await db.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, image: true },
      })
    : [];
  const authorById = new Map(authors.map((a) => [a.id, a]));

  const reviews: ClientReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    author: authorById.get(r.reviewerId) ?? null,
  }));

  return {
    reviews,
    averageRating: agg._avg.rating ?? 0,
    reviewCount: agg._count,
  };
}

export async function getClientReviewsBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!client) {
    return null;
  }

  const reviews = await db.comment.findMany({
    where: {
      article: { clientId: client.id },
      status: CommentStatus.APPROVED,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 40,
  });

  return {
    client,
    reviews,
  };
}

