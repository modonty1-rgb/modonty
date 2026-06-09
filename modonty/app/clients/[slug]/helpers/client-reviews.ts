import { cacheTag, cacheLife } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";

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
  // Short window so a review approved in console surfaces on modonty within minutes
  // (the two apps don't share a cache; full fix = cross-app revalidate — see backlog).
  cacheLife("minutes");
  const decodedSlug = decodeURIComponent(rawSlug);

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { reviews: [], averageRating: 0, reviewCount: 0 };

  const [reviews, agg] = await Promise.all([
    db.clientReview.findMany({
      where: { clientId: client.id, status: CommentStatus.APPROVED },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: { select: { id: true, name: true, image: true } },
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

