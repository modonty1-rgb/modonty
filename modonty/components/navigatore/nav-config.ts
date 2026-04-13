import type { ComponentType } from "react";
import { IconHome, IconTrending, IconClients } from "@/lib/icons";
import type { NavSection } from "@/components/navigatore/TopNav";

export interface MainNavItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  section: NavSection;
}

export const mainNavItems: MainNavItem[] = [
  { icon: IconHome, label: "الرئيسية", href: "/", section: "home" },
  { icon: IconTrending, label: "الرائجة", href: "/trending", section: "trending" },
  { icon: IconClients, label: "العملاء", href: "/clients", section: "clients" },
];

