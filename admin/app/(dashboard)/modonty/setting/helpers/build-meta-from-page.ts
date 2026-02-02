/**
 * Build meta tags object from a page-like object. Shared by generate-modonty-page-seo and get-live-preview-seo.
 */

export function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

function toBcp47FromLocale(locale: string): string {
  /**
   * Normalize locales like "en_US" / "en-us" to BCP‑47 ("en-US").
   * Keeps the special Google hreflang value "x-default" as-is.
   */
  const trimmed = locale.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "x-default") return "x-default";

  const parts = trimmed.split(/[_-]/).filter(Boolean);
  if (parts.length === 0) return "";

  const language = parts[0].toLowerCase();
  const region = parts[1]?.toUpperCase();

  return region ? `${language}-${region}` : language;
}

function buildHreflangFromAlternateLanguages(
  alternateLanguages: unknown,
  ogLocale: string | null | undefined,
  canonicalUrl: string,
  siteUrl: string,
  defaultHreflang: string = FALLBACK_HREFLANG
): Array<{ lang: string; href: string }> {
  const primaryLang = (ogLocale ?? "ar_SA").split("_")[0] || "ar";
  const result: Array<{ lang: string; href: string }> = [];
  const seen = new Set<string>();
  const xDefault = defaultHreflang?.trim() || FALLBACK_HREFLANG;

  if (Array.isArray(alternateLanguages) && alternateLanguages.length > 0) {
    for (const item of alternateLanguages) {
      const entry = item as { hreflang?: string; url?: string };
      const raw = (entry.hreflang ?? "").trim();
      const lang = raw ? toBcp47FromLocale(raw) : primaryLang;
      const href = (entry.url ?? "").trim() || canonicalUrl;
      if (lang && !seen.has(lang)) {
        seen.add(lang);
        result.push({ lang, href });
      }
    }
  }

  if (!seen.has(primaryLang)) {
    result.push({ lang: primaryLang, href: canonicalUrl });
  }
  if (!seen.has(xDefault)) {
    result.push({ lang: xDefault, href: canonicalUrl });
  }
  return result;
}

