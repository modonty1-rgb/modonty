import { SEODoctorConfig } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEODescription,
  createValidateTwitterTitle,
  createValidateTwitterDescription,
  validateCanonicalUrl,
  validateTwitterImageAlt,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { validateArticleTitle } from "./validate-article-title";
import { validateArticleContent } from "./validate-article-content";
import { validateFeaturedImage } from "./validate-featured-image";
import { validateOGImageAltForArticle } from "./validate-og-image-alt-for-article";
import { validateOGImageDimensionsForArticle } from "./validate-og-image-dimensions-for-article";
import { validateArticleDatePublished } from "./validate-article-date-published";
import { validateLastReviewed } from "./validate-last-reviewed";
import { validateArticleCategory } from "./validate-article-category";
import { validateArticleTwitterCards } from "./validate-article-twitter-cards";
import { createValidateArticleSEOTitleAndOG } from "./create-validate-article-seo-title-and-og";
import { generateArticleStructuredData } from "./generate-article-structured-data";

export const createArticleSEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Article",
  maxScore: 200,
  generateStructuredData: generateArticleStructuredData,
  fields: [
    { name: "title", label: "Article Title", validator: validateArticleTitle },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "content", label: "Content (Word Count)", validator: validateArticleContent },
    { name: "seoTitle", label: "SEO Title & Open Graph", validator: createValidateArticleSEOTitleAndOG(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "featuredImageId", label: "Featured Image", validator: validateFeaturedImage },
    { name: "ogImageAlt", label: "OG Image Alt Text", validator: validateOGImageAltForArticle },
    { name: "ogImageWidth", label: "OG Image Dimensions", validator: validateOGImageDimensionsForArticle },
    { name: "datePublished", label: "Date Published", validator: validateArticleDatePublished },
    { name: "lastReviewed", label: "Last Reviewed", validator: validateLastReviewed },
    { name: "categoryId", label: "Category", validator: validateArticleCategory },
    { name: "twitterCard", label: "Twitter Cards", validator: validateArticleTwitterCards },
    { name: "twitterTitle", label: "Twitter Title", validator: createValidateTwitterTitle(settings) },
    { name: "twitterDescription", label: "Twitter Description", validator: createValidateTwitterDescription(settings) },
    { name: "twitterImageAlt", label: "Twitter Image Alt Text", validator: validateTwitterImageAlt },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
  ],
});

