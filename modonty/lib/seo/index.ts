import { Metadata } from "next";
import { BUNNY_ASPECT_SUFFIX, bunnyAspectUrl, hasBunnyAspectCrops } from "@modonty/shared/lib/bunny";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { normalizeSiteEntityIdsInJson } from "@modonty/shared/lib/seo/site-entity-ids";
import { SITE_URL } from "@/constants";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { FEED_ALTERNATE_TYPES } from "./feed-alternate-types";

export {
  withHonestOpenGraphImageDimensions,
  type KnownOpenGraphImageDimensions,
} from "./open-graph-image-dimensions";

/**
 * Serialize JSON-LD for safe inline injection inside <script type="application/ld+json">.
 * Escapes `<` → `<` so a string field containing `</script>` (or any markup) can't
 * break out of the tag (XSS / parser-breakout). Use this everywhere instead of bare JSON.stringify.
 */
export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Same `<` escaping for JSON-LD that is ALREADY serialized (the stored blobs the
 * admin generators write with bare JSON.stringify). Escaping `<` inside a JSON
 * string parses back to the identical value, so the graph is untouched — only the
 * markup-breakout risk dies. Apply at EVERY stored-blob injection point.
 */
export function jsonLdHtmlFromString(json: string): string {
  return normalizeStoredSiteEntityIds(json).replace(/</g, "\\u003c");
}

export function normalizeStoredSiteEntityIds(json: string): string {
  return normalizeSiteEntityIdsInJson(json, SITE_URL);
}

/** Localize known labels inside a stored BreadcrumbList without rewriting the database row. */
export function localizedStoredBreadcrumbJsonLd(
  json: string,
  names: Readonly<Record<string, string>>,
): string {
  let data: unknown;

  try {
    data = JSON.parse(normalizeStoredSiteEntityIds(json));
  } catch {
    return jsonLdHtmlFromString(json);
  }

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== "object") return;

    const node = value as Record<string, unknown>;
    if (node["@type"] === "BreadcrumbList" && Array.isArray(node.itemListElement)) {
      for (const element of node.itemListElement) {
        if (!element || typeof element !== "object") continue;
        const item = element as Record<string, unknown>;
        if (typeof item.name === "string" && names[item.name]) item.name = names[item.name];
      }
    }

    Object.values(node).forEach(visit);
  };

  visit(data);
  return jsonLdHtml(data as object);
}

/**
 * The share image, resolved to a crop the platform ACTUALLY stores.
 *
 * Admin pre-generates exactly three crops per image at upload — 1:1, 4:3 and 16:9, all
 * 1200 wide (`admin/…/media/actions/generate-aspect-crops.ts:16-20`). There is no
 * 1200×630 variant and never was on Bunny: the old `toOgImage1200x630` built a
 * Cloudinary `c_fill,w_1200,h_630` url, so after the migration it early-returned and
 * every page still declared `og:image:width 1200` / `height 630` over the untouched
 * ORIGINAL. Measured on production 2026-08-14 across four articles: the declared size
 * was 1200×630 while the served file was 1920×1080 — and two of the four were PNG
 * behind a `.webp` name, ~600KB where the 16:9 crop is ~60KB.
 *
 * So the share image is the 16:9 crop: it is the widest stored ratio (1.78 vs the
 * 1.90 the OG docs suggest — both well inside what every platform renders without a
 * visible crop), it exists for every uploaded image, and its dimensions are known
 * exactly, which is what makes the declared width/height true instead of aspirational.
 */
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 675;

