import type { ComponentType } from "react";
import { IconHome, IconTrending, IconArticleList } from "@/lib/icons";
import { ModontyMark } from "@/components/icons/modonty-mark";
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

export const mainNavItems: MainNavItem[] = [
  { icon: IconHome, label: "الرئيسية", href: "/" },
  { icon: IconTrending, label: "الرائجة", href: "/trending" },
  // «المقالات» — the browse archive (grid + filters + /articles/page/n). Route not built yet
  // (Khalid, 2026-08-16: add the entry now, build the page later — board card A1).
  { icon: IconArticleList, label: "المقالات", href: "/articles" },
  // علامة الشريك المعتمدة (M والماسة) لا أيقونة المبنى العامة — بند PARTMARK.
  { icon: ModontyPartnerMark, label: "الشركاء", href: "/clients" },
  // The brand's own reels mark, not a generic play triangle — the same glyph the homepage
  // quick-links and the articles action bar already use for this destination.
  { icon: ModontyReelsMark, label: "الطلّات", href: "/reels" },
  { icon: ModontyAudioMark, label: "استمع", href: "/audio" },
  // «عن مدونتي» — a first-time visitor (and a prospective partner) must find what the
  // platform is from the top bar, not only from the footer (Khalid, 2026-08-15).
  // Teal at rest so it stands apart from the section links (Khalid, 2026-08-16).
  { icon: ModontyMark, label: "عن مدونتي", href: "/about", tone: "accent" },
];

