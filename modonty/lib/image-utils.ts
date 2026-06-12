import { CHARACTER_URL } from "@/lib/brand";

export const MODONTY_CHARACTER_URL = CHARACTER_URL;

const CHARACTER_BASE = CHARACTER_URL;

export function getOptimizedCharacterUrl(width = 96): string {
  if (!CHARACTER_BASE.includes("res.cloudinary.com")) return CHARACTER_BASE;
  if (CHARACTER_BASE.includes("/f_auto") || CHARACTER_BASE.includes("/q_auto")) return CHARACTER_BASE;
  try {
    const uploadIndex = CHARACTER_BASE.indexOf("/upload/");
    if (uploadIndex === -1) return CHARACTER_BASE;
    const beforeUpload = CHARACTER_BASE.substring(0, uploadIndex + 8);
    const afterUpload = CHARACTER_BASE.substring(uploadIndex + 8);
    return `${beforeUpload}f_auto,q_auto,w_${width},c_limit/${afterUpload}`;
  } catch {
    return CHARACTER_BASE;
  }
}

// Applies Cloudinary optimization to an admin-managed logo URL (from Settings.logoUrl).
// Non-Cloudinary URLs are returned unchanged.
export function getOptimizedLogoUrl(logoUrl: string): string {
  if (!logoUrl.includes("res.cloudinary.com")) return logoUrl;
  const uploadIndex = logoUrl.indexOf("/upload/");
  if (uploadIndex === -1) return logoUrl;
  const beforeUpload = logoUrl.substring(0, uploadIndex + 8);
  const afterUpload = logoUrl.substring(uploadIndex + 8);
  return `${beforeUpload}f_auto,q_auto,w_300,c_limit/${afterUpload}`;
}

/**
 * Strips baked-in Cloudinary transformations (e.g. `f_auto,q_auto,w_auto`) from a
 * URL so it can be passed to next/image, which does its own width/format/quality
 * optimization. A pre-sized — especially `w_auto` — source makes Next fetch a tiny
 * image server-side (no client hints) → blurry output (observed: a 2544px cover
 * served as 389px). Version segments (`v123…`), folders, and non-Cloudinary URLs
 * are returned unchanged.
 */
export function stripCloudinaryTransforms(url: string | null | undefined): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return url ?? null;
  const marker = "/upload/";
  const uploadIndex = url.indexOf(marker);
  if (uploadIndex === -1) return url;
  const afterUpload = url.substring(uploadIndex + marker.length);
  const firstSlash = afterUpload.indexOf("/");
  if (firstSlash === -1) return url; // single segment, nothing to strip
  const firstSeg = afterUpload.substring(0, firstSlash);
  const isVersion = /^v\d+$/.test(firstSeg);
  // A transform segment looks like `key_value` pairs (comma-separated), e.g. f_auto,w_300.
  const isTransform = !isVersion && /(^|,)[a-z]+_[^,/]+/.test(firstSeg);
  if (!isTransform) return url; // folder/path, keep as-is
  const beforeUpload = url.substring(0, uploadIndex + marker.length);
  return beforeUpload + afterUpload.substring(firstSlash + 1);
}

export function getOptimizedThumbnailUrl(url: string | null | undefined, width = 80): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return url || null;
  if (url.toLowerCase().endsWith(".svg")) return url;
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return url;
    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    return `${beforeUpload}f_auto,q_auto,w_${width},c_fill,g_auto/${afterUpload}`;
  } catch {
    return url;
  }
}

