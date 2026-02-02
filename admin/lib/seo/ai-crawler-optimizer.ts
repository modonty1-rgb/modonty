/**
 * AI Crawler Optimizer - Phase 9
 *
 * Optimizes content for AI-powered search engines:
 * - Google SGE (Search Generative Experience)
 * - Perplexity AI
 * - SearchGPT (OpenAI)
 * - Bing Chat
 *
 * Key optimizations:
 * - Plain text articleBody for AI comprehension
 * - Semantic keywords with entity disambiguation
 * - Structured citations and sources
 * - Key facts extraction for featured snippets
 */

import { Article, Author, Category, Tag } from "@prisma/client";

export interface AIOptimizedMetadata {
  // Plain text content (no HTML)
  articleBody: string;

  // Key facts for AI extraction (bullet points)
  keyFacts: string[];

  // Semantic keywords with optional Wikidata IDs
  semanticKeywords: SemanticKeyword[];

  // Authoritative citations
  citations: string[];

  // Significant internal/external links
  significantLinks: SignificantLink[];

  // Content summary for AI
  tldr: string;

  // Reading level (Flesch-Kincaid)
  readingLevel: string;

  // Topic clusters for semantic relevance
  topicClusters: string[];
}

export interface SemanticKeyword {
  name: string;
  wikidataId?: string;
  wikipediaUrl?: string;
  type?: "Person" | "Organization" | "Place" | "Event" | "Concept" | "Product";
}

export interface SignificantLink {
  url: string;
  text: string;
  type: "internal" | "external" | "citation";
  relevance: "high" | "medium" | "low";
}

/**
 * Extract plain text from HTML content
 */
export function extractPlainTextForAI(htmlContent: string): string {
  // Remove script and style tags with content
  let text = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML tags but preserve structure
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li>/gi, "• ");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");

  // Clean up whitespace
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

/**
 * Extract key facts from content (for featured snippets)
 */
export function extractKeyFacts(content: string, maxFacts: number = 5): string[] {
  const facts: string[] = [];
  const lines = content.split("\n").filter((line) => line.trim().length > 20);

  // Look for numbered lists or bullet points
  for (const line of lines) {
    if (/^[\d\u0660-\u0669][\.\)]/.test(line.trim()) || line.trim().startsWith("•")) {
      const fact = line.replace(/^[\d\u0660-\u0669][\.\)]\s*/, "").replace(/^•\s*/, "").trim();
      if (fact.length > 10 && fact.length < 200) {
        facts.push(fact);
      }
    }
    if (facts.length >= maxFacts) break;
  }

  // If not enough bullet points, extract first sentences of paragraphs
  if (facts.length < maxFacts) {
    const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 50);
    for (const para of paragraphs) {
      const firstSentence = para.split(/[.،。]/)[0]?.trim();
      if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
        if (!facts.includes(firstSentence)) {
          facts.push(firstSentence);
        }
      }
      if (facts.length >= maxFacts) break;
    }
  }

  return facts.slice(0, maxFacts);
}

/**
 * Generate TL;DR summary
 */
export function generateTLDR(content: string, maxLength: number = 200): string {
  const plainText = extractPlainTextForAI(content);
  const sentences = plainText.split(/[.،。!؟?]/);

  let tldr = "";
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) continue;

    if (tldr.length + trimmed.length + 2 <= maxLength) {
      tldr += (tldr ? ". " : "") + trimmed;
    } else {
      break;
    }
  }

  return tldr || plainText.slice(0, maxLength).trim() + "...";
}

/**
 * Calculate reading level (simplified Flesch-Kincaid for Arabic)
 */
export function calculateReadingLevel(content: string): string {
  const plainText = extractPlainTextForAI(content);
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  const sentences = plainText.split(/[.،。!؟?]/).filter((s) => s.trim().length > 0);

  if (words.length === 0 || sentences.length === 0) {
    return "unknown";
  }

  const avgWordsPerSentence = words.length / sentences.length;

  // Simplified classification for Arabic
  if (avgWordsPerSentence < 10) return "easy";
  if (avgWordsPerSentence < 20) return "medium";
  if (avgWordsPerSentence < 30) return "advanced";
  return "expert";
}

