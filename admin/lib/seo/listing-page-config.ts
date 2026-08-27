import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";

/**
 * One table describing every listing page, and one function turning it into the config the
 * metadata builder takes.
 *
 * It exists because the admin had TWO of these. The writer
 * (`listing-page-seo-generator.ts`) built its config inline per page and fed it to
 * `buildListingMetadata`; the preview (`generate-home-and-list-page-seo.ts`) called a
 * separate helper, `buildMetaFromSettingsForPageType`, which carried its own
 * `LIST_PAGE_FALLBACKS` — seven Arabic titles and descriptions written in code. So an
 * editor reviewing `/categories` with an empty Settings title was shown «الفئات», approved
 * it, saved — and the writer stored no title at all, because it invents nothing. The screen
 * showed one page and the database held another.
 *
 * Two rules meet here:
 *   · the preview must call what the writer calls — the whole point of a preview;
 *   · a value nobody typed is not a value. An absent title stays absent, and the editor
 *     sees that it is absent instead of seeing a sentence that will never ship.
 *
 * `breadcrumbName` is the one string that legitimately lives in code: it is the crumb label
 * for a fixed route, not content, and Settings has no column for it.
 */

/** Every listing page the admin can generate SEO for, home excluded (it has its own shape). */
export const LISTING_PAGE_SPECS = {
  categories: { path: "/categories", crumb: "التصنيفات", titleKey: "categoriesSeoTitle", descKey: "categoriesSeoDescription", imageKey: "categoriesPageImage", imageAltKey: "categoriesPageImageAlt" },
  tags: { path: "/tags", crumb: "التاجات", titleKey: "tagsSeoTitle", descKey: "tagsSeoDescription", imageKey: "tagsPageImage", imageAltKey: "tagsPageImageAlt" },
  industries: { path: "/industries", crumb: "القطاعات", titleKey: "industriesSeoTitle", descKey: "industriesSeoDescription", imageKey: "industriesPageImage", imageAltKey: "industriesPageImageAlt" },
  clients: { path: "/clients", crumb: "العملاء", titleKey: "clientsSeoTitle", descKey: "clientsSeoDescription", imageKey: null, imageAltKey: null },
  trending: { path: "/trending", crumb: "الرائج", titleKey: "trendingSeoTitle", descKey: "trendingSeoDescription", imageKey: null, imageAltKey: null },
  articles: { path: "/articles", crumb: "المقالات", titleKey: "articlesSeoTitle", descKey: "articlesSeoDescription", imageKey: null, imageAltKey: null },
  faq: { path: "/help/faq", crumb: "الأسئلة الشائعة", titleKey: "faqSeoTitle", descKey: "faqSeoDescription", imageKey: null, imageAltKey: null },
} as const;

export type ListingPageKey = keyof typeof LISTING_PAGE_SPECS;

export interface ListingPageConfig {
  pageUrl: string;
  title?: string;
  description?: string;
  siteName: string;
  siteUrl: string;
  breadcrumbName: string;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  settings: Record<string, unknown>;
}

const str = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : undefined;
};

/**
 * Build the config for one listing page from the Settings row. Called by BOTH the writer and
 * the preview, so what the editor reviews is what gets stored — byte for byte.
 */
export function listingPageConfig(
  page: ListingPageKey,
  settings: Record<string, unknown>,
  siteUrl: string,
  siteName: string,
): ListingPageConfig {
  const spec = LISTING_PAGE_SPECS[page];
  return {
    pageUrl: absoluteUrl(spec.path, siteUrl),
    // No fallback. An empty Settings title reaches the builder as `undefined` and the
    // builder omits it — which is what the editor needs to SEE.
    title: str(settings[spec.titleKey]),
    description: str(settings[spec.descKey]),
    siteName,
    siteUrl,
    breadcrumbName: spec.crumb,
    // Per-page hero image (also the og:image) falls back to the global site image, exactly
    // as each writer block did. Pages with no per-page column go straight to the global one.
    ogImage: (spec.imageKey ? str(settings[spec.imageKey]) : undefined) ?? str(settings.ogImageUrl),
    ogImageAlt: (spec.imageAltKey ? str(settings[spec.imageAltKey]) : undefined) ?? str(settings.altImage),
    settings,
  };
}
