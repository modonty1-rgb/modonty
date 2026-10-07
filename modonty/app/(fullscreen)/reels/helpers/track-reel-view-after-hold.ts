import { trackReelView } from "../actions/track-reel-view";
import { pushGa4Event } from "@/lib/analytics/ga4-browser";
import { claritySet } from "@/lib/analytics/clarity";
import { markReelViewed } from "./mark-reel-viewed";

/**
 * A view = the reel HELD the screen for two seconds — a flick past it counts nothing.
 * Once per reel per browser session (markReelViewed dedupes in sessionStorage).
 * Returns the cleanup that cancels the hold — the one body behind the feed's and the watch
 * page's effect.
 */
export function trackReelViewAfterHold(reelId: string): () => void {
  const timer = setTimeout(() => {
    if (markReelViewed(reelId)) {
      void trackReelView(reelId).then((ga4) => {
        if (ga4) {
          pushGa4Event("reel_view", { ...ga4 });
          if (ga4.client_slug) claritySet("client", ga4.client_slug); // Clarity tag (plan ج٦)
        }
      });
    }
  }, 2000);
  return () => clearTimeout(timer);
}
