import type { ComponentType } from "react";
import { messages } from "@/lib/i18n/messages";
import { mainNavItemDefs } from "./nav-items";

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

export const mainNavItems: MainNavItem[] = mainNavItemDefs.map(({ labelKey, ...item }) => ({ ...item, label: label[labelKey] }));

