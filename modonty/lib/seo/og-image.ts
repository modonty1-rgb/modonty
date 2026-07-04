import type { Metadata } from "next";

/**
 * Pull the first OpenGraph image (url + alt) out of the admin-generated listing-page
 * Metadata cache. Reused as the visible hero background so there's ONE image source
 * (the site OG image) — no extra field, no extra query.
 */
export function extractOgImageFromMetadata(
  metadata: Metadata | null | undefined
): { url?: string; alt?: string } {
  const images = (metadata?.openGraph as { images?: unknown } | undefined)?.images;
  const first = Array.isArray(images) ? images[0] : images;
  if (!first) return {};
  if (typeof first === "string") return { url: first };
  const obj = first as { url?: unknown; alt?: unknown };
  return {
    url: typeof obj.url === "string" ? obj.url : undefined,
    alt: typeof obj.alt === "string" ? obj.alt : undefined,
  };
}
