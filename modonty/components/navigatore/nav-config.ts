import type { ComponentType } from "react";
import { IconHome, IconTrending, IconCategories, IconClients, IconSaved } from "@/lib/icons";
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
  { icon: IconCategories, label: "الفئات", href: "/categories", section: "categories" },
  { icon: IconClients, label: "العملاء", href: "/clients", section: "clients" },
  { icon: IconSaved, label: "المحفوظات", href: "/users/profile/favorites", section: "none" },
];