/**
 * Extract significant links from HTML content
 */
export function extractSignificantLinks(htmlContent: string, siteUrl: string): SignificantLink[] {
  const links: SignificantLink[] = [];
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;

  let match;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    const text = match[2].trim();

    if (!url || !text || text.length < 3) continue;

    // Determine link type
    let type: SignificantLink["type"] = "external";
    if (url.startsWith("/") || url.startsWith(siteUrl)) {
      type = "internal";
    } else if (
      url.includes("wikipedia.org") ||
      url.includes("scholar.google") ||
      url.includes(".gov") ||
      url.includes(".edu")
    ) {
      type = "citation";
    }

    // Determine relevance (simple heuristic)
    let relevance: SignificantLink["relevance"] = "low";
    if (type === "citation") {
      relevance = "high";
    } else if (text.length > 10) {
      relevance = "medium";
    }

    links.push({ url, text, type, relevance });
  }

  return links;
}

/**
 * Generate topic clusters from tags and category
 */
export function generateTopicClusters(
  category?: Category | null,
  tags?: Array<{ tag: Tag }>
): string[] {
  const clusters: string[] = [];

  if (category) {
    clusters.push(category.name);
  }

  if (tags) {
    for (const { tag } of tags) {
      if (!clusters.includes(tag.name)) {
        clusters.push(tag.name);
      }
    }
  }

  return clusters;
}

/**
 * Generate complete AI-optimized metadata
 */
export function generateAIOptimizedMetadata(
  article: {
    content: string;
    excerpt?: string | null;
    citations?: string[];
    category?: Category | null;
    tags?: Array<{ tag: Tag }>;
  },
  siteUrl: string = "https://modonty.com"
): AIOptimizedMetadata {
  const plainText = extractPlainTextForAI(article.content);

  return {
    articleBody: plainText,
    keyFacts: extractKeyFacts(plainText),
    semanticKeywords: [], // To be populated via Wikidata integration (Phase 11)
    citations: article.citations || [],
    significantLinks: extractSignificantLinks(article.content, siteUrl),
    tldr: article.excerpt || generateTLDR(article.content),
    readingLevel: calculateReadingLevel(article.content),
    topicClusters: generateTopicClusters(article.category, article.tags),
  };
}

/**
 * Enhance JSON-LD with AI-crawler optimizations
 */
export function enhanceJsonLdForAI(
  jsonLd: Record<string, unknown>,
  aiMetadata: AIOptimizedMetadata
): Record<string, unknown> {
  const graph = jsonLd["@graph"] as Array<Record<string, unknown>>;
  if (!graph) return jsonLd;

  const articleNode = graph.find((n) => n["@type"] === "Article");
  if (!articleNode) return jsonLd;

  // Add AI-optimized fields
  articleNode.articleBody = aiMetadata.articleBody;

  // Add abstract/TL;DR
  articleNode.abstract = aiMetadata.tldr;

  // Add educational level
  articleNode.educationalLevel = aiMetadata.readingLevel;

  // Add keywords as structured array
  if (aiMetadata.topicClusters.length > 0) {
    articleNode.keywords = aiMetadata.topicClusters.join(", ");
  }

  // Add citations if available
  if (aiMetadata.citations.length > 0) {
    articleNode.citation = aiMetadata.citations;
  }

  // Add significant links as mentions
  const highRelevanceLinks = aiMetadata.significantLinks.filter(
    (l) => l.relevance === "high"
  );
  if (highRelevanceLinks.length > 0) {
    articleNode.mentions = highRelevanceLinks.map((link) => ({
      "@type": "Thing",
      name: link.text,
      url: link.url,
    }));
  }

  return jsonLd;
}
