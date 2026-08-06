import "server-only";

import { loadSharp } from "@/lib/utils/sharp-loader";

/**
 * Blur placeholder for `Media.blurDataURL` — console side.
 * Mirrors `admin/app/(dashboard)/media/actions/generate-blur.ts`; see that file for the
 * full reasoning (why a base64 data url and not a Bunny link, why sharp and not Bunny's
 * optimizer, why we do NOT pre-blur). Kept in sync by hand, like `db.ts` and `auth.ts`.
 *
 * 10px is Next's own recommendation; Next applies `feGaussianBlur stdDeviation='20'` itself.
 */
const BLUR_WIDTH = 10;
const BLUR_QUALITY = 30;

/**
 * Build a blur placeholder from an image buffer.
 *
 * Returns `null` instead of throwing: a missing placeholder degrades to `placeholder="empty"`,
 * which is today's behaviour anyway. A client's upload must never fail over a nicety.
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
