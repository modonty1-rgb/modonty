import { useEffect } from "react";

import { trackReelViewAfterHold } from "./track-reel-view-after-hold";

/** Same view rule as the feed: two seconds on screen, once per browser session. */
export function useReelWatchViewTracking(reelId: string) {
  useEffect(() => trackReelViewAfterHold(reelId), [reelId]);
}
