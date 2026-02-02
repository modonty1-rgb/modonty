import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export function generateArticleStructuredData(data: Record<string, unknown>): Record<string, unknown> {
  const getDateString = (dateValue: unknown): string | undefined => {
    if (!dateValue) return undefined;
    if (typeof dateValue === "string") return dateValue.split("T")[0];
    if (dateValue instanceof Date) return dateValue.toISOString().split("T")[0];
    return undefined;
  };

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: (data.title as string) || "",
    dateModified: getDateString(data.dateModified) || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: (data.authorName as string) || "",
      url: (data.authorUrl as string) || undefined,
    },
    publisher: {
      "@type": "Organization",
      name: (data.publisherName as string) || "",
      logo: data.publisherLogo
        ? {
            "@type": "ImageObject",
            url: data.publisherLogo as string,
          }
        : undefined,
    },
  };

  if (data.excerpt || data.description) {
    structuredData.description = (data.excerpt || data.description) as string;
  }
  const featuredImage = data.featuredImage as MediaRelation;
  if (featuredImage?.url) {
    structuredData.image = featuredImage.url as string;
  }
  if (data.datePublished) {
    structuredData.datePublished = getDateString(data.datePublished);
  }
  if (data.canonicalUrl) {
    structuredData.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": data.canonicalUrl as string,
    };
  }
  if (data.categoryName) {
    structuredData.articleSection = data.categoryName as string;
  }
  if (data.wordCount) {
    structuredData.wordCount = data.wordCount as number;
  }
  if (data.inLanguage) {
    structuredData.inLanguage = data.inLanguage as string;
  }

  return structuredData;
}

