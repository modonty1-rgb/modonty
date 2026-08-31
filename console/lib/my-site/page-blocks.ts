import { HOME_BLOCKS, type HomeBlock } from "@modonty/shared/components/partner-site/free/home";
import { ABOUT_BLOCKS } from "@modonty/shared/components/partner-site/free/about";
import { SERVICES_BLOCKS } from "@modonty/shared/components/partner-site/free/services";
import { GALLERY_BLOCKS } from "@modonty/shared/components/partner-site/free/gallery";
import { FAQ_BLOCKS } from "@modonty/shared/components/partner-site/free/faq";
import { CONTACT_BLOCKS } from "@modonty/shared/components/partner-site/free/contact";
import { BLOG_BLOCKS } from "@modonty/shared/components/partner-site/free/blog";
import { BOOKING_BLOCKS } from "@modonty/shared/components/partner-site/free/booking";
import { REVIEWS_BLOCKS } from "@modonty/shared/components/partner-site/free/testimonials";

import type { BlocksPage } from "./page-keys";

/**
 * Page key → its blocks, in visitor order. Two consumers now — the settings switches and
 * the preview route that renders them — so it lives in the app's lib, not in either route.
 */
export const PAGE_BLOCKS: Record<BlocksPage, readonly HomeBlock[]> = {
  home: HOME_BLOCKS,
  about: ABOUT_BLOCKS,
  services: SERVICES_BLOCKS,
  photos: GALLERY_BLOCKS,
  faq: FAQ_BLOCKS,
  contact: CONTACT_BLOCKS,
  articles: BLOG_BLOCKS,
  book: BOOKING_BLOCKS,
  reviews: REVIEWS_BLOCKS,
};
