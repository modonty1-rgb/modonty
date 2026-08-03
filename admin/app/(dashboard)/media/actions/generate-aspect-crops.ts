import "server-only";

import { BUNNY_ASPECT_SUFFIX } from "@modonty/database/lib/bunny";
import { loadSharp } from "@/lib/utils/sharp-loader";

import type Sharp from "sharp";

export interface AspectCrop {
  suffix: string;
  width: number;
  height: number;
  buffer: Buffer;
}

// Google's 3 article aspect ratios at width 1200 (matches the JSON-LD ImageObject dims).
const ASPECTS: { suffix: string; width: number; height: number }[] = [
  { suffix: BUNNY_ASPECT_SUFFIX["1:1"], width: 1200, height: 1200 },
  { suffix: BUNNY_ASPECT_SUFFIX["4:3"], width: 1200, height: 900 },
  { suffix: BUNNY_ASPECT_SUFFIX["16:9"], width: 1200, height: 675 },
];

// sharp comes from the shared server-only loader (`@/lib/utils/sharp-loader`) — see the
// comment there for why a plain Node require is the only reliable path on Windows.

/** Read intrinsic dimensions + format from an image buffer (sharp metadata, no re-encode). */
export async function readImageMeta(
  source: Buffer
): Promise<{ width: number; height: number; format: string }> {
  const sharp = loadSharp();
  const meta = await sharp(source).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0, format: meta.format ?? "" };
}

/**
 * Generate the 3 content-aware WebP crops for an article image (P1-3, zero SEO compromise).
 * `fit: cover` + `position: attention` = sharp's entropy/attention crop keeps the subject.
 */
export async function generateAspectCrops(source: Buffer): Promise<AspectCrop[]> {
  let sharp: typeof Sharp;
  try {
    sharp = loadSharp();
  } catch (err) {
    throw new Error(
      `aspect-crops: sharp native module unavailable — ${err instanceof Error ? err.message : String(err)}`
    );
  }
  return Promise.all(
    ASPECTS.map(async (a) => ({
      suffix: a.suffix,
      width: a.width,
      height: a.height,
      buffer: await sharp(source)
        .resize(a.width, a.height, { fit: "cover", position: "attention" })
        .webp({ quality: 82 })
        .toBuffer(),
    }))
  );
}
