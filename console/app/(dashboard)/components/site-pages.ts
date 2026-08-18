import {
  Home,
  Users,
  Briefcase,
  Images,
  Star,
  Newspaper,
  HelpCircle,
  Phone,
  CalendarCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/**
 * The partner's site pages, as modonty renders them (`app/(partner)/clients/[slug]/` — the
 * home + 12 inner routes). One list feeds the «موقعك» nav group and the per-page settings
 * screens, so a page added on modonty is added here once. Labels are the partner's own
 * voice («خدماتنا»), not the visitor's («خدماته») — this is his console.
 */
export interface SitePageDef {
  /** URL segment on modonty (`""` = home) and on the console (`/dashboard/site-pages/<key>`). */
  key: string;
  label: string;
  icon: LucideIcon;
}

export const SITE_PAGES: readonly SitePageDef[] = [
  { key: "home", label: "الرئيسية", icon: Home },
  { key: "about", label: "من نحن", icon: Users },
  { key: "services", label: "خدماتنا", icon: Briefcase },
  { key: "photos", label: "أعمالنا", icon: Images },
  { key: "reviews", label: "آراء العملاء", icon: Star },
  { key: "articles", label: "المدونة", icon: Newspaper },
  { key: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { key: "contact", label: "تواصل معنا", icon: Phone },
  { key: "book", label: "الحجز", icon: CalendarCheck },
] as const;

export function findSitePage(key: string): SitePageDef | undefined {
  return SITE_PAGES.find((p) => p.key === key);
}
