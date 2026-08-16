import type { ComponentType } from "react";
import { IconHome, IconTrending, IconClients, IconPlay, IconVolume2 } from "@/lib/icons";
import { ModontyMark } from "@/components/icons/modonty-mark";

export interface MainNavItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export const mainNavItems: MainNavItem[] = [
  { icon: IconHome, label: "الرئيسية", href: "/" },
  { icon: IconTrending, label: "الرائجة", href: "/trending" },
  { icon: IconClients, label: "الشركاء", href: "/clients" },
  { icon: IconPlay, label: "الطلّات", href: "/reels" },
  { icon: IconVolume2, label: "استمع", href: "/audio" },
  // «عن مدونتي» — a first-time visitor (and a prospective partner) must find what the
  // platform is from the top bar, not only from the footer (Khalid, 2026-08-15).
  { icon: ModontyMark, label: "عن مدونتي", href: "/about" },
];

