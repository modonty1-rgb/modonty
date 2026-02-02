import { Metadata } from "next";

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  locale?: string;
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
}

export interface SEOOptions {
  robots?: "noindex,nofollow" | "index,follow";
}

export function generateMetadataFromSEO(data: SEOData, options?: SEOOptions): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = "website",
    siteName = "مودونتي",
    locale = "ar_SA",
    firstName,
    lastName,
    twitterCreator,
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    twitterSite,
  } = data;

  const fullTitle = title ? `${title} - ${siteName}` : siteName;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  let canonicalUrl: string;
  if (!url) {
    canonicalUrl = siteUrl;
  } else if (/^https?:\/\//.test(url)) {
    canonicalUrl = url;
  } else {
    canonicalUrl = `${siteUrl}${url}`;
  }
  const ogImage = image || `${siteUrl}/og-image.jpg`;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title: fullTitle,
    description: description || "",
    url: canonicalUrl,
    siteName: siteName,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title || siteName,
      },
    ],
    locale: locale,
    type: type,
  };

  if (type === "article") {
    const articleOpenGraph = openGraph as NonNullable<Metadata["openGraph"]> & {
      publishedTime?: string;
      modifiedTime?: string;
      authors?: string[];
      section?: string;
      tags?: string[];
    };

    if (publishedTime) {
      articleOpenGraph.publishedTime =
        typeof publishedTime === "string"
          ? new Date(publishedTime).toISOString()
          : publishedTime.toISOString();
    }
    if (modifiedTime) {
      articleOpenGraph.modifiedTime =
        typeof modifiedTime === "string"
          ? new Date(modifiedTime).toISOString()
          : modifiedTime.toISOString();
    }
    if (authors && authors.length > 0) {
      articleOpenGraph.authors = authors;
    }
    if (section) {
      articleOpenGraph.section = section;
    }
    if (tags && tags.length > 0) {
      articleOpenGraph.tags = tags;
    }
  }

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: fullTitle,
    description: description || "",
    images: [ogImage],
  };

  if (twitterCreator) {
    const creatorHandle = twitterCreator.replace(/^@/, "");
    twitter.creator = `@${creatorHandle}`;
  }

  if (twitterSite) {
    const siteHandle = twitterSite.replace(/^@/, "");
    twitter.site = `@${siteHandle}`;
  }

  const robotsConfig: Metadata["robots"] = options?.robots === "noindex,nofollow"
    ? {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };

  return {
    title: fullTitle,
    description: description || "منصة مدونات احترافية لإدارة المحتوى عبر عملاء متعددين",
    keywords: keywords || [],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter,
    robots: robotsConfig,
  };
}