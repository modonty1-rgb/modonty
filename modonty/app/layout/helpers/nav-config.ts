import type { ComponentType } from "react";
import { IconTrending, IconArticleList } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { ModontyHomeMark } from "@/components/icons/modonty-home-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";

export interface MainNavItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  /** `accent`: teal text (`--link-accent`) at rest — the one item that is the brand itself. */
  tone?: "accent";
}

// Labels come from `chrome.menuItems` — the same block the burger menu reads. The top nav and the
// burger show the same destinations, so one edit must change both; two copies would drift the day
// someone renames a section in one place only.
const label = messages.chrome.menuItems;

export const mainNavItems: MainNavItem[] = [
  // علامتنا قبل لوسيد: المنزل المعتمَد (سقف جمالوني وماسة في مدخله) لا أيقونة lucide العامة.
  { icon: ModontyHomeMark, label: label.home, href: "/" },
  { icon: IconTrending, label: label.trending, href: "/trending" },
  // «المقالات» — the browse archive (grid + filters + /articles/page/n). The entry was added
  // before the page existed (Khalid, 2026-08-16); the page has since shipped and answers 200.
  { icon: IconArticleList, label: label.articles, href: "/articles" },
  // علامة الشريك المعتمدة (M والماسة) لا أيقونة المبنى العامة — بند PARTMARK.
  { icon: ModontyPartnerMark, label: label.partners, href: "/clients" },
  // The brand's own reels mark, not a generic play triangle — the same glyph the homepage
  // quick-links and the articles action bar already use for this destination.
  { icon: ModontyReelsMark, label: label.reels, href: "/reels" },
  { icon: ModontyAudioMark, label: label.audio, href: "/audio" },
  // «عن مدونتي» — a first-time visitor (and a prospective partner) must find what the
  // platform is from the top bar, not only from the footer (Khalid, 2026-08-15).
  // Teal at rest so it stands apart from the section links (Khalid, 2026-08-16).
  { icon: ModontyMark, label: label.about, href: "/about", tone: "accent" },
];

