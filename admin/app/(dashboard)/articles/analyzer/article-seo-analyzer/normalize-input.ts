import { ArticleSEOInput } from "../article-seo-types";
import { calculateWordCountImproved } from "../../helpers/seo-helpers";
import { ArticleFormData } from "@/lib/types/form-types";
import { Article } from "../../[id]/helpers/article-view-types";

export type NormalizedInput = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
  excerpt: string;
  metaRobots: string;
  wordCount: number;
  contentDepth: string | null;
  featuredImageId: string | null;
  featuredImageAlt: string | null;
  jsonLdStructuredData: string | null;
  authorId: string | null;
  datePublished: Date | null;
  canonicalUrl: string | null;
  sitemapPriority: number | null;
  sitemapChangeFreq: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  twitterCard: string | null;
  faqCount: number;
  inLanguage: string;
};

export function normalizeInput(input: ArticleSEOInput): NormalizedInput {
  const isFormData = (input: ArticleSEOInput): input is ArticleFormData => {
    return "clientId" in input;
  };

  if (isFormData(input)) {
    const formData = input as ArticleFormData;
    const content = formData.content || "";
    const wordCount = calculateWordCountImproved(content, formData.inLanguage || "ar");

    return {
      title: formData.title || "",
      seoTitle: formData.seoTitle || formData.title || "",
      seoDescription: formData.seoDescription || formData.excerpt || "",
      content,
      excerpt: formData.excerpt || "",
      metaRobots: formData.metaRobots || "index, follow",
      wordCount,
      contentDepth: formData.contentDepth || null,
      featuredImageId: formData.featuredImageId || null,
      featuredImageAlt: formData.featuredImageAlt ?? null,
      jsonLdStructuredData: formData.jsonLdStructuredData || null,
      authorId: formData.authorId || null,
      datePublished: formData.datePublished || null,
      canonicalUrl: formData.canonicalUrl || null,
      sitemapPriority: formData.sitemapPriority || null,
      sitemapChangeFreq: formData.sitemapChangeFreq || null,
      ogTitle: formData.seoTitle || formData.title || null,
      ogDescription: formData.seoDescription || formData.excerpt || null,
      twitterCard: formData.twitterCard || null,
      faqCount: formData.faqs?.length || 0,
      inLanguage: formData.inLanguage || "ar",
    };
  } else {
    const article = input as Article;
    const content = article.content || "";
    const wordCount =
      article.wordCount ||
      calculateWordCountImproved(content, article.inLanguage || "ar");

    return {
      title: article.title || "",
      seoTitle: article.seoTitle || article.title || "",
      seoDescription: article.seoDescription || article.excerpt || "",
      content,
      excerpt: article.excerpt || "",
      metaRobots: article.metaRobots || "index, follow",
      wordCount,
      contentDepth: article.contentDepth || null,
      featuredImageId: article.featuredImage?.id || null,
      featuredImageAlt: article.featuredImage?.altText || null,
      jsonLdStructuredData: article.jsonLdStructuredData || null,
      authorId: article.author?.id || null,
      datePublished: article.datePublished || null,
      canonicalUrl: article.canonicalUrl || null,
      sitemapPriority: article.sitemapPriority || null,
      sitemapChangeFreq: article.sitemapChangeFreq || null,
      ogTitle: article.seoTitle || article.title || null,
      ogDescription: article.seoDescription || article.excerpt || null,
      twitterCard: article.twitterCard || null,
      faqCount: article.faqs?.length || 0,
      inLanguage: article.inLanguage || "ar",
    };
  }
}
