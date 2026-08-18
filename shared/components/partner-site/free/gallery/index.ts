import type { HomeBlock } from "../home";
import { GalleryJustified } from "./gallery-justified";
import { IntroVideo } from "../video/intro-video";
import { TestimonialsGrid } from "../testimonials/testimonials-grid";
import { FinalCta } from "../cta/final-cta";

/**
 * «أعمالنا» — a portfolio page is the work first and little else (Squarespace/Wix
 * portfolio guides: strong visuals · minimal text · proof · one clear next step):
 * all images in justified rows → the intro video → what clients said → CTA.
 */
export const GALLERY_BLOCKS: readonly HomeBlock[] = [
  { key: "gallery", name: "كل الصور", toggleable: false, isEmpty: (d) => d.gallery.length === 0, Component: GalleryJustified },
  { key: "video", name: "فيديو تعريفي", toggleable: true, isEmpty: (d) => !d.video, Component: IntroVideo },
  { key: "testimonials", name: "آراء العملاء", toggleable: true, isEmpty: (d) => d.testimonials.length === 0, Component: TestimonialsGrid },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
