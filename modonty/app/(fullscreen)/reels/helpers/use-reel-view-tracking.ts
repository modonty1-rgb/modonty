import { useEffect } from "react";

import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";
import { trackReelViewAfterHold } from "./track-reel-view-after-hold";

/** The feed's view rule: the active reel, two seconds on screen, once per browser session. */
export function useReelViewTracking(items: ReelFeedItemWithState[], active: number) {
  useEffect(() => {
    const reel = items[active];
    if (!reel) return;
    return trackReelViewAfterHold(reel.id);
  }, [active, items]);
}
