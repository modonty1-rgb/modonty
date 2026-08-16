import type { ComponentType } from "react";
import { IconHome, IconTrending, IconClients, IconPlay, IconVolume2 } from "@/lib/icons";
import { ModontyMark } from "@/components/icons/modonty-mark";

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
  { icon: IconClients, label: "الشركاء", href: "/clients" },
  { icon: IconPlay, label: "الطلّات", href: "/reels" },
  { icon: IconVolume2, label: "استمع", href: "/audio" },
  // «عن مدونتي» — a first-time visitor (and a prospective partner) must find what the
  // platform is from the top bar, not only from the footer (Khalid, 2026-08-15).
  // Teal at rest so it stands apart from the section links (Khalid, 2026-08-16).
  { icon: ModontyMark, label: "عن مدونتي", href: "/about", tone: "accent" },
];

