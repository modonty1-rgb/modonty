/**
 * Knowledge Graph Generator - Phase 2
 *
 * Generates a unified JSON-LD @graph with linked entities:
 * - WebPage (container)
 * - Article (main content)
 * - Person (author)
 * - Organization (publisher/client)
 * - ImageObject (hero + gallery)
 * - BreadcrumbList
 * - FAQPage (if FAQs exist)
 *
 * All entities use stable @id for cross-referencing.
 */

import {
  Article,
  Client,
  Author,
  Category,
  ArticleFAQ,
  Media,
  ArticleMedia,
  Tag,
} from "@prisma/client";

// Type for article with all relations needed for JSON-LD
export interface ArticleWithFullRelations extends Article {
  client: Client & {
    logoMedia?: Media | null;
  };
  author: Author;
  category?: Category | null;
  tags?: Array<{ tag: Tag }>;
  featuredImage?: Media | null;
  gallery?: Array<ArticleMedia & { media: Media }>;
  faqs?: ArticleFAQ[];
}

// JSON-LD Graph structure
export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

// Generic node in the graph
export interface JsonLdNode {
  "@type": string;
  "@id"?: string;
  [key: string]: unknown;
}

/**
 * Normalize URL to use the correct site URL from environment
 * Replaces localhost or any incorrect domain with NEXT_PUBLIC_SITE_URL
 */
function normalizeUrl(url: string | null | undefined, siteUrl: string, fallbackPath: string): string {
  if (!url) {
    return `${siteUrl}${fallbackPath}`;
  }

  // If URL already starts with the correct site URL, return as-is
  if (url.startsWith(siteUrl)) {
    return url;
  }

  // If URL contains localhost or any other domain, extract the path and rebuild
  try {
    const urlObj = new URL(url);
    // Extract pathname + search + hash
    const path = urlObj.pathname + urlObj.search + urlObj.hash;
    return `${siteUrl}${path}`;
  } catch {
    // If URL parsing fails, treat it as a relative path
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${siteUrl}${cleanPath}`;
  }
}

/**
 * Generate complete Knowledge Graph for an article
 */
export function generateArticleKnowledgeGraph(
  article: ArticleWithFullRelations
): JsonLdGraph {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  
  // Single source: canonical URL = mainEntityOfPage = Article url (Schema.org + Google best practice)
  const raw = article.canonicalUrl || article.mainEntityOfPage;
  const articleUrl = raw
    ? normalizeUrl(raw, siteUrl, `/articles/${article.slug}`)
    : `${siteUrl}/articles/${article.slug}`;

  // Stable entity IDs (used for cross-referencing)
  const ids = {
    webPage: articleUrl,
    article: `${articleUrl}#article`,
    author: `${siteUrl}/authors/${article.author.slug}#person`,
    publisher: `${siteUrl}/clients/${article.client.slug}#organization`,
    breadcrumb: `${articleUrl}#breadcrumb`,
    faq: `${articleUrl}#faq`,
    primaryImage: `${articleUrl}#primary-image`,
  };

  const graph: JsonLdNode[] = [];

  // 1. WebPage (container for the article)
  graph.push(generateWebPageNode(article, articleUrl, ids, siteUrl));

  // 2. Article (main content)
  graph.push(generateArticleNode(article, articleUrl, ids, siteUrl));

  // 3. Organization (Publisher/Client)
  graph.push(generateOrganizationNode(article.client, ids.publisher, siteUrl));

  // 4. Person (Author)
  graph.push(generatePersonNode(article.author, ids.author, siteUrl));

  // 5. BreadcrumbList
  graph.push(generateBreadcrumbNode(article, articleUrl, ids.breadcrumb, siteUrl));

  // 6. FAQPage (only if FAQs exist)
  if (article.faqs && article.faqs.length > 0) {
    graph.push(generateFAQNode(article.faqs, ids.faq));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Generate WebPage node
 */
function generateWebPageNode(
  article: ArticleWithFullRelations,
  articleUrl: string,
  ids: Record<string, string>,
  siteUrl: string
): JsonLdNode {
  return {
    "@type": "WebPage",
    "@id": ids.webPage,
    url: articleUrl,
    name: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    mainEntity: { "@id": ids.article },
    inLanguage: "ar",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "مودونتي",
      url: siteUrl,
    },
    breadcrumb: { "@id": ids.breadcrumb },
    ...(article.datePublished && {
      datePublished: article.datePublished.toISOString(),
    }),
    dateModified: article.dateModified.toISOString(),
  };
}

/**
 * Generate Article node
 */
function generateArticleNode(
  article: ArticleWithFullRelations,
  articleUrl: string,
  ids: Record<string, string>,
  siteUrl: string
): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "Article",
    "@id": ids.article,
    url: articleUrl,
    headline: article.title,
    description: article.seoDescription || article.excerpt || undefined,
    author: { "@id": ids.author },
    publisher: { "@id": ids.publisher },
    mainEntityOfPage: { "@id": ids.webPage },
    inLanguage: "ar",
    isAccessibleForFree: true,
    ...(article.datePublished && {
      datePublished: article.datePublished.toISOString(),
    }),
    dateModified: article.dateModified.toISOString(),
    ...(article.lastReviewed && {
      lastReviewed: article.lastReviewed.toISOString(),
    }),
  };

  // Add articleBody (plain text for AI crawlers)
  if (article.articleBodyText) {
    node.articleBody = article.articleBodyText;
  }

  // Add word count
  if (article.wordCount) {
    node.wordCount = article.wordCount;
  }

  // Add category as articleSection
  if (article.category) {
    node.articleSection = article.category.name;
    node.about = {
      "@type": "Thing",
      "@id": `${siteUrl}/categories/${article.category.slug}`,
      name: article.category.name,
    };
  }

  // Add tags as keywords
  if (article.tags && article.tags.length > 0) {
    node.keywords = article.tags.map((t) => t.tag.name).join(", ");
  }

  // Add citations (E-E-A-T)
  if (article.citations && article.citations.length > 0) {
    node.citation = article.citations;
  }

  // Add images (hero + gallery)
  const images = buildImageArray(article, articleUrl);
  if (images.length > 0) {
    node.image = images.length === 1 ? images[0] : images;
  }

  // Add mentions (semanticKeywords → schema.org mentions)
  const mentions = buildMentionsFromSemanticKeywords(article, articleUrl);
  if (mentions && mentions.length > 0) {
    node.mentions = mentions;
  }

  return node;
}

