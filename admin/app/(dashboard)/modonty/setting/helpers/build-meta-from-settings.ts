/**
 * Build meta tags object from Settings only (home or list page).
 * PRD: spec Section 3 → Section 5. Used for home, clients, categories, trending.
 */

import { ensureAbsoluteUrl } from "./build-meta-from-page";

export interface SettingsForMeta {
  siteUrl?: string | null;
  siteName?: string | null;
  brandDescription?: string | null;
  siteAuthor?: string | null;
  modontySeoTitle?: string | null;
  modontySeoDescription?: string | null;
  clientsSeoTitle?: string | null;
  clientsSeoDescription?: string | null;
  categoriesSeoTitle?: string | null;
  categoriesSeoDescription?: string | null;
  trendingSeoTitle?: string | null;
  trendingSeoDescription?: string | null;
  defaultMetaRobots?: string | null;
  defaultGooglebot?: string | null;
  defaultOgType?: string | null;
  defaultOgLocale?: string | null;
  defaultOgDeterminer?: string | null;
  defaultTwitterCard?: string | null;
  defaultCharset?: string | null;
  defaultViewport?: string | null;
  defaultOgImageType?: string | null;
  defaultOgImageWidth?: number | null;
  defaultOgImageHeight?: number | null;
  defaultHreflang?: string | null;
  defaultPathname?: string | null;
  themeColor?: string | null;
  defaultSitemapPriority?: number | null;
  defaultSitemapChangeFreq?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  twitterSiteId?: string | null;
  twitterCreatorId?: string | null;
  logoUrl?: string | null;
  ogImageUrl?: string | null;
  altImage?: string | null;
  inLanguage?: string | null;
  defaultReferrerPolicy?: string | null;
  defaultNotranslate?: boolean | null;
}

export interface BuildMetaFromSettingsOverrides {
  title?: string;
  description?: string;
  path?: string;
}

const FALLBACK_SITE_URL = "https://modonty.com";
const FALLBACK_TITLE = "Modonty";
const FALLBACK_ROBOTS = "index, follow";
const FALLBACK_OG_TYPE = "website";
const FALLBACK_OG_LOCALE = "ar_SA";
const FALLBACK_OG_DETERMINER = "auto";
const FALLBACK_TWITTER_CARD = "summary_large_image";
const FALLBACK_SITEMAP_PRIORITY = 0.5;
const FALLBACK_SITEMAP_CHANGE_FREQ = "monthly";
const FALLBACK_THEME_COLOR = "#3030FF";
const FALLBACK_CHARSET = "UTF-8";
const FALLBACK_VIEWPORT = "width=device-width, initial-scale=1";
const FALLBACK_OG_IMAGE_TYPE = "image/jpeg";
const FALLBACK_OG_IMAGE_WIDTH = 1200;
const FALLBACK_OG_IMAGE_HEIGHT = 630;
const FALLBACK_HREFLANG = "x-default";
const FALLBACK_PATH = "/";

