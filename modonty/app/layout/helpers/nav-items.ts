import type { ComponentType } from "react";
// Direct import, not the `@/lib/icons` barrel: from a client tree the barrel pulled all 69 registry
// icons into every page (bundle analyzer, 3 Oct 2026). Same brand marks, same names.
import { ModontyTrendingMark as IconTrending } from "@/components/icons/modonty-trending-mark";
import { ModontyArticlesMark as IconArticleList } from "@/components/icons/modonty-articles-mark";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { ModontyHomeMark } from "@/components/icons/modonty-home-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { ModontyHomeFilledMark } from "@/components/icons/modonty-home-filled-mark";
import { ModontyArticlesFilledMark } from "@/components/icons/modonty-articles-filled-mark";
import { ModontyReelsFilledMark } from "@/components/icons/modonty-reels-filled-mark";
import { ModontyAudioFilledMark } from "@/components/icons/modonty-audio-filled-mark";

/** The `chrome.menuItems` keys the top nav uses — its wording lives in messages/ar.json. */
export type MainNavLabelKey = "home" | "trending" | "articles" | "partners" | "reels" | "audio" | "about";

export interface MainNavItemDef {
  icon: ComponentType<{ className?: string }>;
  /** The selected-state mark (ICON-STANDARD-v2 §6). Marks without a Filled variant keep `icon`. */
  activeIcon?: ComponentType<{ className?: string }>;
  labelKey: MainNavLabelKey;
  href: string;
  /** `accent`: teal text (`--link-accent`) at rest — the one item that is the brand itself. */
  tone?: "accent";
}

/**
 * The top nav's destinations WITHOUT their wording (Khalid, 3 Oct 2026, Techne day 1).
 *
 * The desktop nav is a client component; it imported `nav-config.ts`, which imports `messages`,
 * so the whole Arabic messages file (ar.json — 49 KB compressed in the bundle analyzer) shipped
 * to every visitor on every page. Icons and hrefs live here, text-free; a server parent passes
 * `messages.chrome.menuItems` down, and `nav-config.ts` still builds the labelled list for
 * server readers from this same array — one list, no drift.
 */
export const mainNavItemDefs: MainNavItemDef[] = [
  // علامتنا قبل لوسيد: المنزل المعتمَد (سقف جمالوني وماسة في مدخله) لا أيقونة lucide العامة.
  { icon: ModontyHomeMark, activeIcon: ModontyHomeFilledMark, labelKey: "home", href: "/" },
  { icon: IconTrending, labelKey: "trending", href: "/trending" },
  // «المقالات» — the browse archive (grid + filters + /articles/page/n).
  { icon: IconArticleList, activeIcon: ModontyArticlesFilledMark, labelKey: "articles", href: "/articles" },
  // علامة الشريك المعتمدة (M والماسة) لا أيقونة المبنى العامة — بند PARTMARK.
  { icon: ModontyPartnerMark, labelKey: "partners", href: "/clients" },
  // The brand's own reels mark, not a generic play triangle.
  { icon: ModontyReelsMark, activeIcon: ModontyReelsFilledMark, labelKey: "reels", href: "/reels" },
  { icon: ModontyAudioMark, activeIcon: ModontyAudioFilledMark, labelKey: "audio", href: "/audio" },
  // «عن مدونتي» opens مدونتي's own client page (`/modonty`), teal at rest (Khalid, 2026-08-16 · 2026-09-24).
  { icon: ModontyMark, labelKey: "about", href: "/modonty", tone: "accent" },
];