type SemanticKeywordItem = { name: string; wikidataId?: string; url?: string };

function buildMentionsFromSemanticKeywords(
  article: ArticleWithFullRelations,
  articleUrl: string
): JsonLdNode[] | undefined {
  const raw = article.semanticKeywords;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const items = raw.filter(
    (x): x is SemanticKeywordItem =>
      x != null && typeof (x as SemanticKeywordItem).name === "string"
  );
  if (items.length === 0) return undefined;
  return items.map((item, i) => {
    const thing: JsonLdNode = {
      "@type": "Thing",
      "@id": `${articleUrl}#mention-${i}`,
      name: item.name,
    };
    const url = item.url?.trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      thing.sameAs = [url];
    } else if (item.wikidataId?.trim()) {
      thing.sameAs = [
        `https://www.wikidata.org/entity/${item.wikidataId.trim()}`,
      ];
    }
    return thing;
  });
}

/**
 * Build image array for Article
 */
function buildImageArray(
  article: ArticleWithFullRelations,
  articleUrl: string
): JsonLdNode[] {
  const images: JsonLdNode[] = [];

  // Hero image (featuredImage)
  if (article.featuredImage) {
    images.push({
      "@type": "ImageObject",
      "@id": `${articleUrl}#primary-image`,
      url: article.featuredImage.url,
      contentUrl: article.featuredImage.url,
      ...(article.featuredImage.width && { width: article.featuredImage.width }),
      ...(article.featuredImage.height && { height: article.featuredImage.height }),
      ...(article.featuredImage.caption && { caption: article.featuredImage.caption }),
      ...(article.featuredImage.altText && { name: article.featuredImage.altText }),
      ...(article.featuredImage.license && { license: article.featuredImage.license }),
      ...(article.featuredImage.creator && {
        creator: {
          "@type": "Person",
          name: article.featuredImage.creator,
        },
      }),
      representativeOfPage: true,
    });
  }

  // Gallery images
  if (article.gallery && article.gallery.length > 0) {
    article.gallery
      .sort((a, b) => a.position - b.position)
      .forEach((item, index) => {
        images.push({
          "@type": "ImageObject",
          "@id": `${articleUrl}#image-${index + 2}`,
          url: item.media.url,
          contentUrl: item.media.url,
          ...(item.media.width && { width: item.media.width }),
          ...(item.media.height && { height: item.media.height }),
          // Use article-specific caption/altText if available, otherwise fall back to media
          caption: item.caption || item.media.caption || undefined,
          name: item.altText || item.media.altText || undefined,
          ...(item.media.license && { license: item.media.license }),
        });
      });
  }

  return images;
}

