/**
 * JSON-LD Storage System - Phase 4
 *
 * Handles:
 * - Generating and saving JSON-LD to database
 * - Cache invalidation and regeneration
 * - Plain text extraction for articleBody
 * - Performance tracking
 */

import { db } from "@/lib/db";
import { convert } from "html-to-text";
import type { Prisma } from "@prisma/client";
import {
  generateArticleKnowledgeGraph,
  stringifyKnowledgeGraph,
  ArticleWithFullRelations,
} from "./knowledge-graph-generator";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";
import {
  validateJsonLdComplete,
  ValidationReport,
} from "./jsonld-validator";
import { normalizeJsonLd } from "./jsonld-processor";

// Result of JSON-LD generation
export interface JsonLdGenerationResult {
  success: boolean;
  jsonLd?: object;
  jsonLdString?: string;
  validationReport?: ValidationReport;
  error?: string;
}

/**
 * Fetch article with all relations needed for JSON-LD generation
 */
export async function fetchArticleForJsonLd(
  articleId: string
): Promise<ArticleWithFullRelations | null> {
  return db.article.findUnique({
    where: { id: articleId },
    include: {
      client: {
        include: {
          logoMedia: true,
        },
      },
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      featuredImage: true,
      gallery: {
        include: {
          media: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      faqs: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

/**
 * Extract plain text from HTML/Markdown content
 */
export function extractPlainText(content: string): string {
  return convert(content, {
    wordwrap: false,
    selectors: [
      { selector: "img", format: "skip" },
      { selector: "a", options: { ignoreHref: true } },
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "noscript", format: "skip" },
    ],
  }).trim();
}

/**
 * Generate and save JSON-LD for an article
 */
export async function generateAndSaveJsonLd(
  articleId: string
): Promise<JsonLdGenerationResult> {
  try {
    // Fetch article with all relations
    const article = await fetchArticleForJsonLd(articleId);

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    // Merge article with Settings defaults (12 SOT fields)
    const settings = await getAllSettings();
    const articleDefaults = getArticleDefaultsFromSettings(settings);
    const articleWithDefaults = { ...article, ...articleDefaults } as ArticleWithFullRelations;

    // Extract plain text for articleBody
    const articleBodyText = extractPlainText(articleWithDefaults.content);

    // Generate knowledge graph
    const articleWithText = {
      ...articleWithDefaults,
      articleBodyText,
    };
    const knowledgeGraph = generateArticleKnowledgeGraph(articleWithText);

    // Normalize JSON-LD structure (ensures consistency)
    const normalizedGraph = await normalizeJsonLd(knowledgeGraph);

    // Validate (Adobe + Ajv + business rules)
    const validationReport = await validateJsonLdComplete(normalizedGraph, {
      requirePublisherLogo: true,
      requireHeroImage: true,
      requireAuthorBio: false,
    });

    // Stringify normalized graph for storage
    const jsonLdString = stringifyKnowledgeGraph(normalizedGraph);

    // Get current article for version tracking
    const currentArticle = await db.article.findUnique({
      where: { id: articleId },
      select: {
        jsonLdVersion: true,
        jsonLdHistory: true,
        jsonLdStructuredData: true,
      },
    });

    // Build history (keep last 5 versions)
    const history = (currentArticle?.jsonLdHistory as unknown[]) || [];
    if (currentArticle?.jsonLdStructuredData) {
      // Add current version to history before replacing
      const historyEntry = {
        version: currentArticle.jsonLdVersion || 1,
        data: currentArticle.jsonLdStructuredData,
        timestamp: new Date().toISOString(),
      };

      if (history.length >= 5) {
        history.shift(); // Remove oldest
      }
      history.push(historyEntry);
    }

    // Save to database
    await db.article.update({
      where: { id: articleId },
      data: {
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: JSON.parse(
          JSON.stringify(validationReport)
        ) as Prisma.InputJsonValue,
        articleBodyText,
        jsonLdVersion: (currentArticle?.jsonLdVersion || 0) + 1,
        jsonLdHistory: JSON.parse(JSON.stringify(history)) as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      jsonLd: knowledgeGraph,
      jsonLdString,
      validationReport,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Regenerate JSON-LD for an article (alias for generateAndSaveJsonLd)
 */
export async function regenerateJsonLd(
  articleId: string
): Promise<JsonLdGenerationResult> {
  return generateAndSaveJsonLd(articleId);
}

/**
 * Get cached JSON-LD from database
 */
export async function getCachedJsonLd(
  articleId: string
): Promise<{ jsonLd: object | null; validationReport: ValidationReport | null }> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
    },
  });

  if (!article) {
    return { jsonLd: null, validationReport: null };
  }

  let jsonLd: object | null = null;
  if (article.jsonLdStructuredData) {
    try {
      jsonLd = JSON.parse(article.jsonLdStructuredData);
    } catch {
      jsonLd = null;
    }
  }

  return {
    jsonLd,
    validationReport: article.jsonLdValidationReport as ValidationReport | null,
  };
}

/**
 * Check if JSON-LD needs regeneration
 */
export async function needsRegeneration(articleId: string): Promise<boolean> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      jsonLdLastGenerated: true,
      dateModified: true,
    },
  });

  if (!article) {
    return false;
  }

  // Needs regeneration if never generated or article modified after last generation
  if (!article.jsonLdLastGenerated) {
    return true;
  }

  return article.dateModified > article.jsonLdLastGenerated;
}

/**
 * Rollback to a previous JSON-LD version
 */
export async function rollbackJsonLd(
  articleId: string,
  targetVersion: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: {
        jsonLdHistory: true,
      },
    });

    if (!article) {
      return { success: false, error: "Article not found" };
    }

    const history = (article.jsonLdHistory as Array<{
      version: number;
      data: string;
      timestamp: string;
    }>) || [];

    const targetSnapshot = history.find((h) => h.version === targetVersion);

    if (!targetSnapshot) {
      return {
        success: false,
        error: `Version ${targetVersion} not found in history`,
      };
    }

    await db.article.update({
      where: { id: articleId },
      data: {
        jsonLdStructuredData: targetSnapshot.data,
        jsonLdVersion: targetSnapshot.version,
        jsonLdDiffSummary: `Rolled back to version ${targetVersion}`,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch regenerate JSON-LD for multiple articles
 */
export async function batchRegenerateJsonLd(
  articleIds: string[],
  options?: {
    onProgress?: (completed: number, total: number, current: string) => void;
    onError?: (articleId: string, error: string) => void;
  }
): Promise<{
  successful: number;
  failed: number;
  results: Array<{ articleId: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ articleId: string; success: boolean; error?: string }> = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < articleIds.length; i++) {
    const articleId = articleIds[i];

    try {
      const result = await generateAndSaveJsonLd(articleId);

      if (result.success) {
        successful++;
        results.push({ articleId, success: true });
      } else {
        failed++;
        results.push({ articleId, success: false, error: result.error });
        options?.onError?.(articleId, result.error || "Unknown error");
      }
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ articleId, success: false, error: errorMessage });
      options?.onError?.(articleId, errorMessage);
    }

    options?.onProgress?.(i + 1, articleIds.length, articleId);
  }

  return { successful, failed, results };
}

/**
 * Get all articles that need JSON-LD regeneration
 */
export async function getArticlesNeedingRegeneration(): Promise<string[]> {
  const articles = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { jsonLdLastGenerated: null },
        {
          dateModified: {
            gt: db.article.fields.jsonLdLastGenerated,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return articles.map((a) => a.id);
}

/**
 * Get JSON-LD statistics
 */
export async function getJsonLdStats(): Promise<{
  total: number;
  withJsonLd: number;
  withErrors: number;
  withWarnings: number;
}> {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
    },
  });

  let withJsonLd = 0;
  let withErrors = 0;
  let withWarnings = 0;
  for (const article of articles) {
    if (article.jsonLdStructuredData) {
      withJsonLd++;
    }

    const report = article.jsonLdValidationReport as ValidationReport | null;
    if (report) {
      if (report.adobe?.errors && report.adobe.errors.length > 0) {
        withErrors++;
      }
      if (report.adobe?.warnings && report.adobe.warnings.length > 0) {
        withWarnings++;
      }
    }

  }

  return {
    total: articles.length,
    withJsonLd,
    withErrors,
    withWarnings,
  };
}
