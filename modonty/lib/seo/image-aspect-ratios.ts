/**
 * Build multiple aspect ratio variants from a single Cloudinary URL.
 *
 * Google's Article rich results recommends providing 3 aspect ratios:
 * - 1:1 (square) — for AMP/news carousels and mobile cards
 * - 4:3 — for traditional thumbnails and grid layouts
 * - 16:9 — for hero/wide displays (default)
 *
 * Cloudinary `c_fill,ar_X:Y,g_auto` content-aware crop is used to preserve
 * the subject (face/object detection) when reframing.
 *
 * Falls back to the original URL when not a Cloudinary URL.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */

const ASPECT_RATIOS = ["1:1", "4:3", "16:9"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/**
 * Build a single Cloudinary transformation URL for a specific aspect ratio.
 * Returns the original URL if not Cloudinary.
 */
export function buildAspectRatioUrl(url: string, aspectRatio: AspectRatio, width = 1200): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Avoid double-transforming if URL already has aspect-ratio params
  if (url.includes(",ar_") || url.includes("/ar_")) {
    return url;
  }
  const uploadIndex = url.indexOf("/upload/");
  const beforeUpload = url.substring(0, uploadIndex + 8);
  const afterUpload = url.substring(uploadIndex + 8);
  return `${beforeUpload}c_fill,ar_${aspectRatio},g_auto,w_${width},f_auto,q_auto/${afterUpload}`;
}

/**
 * Build all 3 Google-recommended aspect ratio variants from one source URL.
 * Returns array of 3 URLs (1:1, 4:3, 16:9). Non-Cloudinary URLs return [url] only.
 */
export function buildAspectRatiosArray(url: string | null | undefined, width = 1200): string[] {
  if (!url) return [];
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return [url];
  }
  return ASPECT_RATIOS.map((ar) => buildAspectRatioUrl(url, ar, width));
}
