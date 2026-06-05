import type { ComponentType } from "react";
import { IconHome, IconTrending, IconClients } from "@/lib/icons";

export interface MainNavItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export const mainNavItems: MainNavItem[] = [
  { icon: IconHome, label: "الرئيسية", href: "/" },
  { icon: IconTrending, label: "الرائجة", href: "/trending" },
  { icon: IconClients, label: "العملاء", href: "/clients" },
];

