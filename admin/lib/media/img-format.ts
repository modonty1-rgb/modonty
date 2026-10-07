/** "image/webp" → "WEBP", "image/jpeg" → "JPG", … */
export function imgFormat(mime: string): string {
  const sub = (mime.split("/")[1] || "img").toLowerCase();
  if (sub === "jpeg") return "JPG";
  if (sub === "svg+xml") return "SVG";
  return sub.toUpperCase();
}
