/**
 * Session-side dedupe for the view counter: true the FIRST time this browser session marks
 * the reel, false ever after — so `trackReelView` fires once per reel per session, the same
 * clip re-snapping into view while scrolling does not farm views. sessionStorage over a
 * cookie on purpose: a view is a counter, not analytics, and it needs no server identity.
 */
export function markReelViewed(mediaId: string): boolean {
  try {
    const key = `reel-viewed:${mediaId}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    // Storage blocked (private mode hard limits) — count the view rather than lose it.
    return true;
  }
}
