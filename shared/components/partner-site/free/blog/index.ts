import type { HomeBlock } from "../home";
import { PostsIndex } from "./posts-index";
import { NewsletterForm } from "../newsletter/newsletter-form";
import { FinalCta } from "../cta/final-cta";

/** «المدونة» — the index (featured + grid) → newsletter (the natural next step on a blog) → CTA. */
export const BLOG_BLOCKS: readonly HomeBlock[] = [
  { key: "blog", name: "كل المقالات", toggleable: false, isEmpty: (d) => d.posts.length === 0, Component: PostsIndex },
  { key: "newsletter", name: "النشرة البريدية", toggleable: true, isEmpty: () => false, Component: NewsletterForm },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
