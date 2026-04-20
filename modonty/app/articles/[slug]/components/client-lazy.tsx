"use client";

/**
 * All ssr:false dynamic imports for the article page must live in a
 * 'use client' file — Next.js App Router does not allow ssr:false
 * inside Server Components.
 */
import dynamic from "next/dynamic";

export const GTMClientTracker = dynamic(
  () => import("@/components/gtm/GTMClientTracker").then((m) => ({ default: m.GTMClientTracker })),
  { ssr: false }
);

export const ArticleViewTracker = dynamic(
  () => import("./article-view-tracker").then((m) => ({ default: m.ArticleViewTracker })),
  { ssr: false }
);

export const ArticleBodyLinkTracker = dynamic(
  () => import("./article-body-link-tracker").then((m) => ({ default: m.ArticleBodyLinkTracker })),
  { ssr: false }
);

export const ArticleMobileLayout = dynamic(
  () => import("./article-mobile-layout").then((m) => ({ default: m.ArticleMobileLayout })),
  { ssr: false }
);

export const NewsletterCTA = dynamic(
  () => import("./sidebar/newsletter-cta").then((m) => ({ default: m.NewsletterCTA })),
  { ssr: false }
);

export const ArticleFeaturedImageNewsletter = dynamic(
  () =>
    import("./article-featured-image-newsletter").then((m) => ({
      default: m.ArticleFeaturedImageNewsletter,
    })),
  { ssr: false }
);

export const ArticleSidebarEngagement = dynamic(
  () =>
    import("./sidebar/article-sidebar-engagement").then((m) => ({
      default: m.ArticleSidebarEngagement,
    })),
  { ssr: false }
);
