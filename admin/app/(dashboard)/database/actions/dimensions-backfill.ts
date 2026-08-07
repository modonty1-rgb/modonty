"use server";

import { db } from "@/lib/db";
import { loadSharp } from "@/lib/utils/sharp-loader";

/**
 * Backfill `Media.width` / `Media.height` for rows that never got them.
 *
 * ── Why it matters ──────────────────────────────────────────────────────────────────
 * Those two numbers are what reserves the box before the image arrives. Without them the
 * text renders first and gets shoved down when the file lands — a layout shift the visitor
 * feels as the page jumping under their finger. Google measures it (CLS) and ranks on it.
 *
 * The shared image component makes this concrete: `OptimizedImage` takes either
 * `width`+`height` or `fill`, and `fill` needs a sized parent. A row with no intrinsic
 * dimensions leaves every caller guessing.
 *
 * ── Why it is still open after the Bunny migration ──────────────────────────────────
 * `mirrorImageToBunny` reads dimensions off the buffer it downloads, so migrated rows
 * normally land with them. The gap is the rows that predate that path — including the
 * three platform defaults, which are the images shown to EVERY client who has not
 * uploaded their own, i.e. the most-rendered images on the site.
 *
 * ── The Mongo trap this step is written around ──────────────────────────────────────
 * On 2026-08-08 a first count with `OR: [{width: null}, {height: null}]` returned ZERO
 * while the three defaults were visibly empty. The fields are ABSENT, not null, and Mongo
 * does not match an absent field against null. The real number only appeared after adding
 * `isSet: false`: 29 of 592 rows on production. Every selector below carries both.
 *
 * Idempotent: a row that gets its dimensions here is not selected again.
 * Video is excluded — dimensions come from the container, not a still frame.
 */

/** A row still needs dimensions when either field is null OR absent (pre-field rows). */
const NO_DIMS = {
  OR: [
    { width: null },
    { width: { isSet: false } },
    { height: null },
    { height: { isSet: false } },
  ],
};

/** Only rows we can actually measure: the file must be reachable. */
const HAS_SOURCE = { bunnyUrl: { not: null } };
const IS_IMAGE = { mimeType: { startsWith: "image/" } };

export interface DimensionsBackfillStats {
  totalImages: number;
  withDims: number;
  /** Reachable image rows still missing dimensions — what this step would fix. */
  missing: number;
  sample: Array<{ id: string; filename: string }>;
}

export async function getDimensionsBackfillStats(): Promise<DimensionsBackfillStats> {
  const [totalImages, withDims, missing, sample] = await Promise.all([
    db.media.count({ where: IS_IMAGE }),
    db.media.count({
      where: { AND: [IS_IMAGE, { width: { not: null } }, { height: { not: null } }] },
    }),
    db.media.count({ where: { AND: [IS_IMAGE, HAS_SOURCE, NO_DIMS] } }),
    db.media.findMany({
      where: { AND: [IS_IMAGE, HAS_SOURCE, NO_DIMS] },
      select: { id: true, filename: true },
      take: 5,
    }),
  ]);

  return { totalImages, withDims, missing, sample };
}

export interface DimensionsBackfillResult {
  attempted: number;
  filled: number;
  failed: number;
  errors: Array<{ id: string; filename: string; error: string }>;
}

/** Read intrinsic size off a remote file. Returns null rather than throwing on any failure. */
async function readDimensionsFromUrl(
  url: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const sharp = loadSharp();
    const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
    if (!meta.width || !meta.height) return null;
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}

/**
 * Fill the missing dimensions. Batched (50) and sequential: each row costs one download,
 * so this stays polite to Bunny rather than racing it — same shape as the blur backfill.
 */
export async function backfillMediaDimensions(limit = 50): Promise<DimensionsBackfillResult> {
  const rows = await db.media.findMany({
    where: { AND: [IS_IMAGE, HAS_SOURCE, NO_DIMS] },
    select: { id: true, filename: true, bunnyUrl: true },
    take: Math.min(Math.max(limit, 1), 200),
  });

  const result: DimensionsBackfillResult = {
    attempted: rows.length,
    filled: 0,
    failed: 0,
    errors: [],
  };

  for (const row of rows) {
    try {
      const dims = await readDimensionsFromUrl(row.bunnyUrl as string);
      if (!dims) {
        // Surface it instead of looping forever on the same unreadable file.
        result.failed++;
        result.errors.push({
          id: row.id,
          filename: row.filename,
          error: "sharp could not read the file",
        });
        continue;
      }
      await db.media.update({
        where: { id: row.id },
        data: { width: dims.width, height: dims.height },
      });
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