/**
 * Generate Organization node (Publisher)
 */
function generateOrganizationNode(
  client: Client & {
    logoMedia?: Media | null;
    parentOrganization?: { name: string; id?: string; url?: string } | null;
  },
  id: string,
  siteUrl: string
): JsonLdNode {
  const node: JsonLdNode = {
    "@type": (client.organizationType as string) || "Organization",
    "@id": id,
    name: client.name,
    ...(client.legalName && { legalName: client.legalName }),
    ...(client.alternateName && { alternateName: client.alternateName }),
    ...(client.url && { url: client.url }),
    ...(client.description && { description: client.description }),
    ...(client.slogan && { slogan: client.slogan }),
    ...(Array.isArray(client.keywords) && client.keywords.length > 0 && { keywords: client.keywords }),
    ...(Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0 && { knowsLanguage: client.knowsLanguage }),
  };

  // Logo (required for Article rich results)
  if (client.logoMedia) {
    node.logo = {
      "@type": "ImageObject",
      url: client.logoMedia.url,
      ...(client.logoMedia.width && { width: client.logoMedia.width }),
      ...(client.logoMedia.height && { height: client.logoMedia.height }),
    };
  }

  // Saudi Arabia & Gulf Identifiers
  const identifiers: Array<Record<string, unknown>> = [];
  if (client.commercialRegistrationNumber) {
    identifiers.push({
      "@type": "PropertyValue",
      name: "Commercial Registration Number",
      value: client.commercialRegistrationNumber,
    });
  }
  if (identifiers.length > 0) {
    node.identifier = identifiers;
  }
  if (client.vatID) {
    node.vatID = client.vatID;
  }
  if (client.taxID) {
    node.taxID = client.taxID;
  }

  // Contact point (array support)
  const contactPoints: Array<Record<string, unknown>> = [];
  if (client.email || client.phone) {
    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
    };
    if (client.contactType) {
      contactPoint.contactType = client.contactType;
    } else if (client.email && client.phone) {
      contactPoint.contactType = "customer service";
    }
    if (client.email) {
      contactPoint.email = client.email;
    }
    if (client.phone) {
      contactPoint.telephone = client.phone;
    }
    contactPoint.areaServed = client.addressCountry || "SA";
    contactPoint.availableLanguage = Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage
      : ["Arabic", "English"];
    contactPoints.push(contactPoint);
  }
  if (contactPoints.length > 0) {
    node.contactPoint = contactPoints.length === 1 ? contactPoints[0] : contactPoints;
  }

  // Enhanced Address (National Address Format)
  if (
    client.addressStreet ||
    client.addressCity ||
    client.addressCountry ||
    client.addressRegion ||
    client.addressNeighborhood ||
    client.addressBuildingNumber
  ) {
    node.address = {
      "@type": "PostalAddress",
      ...(client.addressStreet && { streetAddress: client.addressStreet }),
      ...(client.addressNeighborhood && { addressNeighborhood: client.addressNeighborhood }),
      ...(client.addressCity && { addressLocality: client.addressCity }),
      ...(client.addressRegion && { addressRegion: client.addressRegion }),
      ...(client.addressCountry && { addressCountry: client.addressCountry }),
      ...(client.addressPostalCode && { postalCode: client.addressPostalCode }),
    };
  }

  // Classification
  if (client.isicV4) {
    node.isicV4 = client.isicV4;
  }

  // Number of employees as QuantitativeValue
  if (client.numberOfEmployees) {
    const empValue = client.numberOfEmployees;
    if (empValue.includes("-")) {
      const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        node.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = parseInt(empValue);
      if (!isNaN(numValue)) {
        node.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: numValue,
        };
      } else {
        node.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: empValue,
        };
      }
    }
  }

  // Parent organization relationship
  if (client.parentOrganization) {
    node.parentOrganization = {
      "@type": "Organization",
      name: client.parentOrganization.name,
      ...(client.parentOrganization.id && { "@id": client.parentOrganization.id }),
      ...(client.parentOrganization.url && { url: client.parentOrganization.url }),
    };
  }

  // Social profiles (sameAs)
  if (client.sameAs && client.sameAs.length > 0) {
    node.sameAs = client.sameAs;
  }

  // Founding date
  if (client.foundingDate) {
    node.foundingDate = client.foundingDate.toISOString().split("T")[0];
  }

  return node;
}

