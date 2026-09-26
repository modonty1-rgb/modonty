import type { ComponentType, SVGProps } from "react";
import {
  IconAi,
  IconEducation,
  IconEntertainment,
  IconFootball,
  IconHealth,
  IconLink,
  IconLuckyWheel,
  IconMarkets,
  IconQuran,
} from "@/lib/icons";

export type SectorSlug =
  | "quran"
  | "luckyWheel"
  | "modoLink"
  | "football"
  | "ai"
  | "markets"
  | "entertainment"
  | "education"
  | "health";

interface Sector {
  slug: SectorSlug;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** A wide card with the icon beside its name — the doors that are pages of their own. */
  featured?: boolean;
}

/**
 * The doors on `/modonty`, in the order the grid draws them.
 *
 * Featured first — the ones that are (or will be) pages of their own, not sector feeds:
 *  · القرآن الكريم (26 Sep 2026) → `/quran`, split out of `/audio`.
 *  · عجلة الحظ (26 Sep) → `/lucky-wheel`, the Techne Summit wheel, already live.
 *  · مودو لينك (26 Sep) → `/modo-link`, not built yet — Khalid explains it next.
 * Then the six sectors (24 Sep), chosen from what Saudis actually search and do — Google
 * Year in Search 2025, the CST internet report and GASTAT; evidence in
 * `documentation/SECTORS-CONCEPT.html`. They open `/modonty/<slug>`, not built yet.
 * Nothing was dropped for the new doors (Khalid: «خلي الباقي موجود لحد ما نفلتر»).
 *
 * Labels are in `messages.modonty.sectors`, keyed by slug.
 */
export const SECTORS: readonly Sector[] = [
  { slug: "quran", href: "/quran", icon: IconQuran, featured: true },
  { slug: "luckyWheel", href: "/lucky-wheel", icon: IconLuckyWheel, featured: true },
  { slug: "modoLink", href: "/modo-link", icon: IconLink, featured: true },
  { slug: "football", href: "/modonty/football", icon: IconFootball },
  { slug: "ai", href: "/modonty/ai", icon: IconAi },
  { slug: "markets", href: "/modonty/markets", icon: IconMarkets },
  { slug: "entertainment", href: "/modonty/entertainment", icon: IconEntertainment },
  { slug: "education", href: "/modonty/education", icon: IconEducation },
  { slug: "health", href: "/modonty/health", icon: IconHealth },
];
