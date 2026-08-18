import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * One published article with everything Modo needs to answer from it and to end that answer in a
 * bookable partner card — `ctaMode` decides whether a booking button is possible, the rest is what
 * makes the card worth trusting.
 *
 * It lives here, not in `app/(site)/articles/`, because its consumer is `modo-chat` — a SIBLING
 * route. Reaching across siblings is the one import the repo forbids outright, and promoting the
 * shared piece is the prescribed fix rather than leaving the reach in place.
 */
export async function getArticleForChat(slug: string) {
  return db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          ctaMode: true,
          addressCity: true,
          verificationImageUrl: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          credentials: { select: { name: true } },
        },
      },
    },
  });
}