/**
 * Generate Person node (Author)
 */
function generatePersonNode(
  author: Author,
  id: string,
  siteUrl: string
): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "Person",
    "@id": id,
    name: author.name,
    ...(author.bio && { description: author.bio }),
    ...(author.image && { image: author.image }),
    ...(author.url && { url: author.url }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
  };

  // Expertise areas (E-E-A-T)
  if (author.expertiseAreas && author.expertiseAreas.length > 0) {
    node.knowsAbout = author.expertiseAreas;
  }

  // Credentials (E-E-A-T)
  if (author.credentials && author.credentials.length > 0) {
    node.hasCredential = author.credentials;
  }

  // Professional memberships
  if (author.memberOf && author.memberOf.length > 0) {
    node.memberOf = author.memberOf.map((org) => ({
      "@type": "Organization",
      name: org,
    }));
  }

  // Social profiles (sameAs)
  const sameAs: string[] = [];
  if (author.linkedIn) sameAs.push(author.linkedIn);
  if (author.twitter) sameAs.push(author.twitter);
  if (author.facebook) sameAs.push(author.facebook);
  if (author.sameAs && author.sameAs.length > 0) {
    sameAs.push(...author.sameAs);
  }
  if (sameAs.length > 0) {
    node.sameAs = sameAs;
  }

  return node;
}

/**
 * Generate BreadcrumbList node
 */
function generateBreadcrumbNode(
  article: ArticleWithFullRelations,
  articleUrl: string,
  id: string,
  siteUrl: string
): JsonLdNode {
  const items: Array<{ "@type": string; position: number; name: string; item: string }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: siteUrl,
    },
  ];

  // Add category if exists
  if (article.category) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: article.category.name,
      item: `${siteUrl}/categories/${article.category.slug}`,
    });
  }

  // Add article
  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: article.title,
    item: articleUrl,
  });

  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items,
  };
}

/**
 * Generate FAQPage node
 */
function generateFAQNode(faqs: ArticleFAQ[], id: string): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs
      .sort((a, b) => a.position - b.position)
      .map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
  };
}

/**
 * Convert Knowledge Graph to minified JSON string (for production)
 */
export function stringifyKnowledgeGraph(graph: JsonLdGraph): string {
  return JSON.stringify(graph);
}

/**
 * Convert Knowledge Graph to formatted JSON string (for preview)
 */
export function stringifyKnowledgeGraphPretty(graph: JsonLdGraph): string {
  return JSON.stringify(graph, null, 2);
}
