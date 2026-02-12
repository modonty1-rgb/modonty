import type { ComponentType } from "react";
import { Home, Tags, Building2, TrendingUp } from "lucide-react";
import type { NavSection } from "@/components/navigatore/TopNav";

export interface MainNavItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  section: NavSection;
}

export const mainNavItems: MainNavItem[] = [
  { icon: Home, label: "الرئيسية", href: "/", section: "home" },
  { icon: TrendingUp, label: "الرائجة", href: "/trending", section: "trending" },
  { icon: Tags, label: "الفئات", href: "/categories", section: "categories" },
  { icon: Building2, label: "العملاء", href: "/clients", section: "clients" },
];

