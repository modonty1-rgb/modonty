import {
  Newspaper,
  Images,
  Film,
  Video,
  ImagePlus,
  LayoutTemplate,
  Megaphone,
  Mail,
  UserPlus,
  CalendarCheck,
  Building2,
  Sparkles,
  HelpCircle,
  MessageCircleQuestion,
  Quote,
  Star,
  Activity,
  Receipt,
} from "lucide-react";
import { ar } from "@/lib/ar";

import type { LucideIcon } from "lucide-react";

/**
 * One description of the client's navigation, read by the desktop rail AND the phone
 * sheet. They used to carry two hand-written copies of the same list, and the copies
 * drifted: «مقالاتك على موقعك» shipped to the rail and was never added to the sheet, so
 * clients on phones had no way to reach the screen at all.
 */
export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  badgeLabel?: string;
  badgeVariant?: "default" | "danger" | "success";
}

export interface NavGroupConfig {
  key: string;
  label: string;
  items: NavItemConfig[];
}

export interface NavCounts {
  pendingArticlesCount: number;
  subscribersCount: number;
  leadsCount: number;
  newBookingsCount: number;
  pendingFaqsCount: number;
  pendingPageFaqsCount: number;
  pendingClientCommentsCount: number;
  pendingClientReviewsCount: number;
  galleryCount: number;
  reelsCount: number;
  videosCount: number;
  isYmyl: boolean;
  ymylComplete: boolean;
}

/**
 * Pinned above every group, outside the accordion (Khalid 2026-08-11). Articles is the
 * screen the client opens most, and grouping had pushed it behind a closed drawer — a
 * daily destination must not cost a click to find. It is listed here and NOT inside
 * «المحتوى», so the same link never renders twice with two active states.
 */
export function buildPinnedNavItems(counts: NavCounts): NavItemConfig[] {
  return [
    {
      href: "/dashboard/articles",
      icon: Newspaper,
      label: ar.nav.articles,
      badge: counts.pendingArticlesCount,
    },
    {
      href: "/dashboard/faqs",
      icon: HelpCircle,
      label: ar.nav.faqs,
      badge: counts.pendingFaqsCount,
    },
  ];
}

export function buildNavGroups(counts: NavCounts): NavGroupConfig[] {
  return [
    {
      key: "business",
      label: ar.nav.groupBusiness,
      items: [
        {
          href: "/dashboard/profile",
          icon: Building2,
          label: ar.nav.profile,
          badgeLabel: counts.isYmyl ? "YMYL" : undefined,
          badgeVariant: counts.isYmyl ? (counts.ymylComplete ? "success" : "danger") : undefined,
        },
        { href: "/dashboard/seo", icon: Sparkles, label: ar.nav.seo },
        { href: "/dashboard/page-content", icon: LayoutTemplate, label: ar.nav.pageContent },
        {
          href: "/dashboard/page-faq",
          icon: MessageCircleQuestion,
          label: ar.nav.pageFaq,
          badge: counts.pendingPageFaqsCount,
        },
      ],
    },
    // The «المحتوى» group is gone (Khalid 2026-08-11): «مقالاتك على موقعك» became a tab
    // inside «المقالات», and «نشاط المحتوى» was a second rendering of the same lists —
    // its one unique number, the monthly quota, now sits above those tabs.
    {
      // The three upload sections all carry a plain item count — a section that holds
      // something must never read zero (Khalid 2026-08-05). Reels sit next to the gallery
      // they feed from (2026-08-04), kept apart from videos (ق8).
      key: "media",
      label: ar.nav.groupMedia,
      items: [
        {
          href: "/dashboard/gallery",
          icon: ImagePlus,
          label: ar.nav.gallery,
          badge: counts.galleryCount,
        },
        { href: "/dashboard/reels", icon: Film, label: ar.nav.reels, badge: counts.reelsCount },
        { href: "/dashboard/videos", icon: Video, label: ar.nav.videos, badge: counts.videosCount },
        { href: "/dashboard/media", icon: Images, label: ar.nav.media },
      ],
    },
    {
      key: "audience",
      label: ar.nav.groupAudience,
      items: [
        {
          href: "/dashboard/subscribers",
          icon: Mail,
          label: ar.nav.subscribers,
          badge: counts.subscribersCount,
        },
        {
          href: "/dashboard/leads",
          icon: UserPlus,
          label: ar.nav.leads,
          badge: counts.leadsCount,
        },
        {
          href: "/dashboard/bookings",
          icon: CalendarCheck,
          label: ar.nav.bookings,
          badge: counts.newBookingsCount,
        },
        {
          href: "/dashboard/client-comments",
          icon: Quote,
          label: ar.nav.clientComments,
          badge: counts.pendingClientCommentsCount,
        },
        {
          href: "/dashboard/client-reviews",
          icon: Star,
          label: ar.nav.clientReviews,
          badge: counts.pendingClientReviewsCount,
        },
      ],
    },
    {
      key: "account",
      label: ar.nav.groupAccount,
      items: [
        { href: "/dashboard/invoices", icon: Receipt, label: ar.nav.invoices },
        {
          href: "/dashboard/campaigns",
          icon: Megaphone,
          label: ar.nav.campaigns,
          badgeLabel: ar.campaigns.beta,
        },
      ],
    },
  ];
}

/**
 * Outside every group on purpose: it diagnoses the client's own website, so it belongs to
 * none of the five and would read as an odd member inside any of them. It also stays
 * visible while a group is closed — a client chasing a broken site should not have to
 * guess which drawer hides the check.
 */
export const SITE_HEALTH_ITEM: NavItemConfig = {
  href: "/dashboard/site-health",
  icon: Activity,
  label: ar.nav.siteHealth,
};
