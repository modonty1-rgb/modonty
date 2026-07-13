"use server";

import { db } from "@/lib/db";
import { computeMediaSeoScore } from "@modonty/database/lib/seo/media/seo-score";

/**
 * The media library, by the two questions an admin actually has (Khalid 2026-07-13:
 * «القسم للصور من ناحية الـ SEO تبعها، ومن ناحية المستخدمة والغير مستخدمة»):
 *
 *   Is it being used?  → nothing points at it = dead weight on the Cloudinary bill.
 *   Is it doing its job in search? → alt text above all, then dimensions/title/description.
 *
 * ONE read of the library serves both the cards and every segment page, because usage
 * has to be counted per-relation and the SEO score has to be computed in JS anyway.
 * At a few hundred rows that is cheaper than a dozen count() round-trips.
 *
 * The score comes from dataLayer/lib/seo/media — the same source of truth as the article,
 * client and reference scorers.
 */

/** PLATFORM assets are ours (site logo, defaults), not part of the library an admin manages. */
const SCOPE_FILTER = { scope: { not: "PLATFORM" } } as const;

/** Below this the image is not doing its job in search. Same band as everywhere else. */
const FAILING = 60;

export type MediaSegmentKey = "unused" | "no-alt" | "failing-seo" | "no-dimensions";

export interface MediaCounts {
  total: number;
  /** Nothing points at them — safe to delete, and they are costing you storage. */
  unused: number;
  /** Linked from an article (featured or gallery), a client logo, or a client hero. */
  used: number;
  /** No alt text at all: invisible in Google Images, unreadable by a screen reader. */
  noAlt: number;
  /** Score below 60. */
  failingSeo: number;
  /** No width/height stored — cannot be a share image, and it causes layout shift. */
  noDimensions: number;
}

export interface MediaRow {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  /** Declared role at upload (MediaType): LOGO, OGIMAGE, POST… Null on pre-field records. */
  type: string | null;
  seoScore: number;
  /** Empty = nothing points at it. Otherwise where it is used, e.g. ["article", "logo"]. */
  usedAs: string[];
  createdAt: string;
}

interface RawMedia {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  title: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  type: string | null;
  createdAt: Date;
  _count: {
    featuredArticles: number;
    articleGallery: number;
    logoClients: number;
    heroImageClients: number;
  };
}

/**
 * Every media row with its usage counts. The usage relations are counted here rather
 * than filtered in the query so that "unused" means exactly the same thing on the card,
 * on the segment page and in the delete guard — one definition, no drift.
 */
async function readLibrary(): Promise<RawMedia[]> {
  return db.media.findMany({
    where: SCOPE_FILTER,
    select: {
      id: true,
      filename: true,
      url: true,
      altText: true,
      title: true,
      description: true,
      width: true,
      height: true,
      type: true,
      createdAt: true,
      _count: {
        select: {
          featuredArticles: true,
          articleGallery: true,
          logoClients: true,
          heroImageClients: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });
}

function usedAs(m: RawMedia): string[] {
  const where: string[] = [];
  if (m._count.featuredArticles > 0) where.push("featured");
  if (m._count.articleGallery > 0) where.push("gallery");
  if (m._count.logoClients > 0) where.push("logo");
  if (m._count.heroImageClients > 0) where.push("hero");
  return where;
}

function score(m: RawMedia): number {
  return computeMediaSeoScore({
    filename: m.filename,
    altText: m.altText,
    title: m.title,
    description: m.description,
    width: m.width,
    height: m.height,
  }).score;
}

export async function getMediaCounts(): Promise<MediaCounts> {
  const rows = await readLibrary();

  let unused = 0;
  let noAlt = 0;
  let failingSeo = 0;
  let noDimensions = 0;

  for (const m of rows) {
    if (usedAs(m).length === 0) unused += 1;
    if (!m.altText?.trim()) noAlt += 1;
    if (!m.width || !m.height) noDimensions += 1;
    if (score(m) < FAILING) failingSeo += 1;
  }

  return {
    total: rows.length,
    unused,
    used: rows.length - unused,
    noAlt,
    failingSeo,
    noDimensions,
  };
}

/** The rows behind one card. Same read, same scorer — the count and the list always agree. */
export async function getMediaRows(key: MediaSegmentKey): Promise<MediaRow[]> {
  const rows = await readLibrary();

  const matches = rows.filter((m) => {
    switch (key) {
      case "unused":
        return usedAs(m).length === 0;
      case "no-alt":
        return !m.altText?.trim();
      case "no-dimensions":
        return !m.width || !m.height;
      case "failing-seo":
        return score(m) < FAILING;
    }
  });

  return matches.map((m) => ({
    id: m.id,
    filename: m.filename,
    url: m.url,
    altText: m.altText,
    width: m.width,
    height: m.height,
    type: m.type,
    seoScore: score(m),
    usedAs: usedAs(m),
    // Dates cross the server/client boundary as ISO strings — a Date instance would not.
    createdAt: m.createdAt.toISOString(),
  }));
}
