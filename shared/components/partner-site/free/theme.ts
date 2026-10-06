import type { PartnerTheme } from "../theme/theme-contract";
import { HOME_BLOCKS } from "./home";
import { ABOUT_BLOCKS } from "./about";
import { SERVICES_BLOCKS } from "./services";
import { GALLERY_BLOCKS } from "./gallery";
import { REVIEWS_BLOCKS } from "./testimonials";
import { BLOG_BLOCKS } from "./blog";
import { FAQ_BLOCKS } from "./faq";
import { CONTACT_BLOCKS } from "./contact";
import { BOOKING_BLOCKS } from "./booking";
import { REELS_BLOCKS } from "./reels";
import { HEADER_TEMPLATES, DEFAULT_HEADER_TEMPLATE } from "./header";
import { FOOTER_TEMPLATES, DEFAULT_FOOTER_TEMPLATE } from "./footer";

/**
 * «الأساسي» — modonty's free theme, and the fallback for every partner whose theme is missing,
 * retired, or premium without entitlement. Every value below is what the site shipped before the
 * theme layer existed (4 Oct 2026), so wrapping it changed nothing a visitor sees.
 */
export const freeTheme: PartnerTheme = {
  key: "free",
  name: "الأساسي",
  description: "ثيم مدونتي المجاني: أقسام واضحة، هيدر وذيل بخمسة وأربعة أشكال، ولون الشريك.",
  version: "1.0.0",
  tier: "free",
  tokens: {
    radiusCard: "0.5rem",
    radiusControl: "9999px",
    sectionY: "3rem",
    sectionYDesktop: "4rem",
  },
  pages: {
    home: HOME_BLOCKS,
    about: ABOUT_BLOCKS,
    services: SERVICES_BLOCKS,
    photos: GALLERY_BLOCKS,
    reviews: REVIEWS_BLOCKS,
    articles: BLOG_BLOCKS,
    faq: FAQ_BLOCKS,
    contact: CONTACT_BLOCKS,
    book: BOOKING_BLOCKS,
    reels: REELS_BLOCKS,
  },
  headers: HEADER_TEMPLATES,
  footers: FOOTER_TEMPLATES,
  defaultHeader: DEFAULT_HEADER_TEMPLATE,
  defaultFooter: DEFAULT_FOOTER_TEMPLATE,
  settings: [
    { key: "primaryColor", type: "color", label: "اللون الأساسي", default: null },
    { key: "headerTemplate", type: "choice", label: "الشريط العلوي", default: DEFAULT_HEADER_TEMPLATE, options: HEADER_TEMPLATES.map((h) => ({ value: h.key, label: h.name })) },
    { key: "footerTemplate", type: "choice", label: "ذيل الموقع", default: DEFAULT_FOOTER_TEMPLATE, options: FOOTER_TEMPLATES.map((f) => ({ value: f.key, label: f.name })) },
  ],
};
