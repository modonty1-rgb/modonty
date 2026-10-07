/** How far down the page the reader is, as a percentage of the whole document (one decimal). */
export function getScrollDepth(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const { scrollY, innerHeight } = window;
  const { scrollHeight } = document.body;
  if (scrollHeight <= 0) return 0;
  const depth = ((scrollY + innerHeight) / scrollHeight) * 100;
  return Math.min(100, Math.round(depth * 10) / 10);
}
