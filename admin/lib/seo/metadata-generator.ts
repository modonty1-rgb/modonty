/**
 * Next.js Metadata Generator
 *
 * Generates Next.js Metadata objects for articles.
 * Used for pre-generating and caching metadata in the database.
 */

import type { Metadata } from "next";
import type { Article, Client, Author, Category, Media } from "@prisma/client";
import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { SITE_NAME_FALLBACK } from "@/lib/constants/site-name";
import { loadSiteUrl } from "./site-url";
import { getOGLocale } from "./international-seo";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { BRAND_LOGO_URL } from "@modonty/shared/lib/brand-assets";

// Type for article with relations needed for metadata generation
export interface ArticleWithMetadataRelations {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  excerpt?: string | null;
  canonicalUrl?: string | null;
  inLanguage?: string | null;
  metaRobots?: string | null;
  ogType?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogUrl?: string | null;
  ogSiteName?: string | null;
  ogLocale?: string | null;
  ogArticleAuthor?: string | null;
  ogArticlePublishedTime?: Date | null;
  ogArticleModifiedTime?: Date | null;
  ogArticleSection?: string | null;
  ogArticleTag?: string[] | null;
  datePublished?: Date | null;
  /** Fallback for `article:modified_time` when no explicit OG value is stored. */
  dateModified?: Date | null;
  scheduledAt?: Date | null;
  /**
   * True when the page is served from the client's own domain. Then THEY are "the overall
   * site" og:site_name asks for, so the client's name stays; every other article is served
   * from modonty and takes the platform name.
   */
  isClientSiteArticle?: boolean | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  /**
   * Merged in from Settings.defaultAlternateLanguages by getArticleDefaultsFromSettings.
   * It always reached this generator — it was simply never written (live test 2026-07-14:
   * 0 of 56 published articles had hreflang stored, while the live page emitted it fine).
   */
  alternateLanguages?: Array<{ hreflang?: string; url?: string }> | null;
  client: Client & {
    name: string;
    slug?: string | null;
    heroImageMedia?: {
      url: string;
      bunnyUrl: string | null;
      blurDataURL: string | null;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    logoMedia?: {
      url: string;
      bunnyUrl: string | null;
      blurDataURL: string | null;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  };
  author: Author & {
    name: string;
  };
  category?: (Category & { name: string; slug?: string | null }) | null;
  featuredImage?: (Media & {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  }) | null;
  tags?: Array<{ tag: { name: string } }>;
}

/**
 * hreflang map — byte-for-byte the rule the live article page applies at request time
 * (modonty/app/articles/[slug]/page.tsx: buildLanguagesMap). Storing it here is what makes
 * the stored card equal the served page, which in turn makes the SEO score honest: the
 * scorer reads the STORED metadata, so a field the page adds at render but the generator
 * never wrote was being counted as missing on every single article.
 *
 * Single source of truth for the entries: Settings.defaultAlternateLanguages.
 * An entry without a `url` points at the article's own canonical (one Arabic page serving
 * every region), and x-default is always present.
 */
function buildLanguagesMap(
  alternateLanguages: Array<{ hreflang?: string; url?: string }> | null | undefined,
  canonicalUrl: string,
  siteUrl: string,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (Array.isArray(alternateLanguages)) {
    for (const entry of alternateLanguages) {
      const key = entry?.hreflang?.trim();
      if (!key) continue;
      const url = entry?.url?.trim();
      out[key] = url
        ? url.startsWith("http")
          ? url
          : absoluteUrl(url, siteUrl)
        : canonicalUrl;
    }
  }

  if (!out["x-default"]) out["x-default"] = canonicalUrl;
  return out;
}

export interface GenerateMetadataOptions {
  robots?: string;
  siteUrl?: string;
  /** `Settings.siteName` — the source of truth for og:site_name. See SITE_NAME_FALLBACK. */
  siteName?: string;
}

/**
 * Normalize URL to use the correct site URL
 */
function normalizeUrl(
  url: string | null | undefined,
  siteUrl: string,
  fallbackPath: string
): string {
  if (!url) {
    return absoluteUrl(fallbackPath, siteUrl);
  }

  if (url.startsWith(siteUrl)) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    return absoluteUrl(urlObj.pathname + urlObj.search + urlObj.hash, siteUrl);
  } catch {
    return absoluteUrl(url, siteUrl);
  }
}

/**
 * Generate Next.js Metadata object for an article
 */
export async function generateNextjsMetadata(
  article: ArticleWithMetadataRelations,
  options?: GenerateMetadataOptions
): Promise<Metadata> {
  const siteUrl = options?.siteUrl || (await loadSiteUrl());

  // The partner the article was written for. It brands the TITLE (seoTitle already ends
  // with " | {client}") — it is not the name of the site the page is served from.
  const clientName = article.client.name || SITE_NAME_FALLBACK;

  // og:site_name is "the name which should be displayed for the overall site" (ogp.me).
  // It used to be the client's name, so WhatsApp and X showed a modonty article as coming
  // from a site called «MBC clinic-عيادة دكتور ة رحاب منصور لعلاج الألم» (measured on
  // /articles/علاج-الديسك). Order matches the one already used for content pages in
  // shared/lib/seo/build-content-page-metadata.ts: the page's own override, then Settings.
  const siteName = article.isClientSiteArticle
    ? clientName
    : article.ogSiteName?.trim() || options?.siteName?.trim() || SITE_NAME_FALLBACK;

  // Effective values
  const effectiveTitle = article.seoTitle || article.title || "";
  // `undefined`, never `""`. An article with neither a meta description nor an excerpt used to
  // ship `<meta name="description" content="">` plus empty `og:` and `twitter:` descriptions.
  // An empty tag is not a missing tag: the missing one lets Google compose a snippet from the
  // page, the empty one hands it a blank answer. Next.js omits a metadata field that is
  // undefined, so absence stays absence all the way to the HTML.
  const effectiveDescription = article.seoDescription || article.excerpt || undefined;

  const defaultCanonical = entityUrl("articles", article.slug, siteUrl);

  let canonicalSource: string | null = article.canonicalUrl || null;

  let effectiveCanonical = defaultCanonical;

  if (canonicalSource) {
    const isAbsolute = /^https?:\/\//.test(canonicalSource);

    if (isAbsolute) {
      const sameDomain = canonicalSource.startsWith(siteUrl);
      const legacyClientScoped =
        sameDomain &&
        canonicalSource.includes("/clients/") &&
        canonicalSource.includes(`/articles/${article.slug}`);

      if (legacyClientScoped) {
        // Normalize old client-scoped URLs to the main articles route
        effectiveCanonical = defaultCanonical;
      } else {
        // External or custom absolute canonical – respect as-is
        effectiveCanonical = canonicalSource;
      }
    } else {
      // Relative path – normalize against siteUrl
      effectiveCanonical = normalizeUrl(
        canonicalSource,
        siteUrl,
        `/articles/${article.slug}`
      );
    }
  }
  // Avoid double-branding: seoTitle already ends with " | {client}" (generateSEOTitle),
  // so only append the site name when the title isn't already branded with it.
  const alreadyBranded = [` | ${clientName}`, ` - ${clientName}`].some((suffix) =>
    effectiveTitle.endsWith(suffix)
  );
  const fullTitle = alreadyBranded ? effectiveTitle : `${effectiveTitle} - ${clientName}`;

  // Featured image. Last link was `${siteUrl}/og-image.jpg` — a file that does not exist
  // (measured HTTP 404 on 2026-08-07), so an article with no image whose client had neither
  // hero nor logo shipped a dead og:image. The brand logo is a real asset on Bunny.
  const ogImageMedia =
    article.featuredImage || article.client.heroImageMedia || article.client.logoMedia;
  const ogImage = mediaSrc(ogImageMedia) || BRAND_LOGO_URL;

  // Open Graph metadata — OG title/description use article seoTitle/seoDescription (SOT)
  // datePublished is the single source of truth for published time.
  // `|| article.scheduledAt` used to sit here, and metadata is regenerated on every
  // create/update — not only on publish — so a SCHEDULED article shipped
  // `article:published_time` set to a date that has not happened yet. og:article's
  // published_time is "When the article was first published" (ogp.me, article namespace);
  // an unpublished article has no such moment, so the tag is simply omitted.
  const publishedTime = article.datePublished;
  // No `new Date()`. This read `article.ogArticleModifiedTime || new Date()`, so an article
  // with no stored modified time announced "modified right now" — on every regeneration, to
  // every crawler, for content nobody had touched. Google uses lastmod only "if it's
  // consistently and verifiably accurate"; a date that moves on its own is the opposite.
  //
  // The fallback is the article's own `dateModified` (which, since jsonld-storage.ts and
  // metadata-storage.ts stopped restamping it, moves only on a real content edit). With
  // neither, the tag is omitted — the rule this file already applies to
  // `article:published_time`, `og:locale` and `twitter:creator` three lines up.
  const modifiedTime = article.ogArticleModifiedTime || article.dateModified || null;

  const ogTags: string[] = [];
  if (article.ogArticleTag && article.ogArticleTag.length > 0) {
    ogTags.push(...article.ogArticleTag);
  } else if (article.tags && article.tags.length > 0) {
    ogTags.push(...article.tags.map((t) => t.tag.name));
  }

  // og:locale is "Of the format `language_TERRITORY`" (ogp.me, Optional Metadata) — never a
  // bare language code. `article.inLanguage` is `String @default("ar")`
  // (shared/prisma/schema/schema.prisma:2817), so falling straight back to it shipped
  // `og:locale="ar"`. getOGLocale maps a language onto its territory form (ar → ar_SA); the
  // map already existed in international-seo.ts and this path simply never called it.
  // The old third operand — a written "ar_SA" — is deleted, not moved: Settings.defaultOgLocale
  // already arrives in `article.ogLocale` here (metadata-storage.ts:111-112 →
  // get-article-defaults-from-settings.ts:27), so the literal only duplicated a DB value.
  // With no language at all the tag is omitted rather than invented — the rule this file
  // already applies to article:published_time and twitter:creator.
  const ogLocale =
    article.ogLocale?.trim() ||
    (article.inLanguage?.trim() ? getOGLocale(article.inLanguage.trim()) : "");

  const openGraph = {
    title: effectiveTitle,
    ...(effectiveDescription && { description: effectiveDescription }),
    url: effectiveCanonical,
    siteName: siteName,
    images: [
      {
        url: ogImage,
        ...(ogImageMedia?.width && ogImageMedia.height
          ? { width: ogImageMedia.width, height: ogImageMedia.height }
          : {}),
        alt: ogImageMedia?.altText || effectiveTitle || clientName,
      },
    ],
    ...(ogLocale ? { locale: ogLocale } : {}),
    type: "article",
    ...(publishedTime && { publishedTime: new Date(publishedTime).toISOString() }),
    ...(modifiedTime ? { modifiedTime: new Date(modifiedTime).toISOString() } : {}),
    ...(article.ogArticleAuthor || article.author.name
      ? { authors: [article.ogArticleAuthor || article.author.name] }
      : {}),
    ...(article.ogArticleSection || article.category?.name
      ? { section: article.ogArticleSection || article.category?.name || "" }
      : {}),
    ...(ogTags.length > 0 ? { tags: ogTags } : {}),
  };

  // Twitter metadata — Twitter title/description use article seoTitle/seoDescription (SOT)
  const imageAlt = article.featuredImage?.altText || effectiveTitle || clientName;
  const twitter: Metadata["twitter"] = {
    card: (article.twitterCard as "summary_large_image") || "summary_large_image",
    title: effectiveTitle,
    ...(effectiveDescription && { description: effectiveDescription }),
    images: [{ url: ogImage, alt: imageAlt }],
  };

  if (article.twitterSite) {
    twitter.site = article.twitterSite;
  }

  // `creator` is an account handle, never a display name — Next.js documents it as
  // `creator: '@nextjs'` (generate-metadata, Metadata Fields → twitter). The old fallback
  // wrote the author's name straight in, so every article with no handle shipped
  // `twitter:creator="Modonty"` (measured on /articles/علاج-الديسك). No tag beats a wrong
  // one, so when there is no handle the field is simply not emitted.
  if (article.twitterCreator) {
    const creatorHandle = article.twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  }

  // Robots configuration
  const robotsDirective = options?.robots || article.metaRobots || "index, follow";
  const shouldIndex = !robotsDirective.includes("noindex");
  const shouldFollow = !robotsDirective.includes("nofollow");

  const robots: Metadata["robots"] = {
    index: shouldIndex,
    follow: shouldFollow,
    googleBot: {
      index: shouldIndex,
      follow: shouldFollow,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };

  // Build final metadata object
  const metadata: Metadata = {
    title: fullTitle,
    ...(effectiveDescription && { description: effectiveDescription }),
    alternates: {
      canonical: effectiveCanonical,
      languages: buildLanguagesMap(article.alternateLanguages, effectiveCanonical, siteUrl),
    },
    openGraph,
    twitter,
    robots,
  };

  return metadata;
}
