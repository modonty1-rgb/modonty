import type { ComponentType } from "react";

import { CoverHero } from "../hero/cover-hero";
import { TrustStrip } from "../trust/trust-strip";
import { ImageTextAbout } from "../about/image-text-about";
import { ServicesGrid } from "../services/services-grid";
import { StatsRow } from "../stats/stats-row";
import { TestimonialsGrid } from "../testimonials/testimonials-grid";
import { GalleryMosaic } from "../gallery/gallery-mosaic";
import { TeamGrid } from "../team/team-grid";
import { IntroVideo } from "../video/intro-video";
import { FaqAccordion } from "../faq/faq-accordion";
import { LatestPosts } from "../blog/latest-posts";
import { ContactCards } from "../contact/contact-cards";
import { FinalCta } from "../cta/final-cta";
import { NewsletterForm } from "../newsletter/newsletter-form";
import { BookingBlock } from "../booking/booking-block";
import type { HomeData } from "./home-data";

export type { HomeData } from "./home-data";

/** Stored in `Client.hiddenSections` when the partner switches a block off. */
export type HomeBlockKey =
  | "hero"
  | "trust"
  | "about"
  | "services"
  | "stats"
  | "testimonials"
  | "gallery"
  | "team"
  | "video"
  | "faq"
  | "blog"
  | "contact"
  | "cta"
  | "newsletter"
  | "map"
  | "lead-form"
  | "booking";

export interface HomeBlock {
  key: HomeBlockKey;
  /** The partner's word for it (console switch label). */
  name: string;
  /** Can the partner switch it off? Hero and the closing call stay. */
  toggleable: boolean;
  /** True when the client row has nothing for this block → skipped on the site, greyed in the console. */
  isEmpty: (d: HomeData) => boolean;
  /** One template today; a second one later = another file + a picker on this entry. */
  Component: ComponentType<{ data: HomeData; preview?: boolean }>;
}

/**
 * The home page, block by block, in visitor order — the 14 agreed with Khalid (2026-08-18)
 * from Tailwind Plus marketing sections + Shopify Dawn sections. modonty walks this list
 * (skipping hidden + empty); the console shows the same list with a switch per block.
 */
export const HOME_BLOCKS: readonly HomeBlock[] = [
  { key: "hero", name: "الغلاف", toggleable: false, isEmpty: () => false, Component: CoverHero },
  { key: "trust", name: "شريط الثقة", toggleable: true, isEmpty: (d) => !d.trust.verified && d.trust.credentials.length === 0, Component: TrustStrip },
  { key: "about", name: "تعرّف علينا", toggleable: true, isEmpty: (d) => !d.about.description, Component: ImageTextAbout },
  { key: "services", name: "خدماتنا", toggleable: true, isEmpty: (d) => d.services.length === 0, Component: ServicesGrid },
  { key: "booking", name: "احجز", toggleable: true, isEmpty: (d) => d.booking.mode === "NONE", Component: BookingBlock },
  { key: "stats", name: "أرقامنا", toggleable: true, isEmpty: (d) => d.stats.length === 0, Component: StatsRow },
  { key: "testimonials", name: "آراء العملاء", toggleable: true, isEmpty: (d) => d.testimonials.length === 0, Component: TestimonialsGrid },
  { key: "gallery", name: "المعرض", toggleable: true, isEmpty: (d) => d.gallery.length === 0, Component: GalleryMosaic },
  { key: "team", name: "الفريق", toggleable: true, isEmpty: (d) => d.team.length === 0, Component: TeamGrid },
  { key: "video", name: "فيديو تعريفي", toggleable: true, isEmpty: (d) => !d.video, Component: IntroVideo },
  { key: "faq", name: "الأسئلة الشائعة", toggleable: true, isEmpty: (d) => d.faqs.length === 0, Component: FaqAccordion },
  { key: "blog", name: "المدونة", toggleable: true, isEmpty: (d) => d.posts.length === 0, Component: LatestPosts },
  { key: "contact", name: "تواصل", toggleable: true, isEmpty: (d) => !d.contact.address && !d.contact.email && !d.phone, Component: ContactCards },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
  { key: "newsletter", name: "النشرة البريدية", toggleable: true, isEmpty: () => false, Component: NewsletterForm },
] as const;
