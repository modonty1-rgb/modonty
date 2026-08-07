"use server";

import { db } from "@/lib/db";
import { generateBlurDataUrlFromUrl } from "@/app/(dashboard)/media/actions/generate-blur";

/**
 * Backfill `Media.blurDataURL` for rows that slipped through.
 *
 * Why this exists even though the migration already generates it:
 * `mirrorImageToBunny` builds the placeholder from the buffer it downloads, so every
 * migrated row normally lands with one. But `generateBlurDataUrl` returns `null` instead
 * of throwing — a corrupt file, an exotic format or a sharp timeout yields a row with
 * `bunnyUrl` set and no placeholder. And the migration skips anything that already has
 * `bunnyUrl`, so that row is never revisited. Without this step the gap is permanent and
 * silent: nobody is told, and we would only find out from a visitor seeing a blank box.
 *
 * So: this is the net under a failure the generator is deliberately quiet about.
 * Idempotent — a row that gets its placeholder here is not selected again.
 *
 * Video is excluded on purpose: `placeholder="blur"` has no meaning for it.
 */

/** A row still needs a placeholder when the field is null OR absent (Mongo: pre-field rows). */
const NO_BLUR = {
  OR: [{ blurDataURL: null }, { blurDataURL: { isSet: false } }],
};

// Only rows we can actually rebuild from: the file must be reachable.
const HAS_SOURCE = { bunnyUrl: { not: null } };
const IS_IMAGE = { mimeType: { startsWith: "image/" } };

export interface BlurBackfillStats {
  totalImages: number;
  withBlur: number;
  /** Reachable image rows still missing a placeholder — what this step would fix. */
  missing: number;
  sample: Array<{ id: string; filename: string }>;
}

export async function getBlurBackfillStats(): Promise<BlurBackfillStats> {
  const [totalImages, withBlur, missing, sample] = await Promise.all([
    db.media.count({ where: IS_IMAGE }),
    db.media.count({ where: { AND: [IS_IMAGE, { blurDataURL: { not: null } }] } }),
    db.media.count({ where: { AND: [IS_IMAGE, HAS_SOURCE, NO_BLUR] } }),
    db.media.findMany({
      where: { AND: [IS_IMAGE, HAS_SOURCE, NO_BLUR] },
      select: { id: true, filename: true },
      take: 5,
    }),
  ]);

  return { totalImages, withBlur, missing, sample };
}

export interface BlurBackfillResult {
  attempted: number;
  filled: number;
  failed: number;
  errors: Array<{ id: string; filename: string; error: string }>;
}

/**
 * Rebuild the missing placeholders. Batched (50) and sequential-ish: each row costs one
 * download, so this stays polite to Bunny rather than racing it.
 */
export async function backfillBlurPlaceholders(limit = 50): Promise<BlurBackfillResult> {
  const rows = await db.media.findMany({
    where: { AND: [IS_IMAGE, HAS_SOURCE, NO_BLUR] },
    select: { id: true, filename: true, bunnyUrl: true, blurDataURL: true },
    take: Math.min(Math.max(limit, 1), 200),
  });

  const result: BlurBackfillResult = { attempted: rows.length, filled: 0, failed: 0, errors: [] };

  for (const row of rows) {
    try {
      const blurDataURL = await generateBlurDataUrlFromUrl(row.bunnyUrl as string);
      if (!blurDataURL) {
        // The generator swallowed a real problem — surface it here instead of looping
        // forever on the same unreadable file.
        result.failed++;
        result.errors.push({ id: row.id, filename: row.filename, error: "sharp could not read the file" });
        continue;
      }
      await db.media.update({ where: { id: row.id }, data: { blurDataURL } });
      result.filled++;
    } catch (e) {
      result.failed++;
      result.errors.push({
        id: row.id,
        filename: row.filename,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return result;
}
