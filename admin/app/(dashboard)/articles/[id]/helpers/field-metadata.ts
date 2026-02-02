export interface FieldMetadata {
  path: string;
  type: string;
}

const fieldMetadataMap: Record<string, FieldMetadata> = {
  // Basic content
  title: { path: "article.title", type: "String" },
  slug: { path: "article.slug", type: "String" },
  excerpt: { path: "article.excerpt", type: "String?" },
  content: { path: "article.content", type: "String" },
  contentFormat: { path: "article.contentFormat", type: "String" },

  // Relationships
  clientId: { path: "article.clientId", type: "String @db.ObjectId" },
  client: { path: "article.client", type: "Client" },
  categoryId: { path: "article.categoryId", type: "String? @db.ObjectId" },
  category: { path: "article.category", type: "Category?" },
  authorId: { path: "article.authorId", type: "String @db.ObjectId" },
  author: { path: "article.author", type: "Author" },

  // Status & workflow
  status: { path: "article.status", type: "ArticleStatus" },
  scheduledAt: { path: "article.scheduledAt", type: "DateTime?" },
  featured: { path: "article.featured", type: "Boolean" },

  // Schema.org Article - Required fields
  datePublished: { path: "article.datePublished", type: "DateTime?" },
  dateModified: { path: "article.dateModified", type: "DateTime @updatedAt" },
  lastReviewed: { path: "article.lastReviewed", type: "DateTime?" },
  mainEntityOfPage: { path: "article.mainEntityOfPage", type: "String?" },

  // Schema.org Article - Extended fields
  wordCount: { path: "article.wordCount", type: "Int?" },
  readingTimeMinutes: { path: "article.readingTimeMinutes", type: "Int?" },
  contentDepth: { path: "article.contentDepth", type: "String?" },
  inLanguage: { path: "article.inLanguage", type: "String" },
  isAccessibleForFree: { path: "article.isAccessibleForFree", type: "Boolean" },
  license: { path: "article.license", type: "String?" },

  // Meta tags
  seoTitle: { path: "article.seoTitle", type: "String?" },
  seoDescription: { path: "article.seoDescription", type: "String?" },
  metaRobots: { path: "article.metaRobots", type: "String?" },

  // Open Graph
  ogType: { path: "article.ogType", type: "String?" },
  ogArticleAuthor: { path: "article.ogArticleAuthor", type: "String?" },
  ogArticlePublishedTime: { path: "article.ogArticlePublishedTime", type: "DateTime?" },
  ogArticleModifiedTime: { path: "article.ogArticleModifiedTime", type: "DateTime?" },

  // Twitter Cards
  twitterCard: { path: "article.twitterCard", type: "String?" },
  twitterSite: { path: "article.twitterSite", type: "String?" },
  twitterCreator: { path: "article.twitterCreator", type: "String?" },

  // Technical SEO
  canonicalUrl: { path: "article.canonicalUrl", type: "String?" },
  sitemapPriority: { path: "article.sitemapPriority", type: "Float?" },
  sitemapChangeFreq: { path: "article.sitemapChangeFreq", type: "String?" },
  breadcrumbPath: { path: "article.breadcrumbPath", type: "Json?" },

  // Featured media
  featuredImageId: { path: "article.featuredImageId", type: "String? @db.ObjectId" },
  featuredImage: { path: "article.featuredImage", type: "Media?" },

  // JSON-LD
  jsonLdStructuredData: { path: "article.jsonLdStructuredData", type: "String?" },
  jsonLdLastGenerated: { path: "article.jsonLdLastGenerated", type: "DateTime?" },
  jsonLdValidationReport: { path: "article.jsonLdValidationReport", type: "Json?" },

  // Timestamps
  createdAt: { path: "article.createdAt", type: "DateTime" },
  updatedAt: { path: "article.updatedAt", type: "DateTime @updatedAt" },

  // Relationships arrays
  tags: { path: "article.tags", type: "ArticleTag[]" },
  versions: { path: "article.versions", type: "ArticleVersion[]" },
  faqs: { path: "article.faqs", type: "ArticleFAQ[]" },
  gallery: { path: "article.gallery", type: "ArticleMedia[]" },
  relatedTo: { path: "article.relatedTo", type: "RelatedArticle[]" },
  relatedFrom: { path: "article.relatedFrom", type: "RelatedArticle[]" },
};

export function getFieldMetadata(fieldKey: string): FieldMetadata {
  return (
    fieldMetadataMap[fieldKey] || {
      path: `article.${fieldKey}`,
      type: "unknown",
    }
  );
}
