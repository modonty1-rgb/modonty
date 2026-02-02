import { ArticleStatus, Prisma } from "@prisma/client";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentFormat?: string | null;
  status: ArticleStatus;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
  datePublished: Date | null;
  scheduledAt?: Date | null;
  lastReviewed?: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  mainEntityOfPage?: string | null;
  canonicalUrl?: string | null;
  metaRobots?: string | null;
  wordCount?: number | null;
  readingTimeMinutes?: number | null;
  contentDepth?: string | null;
  inLanguage?: string;
  license?: string | null;
  featuredImage?: {
    id: string;
    url: string;
    altText: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  client: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
  tags?: { tag: { id: string; name: string } }[];
  faqs?: { id: string; question: string; answer: string }[];
  gallery?: {
    id: string;
    media: {
      id: string;
      url: string;
      altText: string | null;
    } | null;
  }[];
  relatedTo?: {
    id: string;
    relationshipType?: string | null;
    related: {
      id: string;
      title: string;
      slug: string;
      category?: { id: string; name: string } | null;
      tags?: { tag: { id: string; name: string } }[];
    };
  }[];
  relatedFrom?: {
    id: string;
    relationshipType?: string | null;
    article: {
      id: string;
      title: string;
      slug: string;
      category?: { id: string; name: string } | null;
      tags?: { tag: { id: string; name: string } }[];
    };
  }[];
  jsonLdStructuredData?: string | null;
  jsonLdLastGenerated?: Date | null;
  jsonLdValidationReport?: Prisma.JsonValue | null;
  jsonLdVersion?: number;
  jsonLdHistory?: Prisma.JsonValue | null;
  jsonLdDiffSummary?: string | null;
  jsonLdGenerationTimeMs?: number | null;
  performanceBudgetMet?: boolean;
  articleBodyText?: string | null;
  semanticKeywords?: Prisma.JsonValue | null;
  citations?: string[];
  ogType?: string | null;
  ogArticlePublishedTime?: Date | null;
  ogArticleModifiedTime?: Date | null;
  twitterCard?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
  breadcrumbPath?: Prisma.JsonValue | null;
  versions?: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    createdAt: Date;
    createdBy?: string | null;
  }[];
}

export interface ContentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  listCount: number;
  readingTime: number;
  isArabic: boolean;
  countingMethod: "standard" | "arabic";
}

export interface ArticleClassification {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  range: string;
  minimum: string;
  recommended: string;
  bestPractices: string[];
}

export interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  condition: boolean;
}
