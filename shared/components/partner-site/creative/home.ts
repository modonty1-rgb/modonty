import type { HomeBlock } from "../free/home";
import { HOME_BLOCKS } from "../free/home";
import { SplitHero } from "./hero/split-hero";

/**
 * The creative home page: the free theme's sections, its own cover, and an order that leads
 * with proof — numbers and services right under the promise, the story after them. Reusing the
 * blocks keeps every rule they carry (isEmpty, honesty, a11y) — only the look and order differ.
 */
const ORDER = ["hero", "stats", "services", "trust", "about", "gallery", "testimonials", "video", "booking", "faq", "blog", "reels", "contact", "newsletter", "cta"] as const;

const byKey = new Map(HOME_BLOCKS.map((b) => [b.key, b]));

export const CREATIVE_HOME_BLOCKS: readonly HomeBlock[] = ORDER.map((key) => {
  const block = byKey.get(key);
  if (!block) throw new Error(`creative theme: home block «${key}» does not exist in the free theme`);
  return key === "hero" ? { ...block, name: "الغلاف المقسوم", Component: SplitHero } : block;
});
