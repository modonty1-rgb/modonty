import type { ComponentType, SVGProps } from "react";
import {
  IconEmail, IconFacebook, IconHandshake, IconInstagram, IconLinkedin, IconPhone, IconSearch, IconSnapchat,
  IconTiktok, IconTwitter, IconWhatsappBrand,
} from "@modonty/shared/lib/icons";

/**
 * The lead-source toggles draw an icon instead of the channel's name (Khalid, 28 Sep 2026: «بدل
 * ما يكون كلام ليه ما تحط ايكونز عشان نكسب المساحات») — the name stays in the tooltip and for
 * screen readers. Keyed by `lead_source_options.value` (same on dev and prod, 28 Sep 2026).
 * Google has no brand mark in the registry, so it takes the search mark; a value with no icon
 * here (the four closed «(قديم)» ones, «بلا مصدر») keeps its words.
 */
export const SOURCE_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  INSTAGRAM: IconInstagram,
  TIKTOK: IconTiktok,
  SNAPCHAT: IconSnapchat,
  FACEBOOK: IconFacebook,
  X: IconTwitter,
  LINKEDIN: IconLinkedin,
  GOOGLE: IconSearch,
  WHATSAPP: IconWhatsappBrand,
  INBOUND_CALL: IconPhone,
  EMAIL: IconEmail,
  CLIENT_REFERRAL: IconHandshake,
};
