/**
 * Build meta tags object from Settings only (home or list page).
 * PRD: spec Section 3 → Section 5. Used for home, clients, categories, trending.
 */

import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import { tightenGooglebot } from "@modonty/shared/lib/seo/tighten-googlebot";

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
  defaultOgImageType?: string | null;
  defaultHreflang?: string | null;
  defaultPathname?: string | null;
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

const FALLBACK_TITLE = "Modonty";
const FALLBACK_ROBOTS = "index, follow";
const FALLBACK_OG_TYPE = "website";
const FALLBACK_OG_LOCALE = "ar_SA";
const FALLBACK_OG_DETERMINER = "auto";
const FALLBACK_TWITTER_CARD = "summary_large_image";
const FALLBACK_SITEMAP_PRIORITY = 0.5;
const FALLBACK_SITEMAP_CHANGE_FREQ = "monthly";
const FALLBACK_CHARSET = "UTF-8";
const FALLBACK_OG_IMAGE_TYPE = "image/jpeg";
const FALLBACK_HREFLANG = "x-default";
const FALLBACK_PATH = "/";

/** Derive the OG image MIME type from the file extension so the declared type always matches the actual file. */
function imageMimeFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const clean = url.split(/[?#]/)[0].toLowerCase();
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".avif")) return "image/avif";
  return undefined;
}

export function buildMetaFromSettings(
  settings: SettingsForMeta,
  overrides?: BuildMetaFromSettingsOverrides
): Record<string, unknown> {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const path = (overrides?.path ?? settings.defaultPathname ?? FALLBACK_PATH).replace(/^\//, "") || "";
  const canonicalUrl = absoluteUrl(`/${path}`, siteUrl);

  const titleFallback = settings.siteName?.trim() || FALLBACK_TITLE;
  const title = (overrides?.title ?? settings.modontySeoTitle ?? "").trim() || titleFallback;
  const description = (overrides?.description ?? settings.modontySeoDescription ?? settings.brandDescription ?? "").trim();

  const robotsBase = settings.defaultMetaRobots?.trim() || FALLBACK_ROBOTS;
  const robots = `${robotsBase}, max-snippet:-1, max-image-preview:large`;
  // Tightened, never lifted — a crawler-specific tag may only add restrictions.
  const googlebot = tightenGooglebot(robots, settings.defaultGooglebot?.trim() || robots);

  const primaryLang = (settings.defaultOgLocale ?? settings.inLanguage ?? FALLBACK_OG_LOCALE).split("_")[0] || "ar";
  const notranslate = settings.defaultNotranslate ?? primaryLang === "ar";

  const imageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absImage = imageUrl ? (ensureAbsoluteUrl(imageUrl, siteUrl) || imageUrl) : undefined;
  // Derive the OG image MIME type from the actual file extension so the declared type always matches the file.
  const ogImageType = imageMimeFromUrl(absImage) || settings.defaultOgImageType?.trim() || FALLBACK_OG_IMAGE_TYPE;
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
            // No width/height: same reason as build-meta-from-page — one global seeded
            // 1200x630 stood in for every image. The type above IS derived from the real file
            // (imageMimeFromUrl), which is why it stays and the invented pair does not.
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
    // Each of these is omitted when Settings has no value. They used to fall back to `""`,
    // which renders `<meta name="twitter:site" content="">` — a declared-but-empty handle,
    // which reads to a parser as "the account is the empty string" rather than "no account".
    // Same rule the OG block above already follows.
    ...(settings.twitterSite?.trim() ? { site: settings.twitterSite.trim() } : {}),
    ...((settings.twitterCreator ?? settings.twitterSite)?.trim()
      ? { creator: (settings.twitterCreator ?? settings.twitterSite)!.trim() }
      : {}),
    ...(absImage ? { image: absImage } : {}),
    ...(settings.twitterSiteId?.trim() ? { siteId: settings.twitterSiteId.trim() } : {}),
    ...(settings.twitterCreatorId?.trim() ? { creatorId: settings.twitterCreatorId.trim() } : {}),
  };

  const built: Record<string, unknown> = {
    charset: settings.defaultCharset?.trim() || FALLBACK_CHARSET,
    title,
    description,
    robots,
    googlebot,
    notranslate,
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

  return built;
}

export type PageTypeForMeta =
  | "home"
  | "clients"
  | "categories"
  | "trending"
  | "faq"
  | "tags"
  | "industries"
  // The article archive is a master page like the rest — its own SEO title, description and
  // cached blob (Khalid, 25 Aug 2026: it is a core page, do not forget it).
  | "articles";

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
  faq: {
    title: "الأسئلة الشائعة",
    description: "إجابات على الأسئلة الأكثر شيوعاً حول مدونتي - كل ما تحتاج معرفته",
    path: "/help/faq",
  },
  tags: {
    title: "الوسوم",
    description: "تصفح المقالات حسب الوسم - كل الوسوم المتاحة على مدوّنتي",
    path: "/tags",
  },
  industries: {
    title: "القطاعات",
    description: "استكشف الشركات والمحتوى حسب القطاع - كل القطاعات المتاحة",
    path: "/industries",
  },
  articles: {
    title: "كل المقالات",
    description: "كل مقالات مدونتي في مكان واحد — صفِّ بالمجال أو التصنيف، واختر حسب الوقت اللي عندك.",
    path: "/articles",
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
  const s = settings as Record<string, unknown>;
  const titleMap = {
    clients: settings.clientsSeoTitle,
    categories: settings.categoriesSeoTitle,
    trending: settings.trendingSeoTitle,
    faq: s.faqSeoTitle as string | null | undefined,
    tags: s.tagsSeoTitle as string | null | undefined,
    industries: s.industriesSeoTitle as string | null | undefined,
    articles: s.articlesSeoTitle as string | null | undefined,
  } as const;
  const descMap = {
    clients: settings.clientsSeoDescription,
    categories: settings.categoriesSeoDescription,
    trending: settings.trendingSeoDescription,
    faq: s.faqSeoDescription as string | null | undefined,
    tags: s.tagsSeoDescription as string | null | undefined,
    industries: s.industriesSeoDescription as string | null | undefined,
    articles: s.articlesSeoDescription as string | null | undefined,
  } as const;
  const title = titleMap[pageType]?.trim() || fallback.title;
  const description = descMap[pageType]?.trim() || fallback.description;
  return buildMetaFromSettings(settings, {
    title,
    description,
    path: fallback.path,
  });
}
