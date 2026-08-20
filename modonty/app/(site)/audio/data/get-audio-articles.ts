import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

export interface AudioArticle {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  imageBlur?: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  /** Whole seconds. Null on a recording uploaded before the field existed. */
  durationSeconds?: number;
}

/** Small on purpose: today zero articles carry audio, and the page is a shelf, not the archive. */
const MAX_AUDIO_ARTICLES = 100;

/**
 * Every published article that actually has a recording.
 *
 * Written here rather than reusing `/articles`' archive query: the two are sibling routes, and
 * this repo forbids importing across siblings — a page must not break because its neighbour
 * changed a select. It also needs far less: no trust marks, no filters, no engagement counters.
 *
 * `NOT: { audioUrl: null }` and not a truthiness check: MongoDB stores a missing field and an
 * explicit null differently, and Prisma's `not null` covers both here because every row that has
 * ever had the field written carries a real URL — the admin never writes an empty string.
 */
export async function getAudioArticles(): Promise<AudioArticle[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const rows = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      // Scheduled articles are PUBLISHED with a future date — the same guard the archive uses.
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      NOT: { audioUrl: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      readingTimeMinutes: true,
      audioDurationSeconds: true,
      featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      client: {
        select: {
          name: true,
          slug: true,
          logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        },
      },
    },
    orderBy: [{ datePublished: "desc" }, { id: "desc" }],
    take: MAX_AUDIO_ARTICLES,
  });

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    excerpt: a.excerpt ?? undefined,
    slug: a.slug,
    image: mediaSrc(a.featuredImage) ?? undefined,
    imageBlur: a.featuredImage?.blurDataURL ?? undefined,
    publishedAt: a.datePublished || a.createdAt,
    clientName: a.client.name,
    clientSlug: a.client.slug,
    clientLogo: mediaSrc(a.client.logoMedia) ?? undefined,
    readingTimeMinutes: a.readingTimeMinutes ?? undefined,
    durationSeconds: a.audioDurationSeconds ?? undefined,
  }));
}
