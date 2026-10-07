"use server";

import { db } from "@/lib/db";

interface MediaReelsBackfillResult {
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
