"use server";

import { db } from "@/lib/db";

/**
 * Fill the reels fields that the merge added to `Media` (2026-08-05).
 *
 * Why this is not optional. `inGallery` is declared `Boolean @default(true)`, but a
 * default does NOT reach rows that already exist: in MongoDB the key is simply ABSENT on
 * every media row written before the merge. An absent key matches no boolean filter at
 * all — verified on modonty_dev against a client with 16 gallery images:
 *
 *     inGallery: true              → 0
 *     NOT: { inGallery: false }    → 0
 *     inGallery: { not: false }    → 0
 *
 * `isSet: false` is not a way out either — Prisma only offers it on OPTIONAL fields.
 * So there is no query that reads around this. Until this step runs, every gallery in
 * the product renders empty. The same goes for the four counters: `increment` on an
 * absent field fails silently, which is how counters have gone wrong here before.
 *
 * Idempotent: it only touches rows where the key is still missing, so running it twice
 * changes nothing. Uses a raw update because Prisma cannot express "field not present".
 */

export interface MediaReelsBackfillStats {
  totalMedia: number;
  /** Rows still missing `inGallery` — these are invisible to every gallery query. */
  missingInGallery: number;
  missingCounters: number;
}

/** `$exists: false` is the only way to ask this — Prisma has no filter for it. */
async function countMissing(field: string): Promise<number> {
  const res = (await db.$runCommandRaw({
    count: "media",
    query: { [field]: { $exists: false } },
  })) as { n?: number };
  return res?.n ?? 0;
}

export async function getMediaReelsBackfillStats(): Promise<MediaReelsBackfillStats> {
  const [totalMedia, missingInGallery, missingCounters] = await Promise.all([
    db.media.count(),
    countMissing("inGallery"),
    countMissing("likesCount"),
  ]);
  return { totalMedia, missingInGallery, missingCounters };
}

export interface MediaReelsBackfillResult {
  /** Rows that were missing `inGallery` and now carry it. */
  galleryFilled: number;
  /** Rows whose counters were absent and now start at zero. */
  countersFilled: number;
}

export async function backfillMediaReelsFields(): Promise<MediaReelsBackfillResult> {
  // Every existing file was, by definition, in the gallery it belonged to — nothing had
  // been taken out yet, because there was no way to take anything out. Reels stay OFF:
  // turning them on for existing images is precisely the mistake that produced 56 reels
  // no client had asked for.
  const gallery = (await db.$runCommandRaw({
    update: "media",
    updates: [
      {
        q: { inGallery: { $exists: false } },
        u: { $set: { inGallery: true, inReels: false } },
        multi: true,
      },
    ],
  })) as { nModified?: number };

  // Counters must exist as numbers before anything increments them: `{ increment: 1 }`
  // against an absent field does not throw, it just does not happen.
  const counters = (await db.$runCommandRaw({
    update: "media",
    updates: [
      {
        q: { likesCount: { $exists: false } },
        u: {
          $set: { viewsCount: 0, likesCount: 0, commentsCount: 0, favoritesCount: 0 },
        },
        multi: true,
      },
    ],
  })) as { nModified?: number };

  return {
    galleryFilled: gallery?.nModified ?? 0,
    countersFilled: counters?.nModified ?? 0,
  };
}