function buildHreflangFromOgLocaleAlternate(
  ogLocaleAlternate: string | null | undefined,
  ogLocale: string | null | undefined,
  canonicalUrl: string,
  siteUrl: string,
  defaultHreflang: string = FALLBACK_HREFLANG,
  defaultPathname: string = FALLBACK_PATHNAME
): Array<{ lang: string; href: string }> {
  const primaryLang = (ogLocale ?? "ar_SA").split("_")[0] || "ar";
  const raw = (ogLocaleAlternate ?? "").trim();
  const xDefault = defaultHreflang?.trim() || FALLBACK_HREFLANG;
  const fallbackPath = defaultPathname?.trim() || FALLBACK_PATHNAME;
  if (!raw) {
    return [
      { lang: primaryLang, href: canonicalUrl },
      { lang: xDefault, href: canonicalUrl },
    ];
  }
  let base: string;
  let pathname: string;
  try {
    const url = new URL(canonicalUrl || `${siteUrl}/`);
    base = url.origin;
    pathname = url.pathname || fallbackPath;
  } catch {
    base = siteUrl;
    pathname = fallbackPath;
  }
  const locales = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const result: Array<{ lang: string; href: string }> = [];
  const seen = new Set<string>();

  if (!seen.has(primaryLang)) {
    result.push({ lang: primaryLang, href: canonicalUrl });
    seen.add(primaryLang);
  }
  for (const locale of locales) {
    const hreflang = toBcp47FromLocale(locale);
    if (!hreflang) continue;
    const langSegment = hreflang.split("-")[0];
    const href =
      pathname === "/"
        ? `${base}/${langSegment}`
        : `${base}/${langSegment}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    if (!seen.has(hreflang)) {
      seen.add(hreflang);
      result.push({ lang: hreflang, href });
    }
  }
  if (!seen.has(xDefault)) {
    result.push({ lang: xDefault, href: canonicalUrl });
  }
  return result;
}

export interface PageLikeForMeta {
  slug: string;
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  inLanguage?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  ogImage?: string | null;
  metaRobots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogType?: string | null;
  ogUrl?: string | null;
  ogSiteName?: string | null;
  ogLocale?: string | null;
  alternateLanguages?: unknown;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  twitterImage?: string | null;
  twitterImageAlt?: string | null;
}

export interface BuildMetaOptions {
  siteUrl: string;
  existingMeta?: Record<string, unknown>;
  author?: string;
  ogLocaleAlternateStr?: string | null;
  themeColor?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterSiteId?: string;
  twitterCreatorId?: string;
  defaultSiteName?: string;
  defaultMetaRobots?: string;
  defaultGooglebot?: string;
  defaultOgType?: string;
  defaultOgLocale?: string;
  defaultOgDeterminer?: string;
  defaultTwitterCard?: string;
  defaultSitemapPriority?: number;
  defaultSitemapChangeFreq?: string;
  defaultCharset?: string;
  defaultViewport?: string;
  defaultOgImageType?: string;
  defaultOgImageWidth?: number;
  defaultOgImageHeight?: number;
  defaultHreflang?: string;
  defaultPathname?: string;
  titleMaxLength?: number;
  descriptionMaxLength?: number;
  defaultTruncationSuffix?: string;
}

const FALLBACK_TITLE_MAX = 60;
const FALLBACK_DESCRIPTION_MAX = 160;

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
const FALLBACK_PATHNAME = "/";

export function buildMetaFromPageLike(pageLike: PageLikeForMeta, options: BuildMetaOptions): Record<string, unknown> {
  const {
    siteUrl,
    existingMeta = {},
    author: authorOverride,
    ogLocaleAlternateStr,
    themeColor: themeColorOverride,
    twitterSite: twitterSiteOverride,
    twitterCreator: twitterCreatorOverride,
    twitterSiteId: twitterSiteIdOverride,
    twitterCreatorId: twitterCreatorIdOverride,
    defaultSiteName,
    defaultMetaRobots,
    defaultGooglebot,
    defaultOgType,
    defaultOgLocale,
    defaultOgDeterminer,
    defaultTwitterCard,
    defaultSitemapPriority,
    defaultSitemapChangeFreq,
    defaultCharset,
    defaultViewport,
    defaultOgImageType,
    defaultOgImageWidth,
    defaultOgImageHeight,
    defaultHreflang,
    defaultPathname,
    titleMaxLength,
    descriptionMaxLength,
    defaultTruncationSuffix,
  } = options;

  const titleMax = titleMaxLength ?? FALLBACK_TITLE_MAX;
  const descMax = descriptionMaxLength ?? FALLBACK_DESCRIPTION_MAX;
  const truncationSuffix = (defaultTruncationSuffix?.trim() || "...");
  const ogImageType = defaultOgImageType?.trim() || FALLBACK_OG_IMAGE_TYPE;
  const ogImageWidth = defaultOgImageWidth ?? FALLBACK_OG_IMAGE_WIDTH;
  const ogImageHeight = defaultOgImageHeight ?? FALLBACK_OG_IMAGE_HEIGHT;
  const charsetValue = defaultCharset?.trim() || FALLBACK_CHARSET;
  const viewportValue = defaultViewport?.trim() || FALLBACK_VIEWPORT;

  const canonicalUrl = ensureAbsoluteUrl(pageLike.canonicalUrl, siteUrl) || `${siteUrl}/${pageLike.slug}`;
  const ogUrlResolved = pageLike.ogUrl?.trim() ? ensureAbsoluteUrl(pageLike.ogUrl, siteUrl) : null;
  const openGraphUrl = ogUrlResolved || canonicalUrl;

  const titleFallback = defaultSiteName?.trim() || FALLBACK_TITLE;
  const title = (pageLike.seoTitle || pageLike.title || "").trim() || titleFallback;
  const description = (pageLike.seoDescription || "").trim();
  const robotsDefault = defaultMetaRobots?.trim() || FALLBACK_ROBOTS;
  const robots = (pageLike.metaRobots || robotsDefault).trim();
  const googlebotDefault = defaultGooglebot?.trim() || robots;
  const imageUrl = (pageLike.ogImage || pageLike.socialImage || pageLike.heroImage || "").trim();
  const absImage = imageUrl ? (ensureAbsoluteUrl(imageUrl, siteUrl) || imageUrl) : undefined;
  const twitterImageUrl = (pageLike.twitterImage || "").trim();
  const absTwitterImage = twitterImageUrl ? (ensureAbsoluteUrl(twitterImageUrl, siteUrl) || twitterImageUrl) : absImage;

  const authorValue = (existingMeta.author as string) || authorOverride || "";

  const localeAlternateArray = ogLocaleAlternateStr?.trim()
    ? ogLocaleAlternateStr.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(pageLike.alternateLanguages) && pageLike.alternateLanguages.length > 0
      ? (pageLike.alternateLanguages as { hreflang?: string }[]).map((a) => (a.hreflang ?? "").trim()).filter(Boolean)
      : undefined;

  const hreflangDefault = defaultHreflang?.trim() || FALLBACK_HREFLANG;
  const pathnameDefault = defaultPathname?.trim() || FALLBACK_PATHNAME;
  const hreflang =
    Array.isArray(pageLike.alternateLanguages) && pageLike.alternateLanguages.length > 0
      ? buildHreflangFromAlternateLanguages(pageLike.alternateLanguages, pageLike.ogLocale, canonicalUrl, siteUrl, hreflangDefault)
      : buildHreflangFromOgLocaleAlternate(ogLocaleAlternateStr, pageLike.ogLocale, canonicalUrl, siteUrl, hreflangDefault, pathnameDefault);

  const ogImageAlt = (pageLike.socialImageAlt ?? pageLike.heroImageAlt ?? (existingMeta.ogImageAlt as string) ?? "").trim();
  const twitterImageAltValue = ((existingMeta.twitterImageAlt as string) ?? pageLike.twitterImageAlt ?? pageLike.socialImageAlt ?? pageLike.heroImageAlt ?? (existingMeta.ogImageAlt as string) ?? "").trim();

  const ogType = pageLike.ogType?.trim() || defaultOgType?.trim() || FALLBACK_OG_TYPE;
  const ogSiteName = pageLike.ogSiteName?.trim() || defaultSiteName?.trim() || FALLBACK_TITLE;
  const ogLocale = pageLike.ogLocale?.trim() || defaultOgLocale?.trim() || FALLBACK_OG_LOCALE;
  const ogDeterminer = (existingMeta.ogDeterminer as string)?.trim() || defaultOgDeterminer?.trim() || FALLBACK_OG_DETERMINER;
  const twitterCard = pageLike.twitterCard?.trim() || defaultTwitterCard?.trim() || FALLBACK_TWITTER_CARD;
  const sitemapPriority = pageLike.sitemapPriority ?? defaultSitemapPriority ?? FALLBACK_SITEMAP_PRIORITY;
  const sitemapChangeFreq = pageLike.sitemapChangeFreq?.trim() || defaultSitemapChangeFreq?.trim() || FALLBACK_SITEMAP_CHANGE_FREQ;

  const built: Record<string, unknown> = {
    charset: charsetValue,
    viewport: viewportValue,
    title: title.length > titleMax ? title.slice(0, titleMax - truncationSuffix.length) + truncationSuffix : title,
    description: description.length > descMax ? description.slice(0, descMax - truncationSuffix.length) + truncationSuffix : description,
    robots,
    googlebot: (existingMeta.googlebot as string)?.trim() || googlebotDefault,
    themeColor: themeColorOverride?.trim() || FALLBACK_THEME_COLOR,
    openGraph: {
      title: pageLike.ogTitle || title,
      description: pageLike.ogDescription || description,
      type: ogType,
      url: openGraphUrl,
      siteName: ogSiteName,
      locale: ogLocale,
      localeAlternate: localeAlternateArray ?? [],
      determiner: ogDeterminer,
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
    },
    twitter: {
      card: twitterCard,
      title: pageLike.twitterTitle || title,
      description: pageLike.twitterDescription || description,
      imageAlt: twitterImageAltValue || "",
      site: pageLike.twitterSite || twitterSiteOverride || "",
      creator: (pageLike.twitterCreator || twitterCreatorOverride) || (pageLike.twitterSite || twitterSiteOverride) || "",
      image: absTwitterImage ?? "",
      siteId: ((existingMeta.twitterSiteId as string) || twitterSiteIdOverride || "").trim(),
      creatorId: ((existingMeta.twitterCreatorId as string) || twitterCreatorIdOverride || "").trim(),
    },
    canonical: canonicalUrl,
    hreflang,
    sitemapPriority,
    sitemapChangeFreq,
    author: authorValue ?? "",
  };

  return { ...existingMeta, ...built };
}
