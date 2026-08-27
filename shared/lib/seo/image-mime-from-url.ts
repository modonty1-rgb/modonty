/**
 * The image's MIME type, read from its own file extension.
 *
 * Two places used to declare it from a constant instead: the partner bundle wrote
 * `"image/jpeg"` while the seeded Settings default said `"image/webp"` — so one of them was
 * always lying about the same file, and after the Bunny migration most files are WebP.
 * Returns undefined for an unreadable extension, and the caller then declares no type at all
 * rather than guessing one.
 */
export function imageMimeFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const clean = url.split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".avif")) return "image/avif";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  return undefined;
}