export interface OgImageEntry {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Bunny stores the crops next to the base file, so the 16:9 url is derivable. Anything
 * NOT on Bunny (an external url, a brand asset set by hand) has no crop to point at —
 * it is returned untouched and WITHOUT dimensions, because asserting a size we did not
 * measure is the exact bug this replaces.
 */
export function toShareImage(url: string): OgImageEntry {
  // NOT `isBunnyUrl(zone, …)`: that resolves a zone config and THROWS when the BUNNY_* env is
  // absent — unacceptable inside metadata generation, which runs on every page. And the real
  // question is not the zone but whether crops were generated for this file at all.
  if (!hasBunnyAspectCrops(url)) return { url };
  if (/__(?:1x1|4x3|16x9)\.webp(?:\?|$)/.test(url)) {
    return { url, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
  }
  return {
    url: bunnyAspectUrl(url, BUNNY_ASPECT_SUFFIX["16:9"]),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  };
}

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  /** Alt text for OG and Twitter image (twitter:image:alt). Falls back to title. */
  imageAlt?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  locale?: string;
  /** Alternate locales for og:locale:alternate */
  localeAlternate?: string[];
  firstName?: string;
  lastName?: string;
  twitterCreator?: string;
  // Article-specific metadata (used when type === "article")
  publishedTime?: Date | string;
  modifiedTime?: Date | string;
  authors?: string[];
  section?: string;
  tags?: string[];
  // Twitter-specific extras
  twitterSite?: string;
  /** Hreflang: { "ar": url, "x-default": url } or extended. Defaults to ar + x-default if omitted. */
  languages?: Record<string, string>;
  /** Robots directive: "index,follow" (default) or "noindex,nofollow" etc. */
  robots?: string;
}

interface MetadataOptions {
  robots?: string;
}

export async function generateMetadataFromSEO(data: SEOData, options?: MetadataOptions): Promise<Metadata> {
  const {
    title,
    description,
    keywords,
    image,
    imageAlt,
    url,
    type = "website",
    // لا قيمة افتراضية للاسم ولا للسوق. كانت `siteName = BRAND_AR` و`locale = "ar_SA"`
    // تعيدان حقن قيمة الكود حتى بعد أن ينظّف المستدعي نفسه — فسلسلة الاحتياطات تُصلَح من
    // طرفها الأخير أوّلاً وإلا لم يتغيّر شيء. الغياب يبقى غياباً: الوسم لا يُبثّ.
    siteName,
    locale,
    firstName,
    lastName,
    twitterCreator,
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    twitterSite,
    localeAlternate,
    languages: languagesInput,
  } = data;

  // The brand is appended ONCE, by whoever owns that job:
  //   <title>      ← the root layout's template, `%s | مدونتي` (layout.tsx:34)
  //   og: / twitter ← the separate `og:site_name` field, which is what it is for
  //
  // This line used to append it here as well, so every page that did not opt out with
  // `title.absolute` shipped it twice — measured 25 Aug 2026: "بحث - مدونتي | مدونتي" ·
  // "مركز المساعدة - مدونتي | مدونتي" · "اشترك في النشرة - مدونتي | مدونتي".
  // Google (10 Dec 2025): "avoid repeated or boilerplate text · brand your titles concisely".
  const pageTitle = title || siteName;
  const siteUrl = SITE_URL;
  let canonicalUrl: string;
  if (!url) {
    canonicalUrl = siteUrl;
  } else if (/^https?:\/\//.test(url)) {
    canonicalUrl = url;
  } else {
    canonicalUrl = `${siteUrl}${url}`;
  }
  // OG/share image: page-specific image, else the admin-managed Settings.ogImageUrl
  // (single source of truth). If neither exists, og:image is OMITTED — no static fallback.
  // The admin is alerted to fill it via the EssentialSeoDialog in the admin app.
  const brandMedia = await getBrandMedia();
  const ogImageRaw = image || brandMedia.ogImageUrl || undefined;
  const imageAltResolved = imageAlt || title || brandMedia.altImage || siteName;
  // Point at the stored 16:9 crop and declare ITS size — see `toShareImage`.
  const ogImages = ogImageRaw
    ? [{ ...toShareImage(ogImageRaw), alt: imageAltResolved }]
    : undefined;

  const robotsDirective = data.robots || options?.robots || "index,follow";
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const openGraph: Metadata["openGraph"] = {
    title: pageTitle,
    description: description || "",
    url: canonicalUrl,
    ...(siteName && { siteName }),
    images: ogImages,
    ...(locale && { locale }),
    ...(localeAlternate && localeAlternate.length > 0 && { localeAlternate }),
    type: type,
  };

  if (type === "article" && openGraph) {
    const ogArticle = openGraph as any;
    if (publishedTime) {
      ogArticle.publishedTime =
        typeof publishedTime === "string"
          ? new Date(publishedTime).toISOString()
          : publishedTime.toISOString();
    }
    if (modifiedTime) {
      ogArticle.modifiedTime =
        typeof modifiedTime === "string"
          ? new Date(modifiedTime).toISOString()
          : modifiedTime.toISOString();
    }
    if (authors && authors.length > 0) {
      ogArticle.authors = authors;
    }
    if (section) {
      ogArticle.section = section;
    }
    if (tags && tags.length > 0) {
      ogArticle.tags = tags;
    }
  }

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: pageTitle,
    description: description || "",
    images: ogImages ? [{ url: ogImages[0].url, alt: imageAltResolved }] : undefined,
  };

  if (twitterCreator) {
    const creatorHandle = twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  }

  if (twitterSite) {
    const siteHandle = twitterSite.replace(/^@/, "");
    twitter.site = `@${siteHandle}`;
  }

  // Read from Settings, not written here. This default used to be four locales typed into
  // the file, and it was one of three independent places that decided hreflang without ever
  // asking the database — while `Settings.defaultAlternateLanguages` held nine and not one of
  // them reached a page (production inventory, card 105).
  //
  // Next.js REPLACES the layout's `alternates` rather than merging them, so an empty default
  // here is not "inherit" — it is "none". The list therefore comes from the same Settings
  // column every other page reads.
  const languages =
    languagesInput && Object.keys(languagesInput).length > 0
      ? languagesInput
      : buildHreflangLanguages(
          (await getPageSeoDefaults()).alternateLanguages,
          canonicalUrl,
          SITE_URL,
        );

  return {
    title: pageTitle,
    // وصفٌ مكتوب في الكود يصل جوجل باسم الصفحة وهو لا يصفها. صفحةٌ بلا وصف في القاعدة
    // تشحن بلا وسم وصف — وجوجل تبني المقتطف من متنها، وهو أصدق من جملة عامّة تتكرّر.
    ...(description && { description }),
    keywords: keywords || [],
    alternates: {
      canonical: canonicalUrl,
      languages,
      types: FEED_ALTERNATE_TYPES,
    },
    openGraph,
    twitter,
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStructuredData(data: {
  type: "Category" | "Client" | "Person" | "Article" | "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description?: string;
  url?: string;
  image?: string;
  [key: string]: unknown;
}): object {
  const { type, name, description, url, image, ...additionalData } = data;
  const siteUrl = SITE_URL;

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    name: name,
    ...(description && { description }),
    ...(url && { url: `${siteUrl}${url}` }),
    ...(image && { image }),
    ...additionalData,
  };

  return baseSchema;
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  const siteUrl = SITE_URL;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // Use URL constructor to safely percent-encode non-ASCII path segments
      item: new URL(item.url, siteUrl).href,
    })),
  };
}

