import type { HomeBlock } from "../home";
import { ReviewsList } from "./reviews-list";
import { StatsRow } from "../stats/stats-row";
import { FinalCta } from "../cta/final-cta";

/** «آراء العملاء» — summary + every approved review → numbers → CTA. */
export const REVIEWS_BLOCKS: readonly HomeBlock[] = [
  { key: "testimonials", name: "كل الآراء", toggleable: false, isEmpty: (d) => d.testimonials.length === 0, Component: ReviewsList },
  { key: "stats", name: "أرقامنا", toggleable: true, isEmpty: (d) => d.stats.length === 0, Component: StatsRow },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
