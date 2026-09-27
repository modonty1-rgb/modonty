import "server-only";

import { loadSharp } from "@/lib/utils/sharp-loader";

/**
 * The ONE place that produces a `Media.blurDataURL`.
 *
 * ── Why a base64 data URL and not a Bunny link ──────────────────────────────────────
 * next/image embeds the value as the `href` of an `<image>` inside an inline SVG that it
 * serves through `background-image` (next@16.2.9 `get-img-props.js:508` + `image-blur-svg.js`).
 * Browsers block external loads from inside a `data:` SVG, so a remote url renders an empty
 * box. Google's own docs say it plainly: "For dynamic or remote images, it must be provided
 * manually." Hence: we store the bytes, not a reference.
 *
 * ── Why sharp and not Bunny's optimizer ─────────────────────────────────────────────
 * `OptimizerEnabled: false` on all five pull zones (paid add-on), so `?width=10` is ignored
 * and the full-size image comes back. sharp is already installed and already runs on every
 * upload to read intrinsic dimensions, so this costs one extra resize of an in-memory buffer.
 *
 * ── Why we do NOT blur it here ──────────────────────────────────────────────────────
 * Next applies `feGaussianBlur stdDeviation='20'` itself. Pre-blurring would double it and
 * waste bytes. We only need the image to be tiny — 10px is Next's own recommendation.
 */
const BLUR_WIDTH = 10;
const BLUR_QUALITY = 30;

/**
 * Build a blur placeholder from an image buffer.
 *
 * Returns `null` instead of throwing: a missing placeholder degrades to `placeholder="empty"`,
 * which is the behaviour we already have today. An upload must never fail over a nicety.
 */
export async function generateBlurDataUrl(source: Buffer): Promise<string | null> {
  try {
    const sharp = loadSharp();
    const tiny = await sharp(source)
      .resize(BLUR_WIDTH, null, { fit: "inside" })
      .webp({ quality: BLUR_QUALITY })
      .toBuffer();
    return `data:image/webp;base64,${tiny.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Same thing for an image we only have a url for — used by the migration and the backfill. */
export async function generateBlurDataUrlFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await generateBlurDataUrl(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}
