import { toShareImage, type OgImageEntry } from "@/lib/seo";

/**
 * Only the article page reads a CACHED metadata blob (the admin pre-generates and stores
 * it), so only it has loose og:image entries to normalize. Everything else builds metadata
 * fresh through generateMetadataFromSEO, which already resolves the crop.
 */

/**
 * Normalize cached og:image entries onto the stored 16:9 crop. Accepts the loose
 * `Metadata.openGraph.images` shape (string | object | array) and always returns a clean
 * array (or undefined when empty).
 */
export function normalizeOgImages(images: unknown): OgImageEntry[] | undefined {
  const list = Array.isArray(images) ? images : images ? [images] : [];
  const out = list
    .map((entry) => {
      const url = typeof entry === "string" ? entry : (entry as { url?: string } | null)?.url;
      if (!url || typeof url !== "string") return null;
      const alt = typeof entry === "object" && entry ? (entry as { alt?: string }).alt : undefined;
      return { ...toShareImage(url), ...(alt ? { alt } : {}) };
    })
    .filter((x): x is OgImageEntry => x !== null);
  return out.length > 0 ? out : undefined;
}
