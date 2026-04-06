/**
 * Next.js Metadata Generator
 *
 * Generates Next.js Metadata objects for articles.
 * Used for pre-generating and caching metadata in the database.
 */

import type { Metadata } from "next";
import type { Article, Client, Author, Category, Media } from "@prisma/client";
import { SITE_NAME } from "@/lib/constants/site-name";

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
  scheduledAt?: Date | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  client: Client & {
    name: string;
    slug?: string | null;
    ogImageMedia?: { url: string } | null;
    logoMedia?: { url: string } | null;
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

export interface GenerateMetadataOptions {
  robots?: string;
  siteUrl?: string;
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
    return `${siteUrl}${fallbackPath}`;
  }

  if (url.startsWith(siteUrl)) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search + urlObj.hash;
    return `${siteUrl}${path}`;
  } catch {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${siteUrl}${cleanPath}`;
  }
}

/**
 * Generate Next.js Metadata object for an article
 */
export async function generateNextjsMetadata(
  article: ArticleWithMetadataRelations,
  options?: GenerateMetadataOptions
): Promise<Metadata> {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const siteName = article.client.name || SITE_NAME;

  // Effective values
  const effectiveTitle = article.seoTitle || article.title || "";
  const effectiveDescription = article.seoDescription || article.excerpt || "";

  const defaultCanonical = `${siteUrl}/articles/${article.slug}`;

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
  const fullTitle = `${effectiveTitle} - ${siteName}`;

  // Featured image
  const ogImage =
    article.featuredImage?.url ||
    article.client.ogImageMedia?.url ||
    article.client.logoMedia?.url ||
    `${siteUrl}/og-image.jpg`;

  // Open Graph metadata — OG title/description use article seoTitle/seoDescription (SOT)
  // datePublished is the single source of truth for published time
  const publishedTime = article.datePublished || article.scheduledAt;
  const modifiedTime = article.ogArticleModifiedTime || new Date();

  const ogTags: string[] = [];
  if (article.ogArticleTag && article.ogArticleTag.length > 0) {
    ogTags.push(...article.ogArticleTag);
  } else if (article.tags && article.tags.length > 0) {
    ogTags.push(...article.tags.map((t) => t.tag.name));
  }

  const openGraph = {
    title: effectiveTitle,
    description: effectiveDescription,
    url: effectiveCanonical,
    siteName: siteName,
    images: [
      {
        url: ogImage,
        width: article.featuredImage?.width || 1200,
        height: article.featuredImage?.height || 630,
        alt: article.featuredImage?.altText || effectiveTitle || siteName,
      },
    ],
    locale: article.ogLocale || article.inLanguage || "ar_SA",
    type: "article",
    ...(publishedTime && { publishedTime: new Date(publishedTime).toISOString() }),
    modifiedTime: new Date(modifiedTime).toISOString(),
    ...(article.ogArticleAuthor || article.author.name
      ? { authors: [article.ogArticleAuthor || article.author.name] }
      : {}),
    ...(article.ogArticleSection || article.category?.name
      ? { section: article.ogArticleSection || article.category?.name || "" }
      : {}),
    ...(ogTags.length > 0 ? { tags: ogTags } : {}),
  };

  // Twitter metadata — Twitter title/description use article seoTitle/seoDescription (SOT)
  const imageAlt = article.featuredImage?.altText || effectiveTitle || siteName;
  const twitter: Metadata["twitter"] = {
    card: (article.twitterCard as "summary_large_image") || "summary_large_image",
    title: effectiveTitle,
    description: effectiveDescription,
    images: [{ url: ogImage, alt: imageAlt }],
  };

  if (article.twitterSite) {
    twitter.site = article.twitterSite;
  }

  if (article.twitterCreator) {
    const creatorHandle = article.twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  } else if (article.author.name) {
    // Fallback to author name if no Twitter creator specified
    twitter.creator = article.author.name;
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
    description: effectiveDescription,
    alternates: {
      canonical: effectiveCanonical,
    },
    openGraph,
    twitter,
    robots,
  };

  return metadata;
}
