import type { HomeBlock, HomeData } from "../home";
import { ReelsGrid } from "./reels-grid";
import { FinalCta } from "../cta/final-cta";

function AllReels({ data }: { data: HomeData; preview?: boolean }) {
  return ReelsGrid({ data, all: true });
}

/** «الريلز» — every published reel of the partner, each a link to its watch page → CTA. */
export const REELS_BLOCKS: readonly HomeBlock[] = [
  { key: "reels", name: "كل الريلز", toggleable: false, isEmpty: (d) => d.reels.length === 0, Component: AllReels },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: (d) => !d.whatsappHref && d.booking.mode !== "FORM" && !(d.booking.mode === "LINK" && d.booking.url), Component: FinalCta },
] as const;