export function buildMetaFromSettings(
  settings: SettingsForMeta,
  overrides?: BuildMetaFromSettingsOverrides
): Record<string, unknown> {
  const siteUrl = (settings.siteUrl?.trim() || FALLBACK_SITE_URL).replace(/\/$/, "");
  const path = (overrides?.path ?? settings.defaultPathname ?? FALLBACK_PATH).replace(/^\//, "") || "";
  const canonicalUrl = path ? `${siteUrl}/${path}` : `${siteUrl}/`;

  const titleFallback = settings.siteName?.trim() || FALLBACK_TITLE;
  const title = (overrides?.title ?? settings.modontySeoTitle ?? "").trim() || titleFallback;
  const description = (overrides?.description ?? settings.modontySeoDescription ?? settings.brandDescription ?? "").trim();

  const robotsBase = settings.defaultMetaRobots?.trim() || FALLBACK_ROBOTS;
  const robots = `${robotsBase}, max-snippet:-1, max-image-preview:large`;
  const googlebot = settings.defaultGooglebot?.trim() || robots;

  const primaryLang = (settings.defaultOgLocale ?? settings.inLanguage ?? FALLBACK_OG_LOCALE).split("_")[0] || "ar";
  const notranslate = settings.defaultNotranslate ?? primaryLang === "ar";

  const imageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absImage = imageUrl ? (ensureAbsoluteUrl(imageUrl, siteUrl) || imageUrl) : undefined;
  const ogImageType = settings.defaultOgImageType?.trim() || FALLBACK_OG_IMAGE_TYPE;
  const ogImageWidth = settings.defaultOgImageWidth ?? FALLBACK_OG_IMAGE_WIDTH;
  const ogImageHeight = settings.defaultOgImageHeight ?? FALLBACK_OG_IMAGE_HEIGHT;
  const ogImageAlt = (settings.altImage ?? settings.siteName ?? "").trim();

  const hreflangDefault = settings.defaultHreflang?.trim() || FALLBACK_HREFLANG;
  const hreflang: Array<{ lang: string; href: string }> = [
    { lang: primaryLang, href: canonicalUrl },
    { lang: hreflangDefault, href: canonicalUrl },
  ];

  const openGraph = {
    title,
    description,
    type: settings.defaultOgType?.trim() || FALLBACK_OG_TYPE,
    url: canonicalUrl,
    siteName: settings.siteName?.trim() || titleFallback,
    locale: settings.defaultOgLocale?.trim() || FALLBACK_OG_LOCALE,
    localeAlternate: [] as string[],
    determiner: settings.defaultOgDeterminer?.trim() || FALLBACK_OG_DETERMINER,
    images: absImage
      ? [
          {
            url: absImage,
            secure_url: absImage,
            type: ogImageType,
            width: ogImageWidth,
            height: ogImageHeight,
            alt: ogImageAlt,
          },
        ]
      : [],
  };

  const twitter = {
    card: settings.defaultTwitterCard?.trim() || FALLBACK_TWITTER_CARD,
    title,
    description,
    imageAlt: ogImageAlt,
    site: settings.twitterSite?.trim() ?? "",
    creator: (settings.twitterCreator ?? settings.twitterSite)?.trim() ?? "",
    image: absImage ?? "",
    siteId: settings.twitterSiteId?.trim() ?? "",
    creatorId: settings.twitterCreatorId?.trim() ?? "",
  };

  const built: Record<string, unknown> = {
    charset: settings.defaultCharset?.trim() || FALLBACK_CHARSET,
    viewport: settings.defaultViewport?.trim() || FALLBACK_VIEWPORT,
    title,
    description,
    robots,
    googlebot,
    notranslate,
    themeColor: settings.themeColor?.trim() || FALLBACK_THEME_COLOR,
    canonical: canonicalUrl,
    author: settings.siteAuthor?.trim() ?? "",
    hreflang,
    sitemapPriority: settings.defaultSitemapPriority ?? FALLBACK_SITEMAP_PRIORITY,
    sitemapChangeFreq: settings.defaultSitemapChangeFreq?.trim() || FALLBACK_SITEMAP_CHANGE_FREQ,
    openGraph,
    twitter,
  };

  if (settings.defaultReferrerPolicy?.trim()) {
    built.referrerPolicy = settings.defaultReferrerPolicy.trim();
  }
  built.msapplicationTileColor = settings.themeColor?.trim() || FALLBACK_THEME_COLOR;

  return built;
}

export type PageTypeForMeta = "home" | "clients" | "categories" | "trending";

const LIST_PAGE_FALLBACKS: Record<
  Exclude<PageTypeForMeta, "home">,
  { title: string; description: string; path: string }
> = {
  clients: {
    title: "العملاء - دليل الشركات والمؤسسات",
    description: "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال",
    path: "/clients",
  },
  categories: {
    title: "الفئات",
    description: "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
    path: "/categories",
  },
  trending: {
    title: "الأكثر رواجاً",
    description: "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن",
    path: "/trending",
  },
};

export function buildMetaFromSettingsForPageType(
  settings: SettingsForMeta,
  pageType: PageTypeForMeta
): Record<string, unknown> {
  if (pageType === "home") {
    return buildMetaFromSettings(settings);
  }
  const fallback = LIST_PAGE_FALLBACKS[pageType];
  const titleMap = {
    clients: settings.clientsSeoTitle,
    categories: settings.categoriesSeoTitle,
    trending: settings.trendingSeoTitle,
  } as const;
  const descMap = {
    clients: settings.clientsSeoDescription,
    categories: settings.categoriesSeoDescription,
    trending: settings.trendingSeoDescription,
  } as const;
  const title = titleMap[pageType]?.trim() || fallback.title;
  const description = descMap[pageType]?.trim() || fallback.description;
  return buildMetaFromSettings(settings, {
    title,
    description,
    path: fallback.path,
  });
}
