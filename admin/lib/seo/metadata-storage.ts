/**
 * Next.js Metadata Storage System
 *
 * Handles:
 * - Generating and saving Next.js Metadata to database
 * - Cache invalidation and regeneration
 * - Performance tracking
 */

import { performance } from "perf_hooks";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { generateNextjsMetadata, type ArticleWithMetadataRelations } from "./metadata-generator";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";

// Result of metadata generation
export interface MetadataGenerationResult {
  success: boolean;
  metadata?: any; // Next.js Metadata type
  generationTimeMs?: number;
  error?: string;
}

/**
 * Fetch article with all relations needed for metadata generation
 */
export async function fetchArticleForMetadata(
  articleId: string
): Promise<ArticleWithMetadataRelations | null> {
  return db.article.findUnique({
    where: { id: articleId },
    include: {
      client: {
        include: {
          ogImageMedia: {
            select: {
              url: true,
            },
          },
          logoMedia: {
            select: {
              url: true,
            },
          },
        },
      },
      author: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      featuredImage: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  }) as Promise<ArticleWithMetadataRelations | null>;
}

/**
 * Generate and save Next.js Metadata for an article
 */
export async function generateAndSaveNextjsMetadata(
  articleId: string,
  options?: { robots?: string }
): Promise<MetadataGenerationResult> {
  const startTime = performance.now();

  try {
    // Fetch article with all relations
    const article = await fetchArticleForMetadata(articleId);

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    // Merge article with Settings defaults (12 SOT fields)
    const settings = await getAllSettings();
    const articleDefaults = getArticleDefaultsFromSettings(settings);
    const articleWithDefaults = { ...article, ...articleDefaults } as ArticleWithMetadataRelations;

    // Generate metadata
    const metadata = await generateNextjsMetadata(articleWithDefaults, {
      robots: options?.robots || articleWithDefaults.metaRobots || undefined,
    });

    // Calculate generation time
    const generationTimeMs = Math.round(performance.now() - startTime);

    // Save to database
    await db.article.update({
      where: { id: articleId },
      data: {
        nextjsMetadata: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
      },
    });

    return {
      success: true,
      metadata,
      generationTimeMs,
    };
  } catch (error) {
    const generationTimeMs = Math.round(performance.now() - startTime);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      generationTimeMs,
    };
  }
}

/**
 * Regenerate Next.js Metadata for an article (alias for generateAndSaveNextjsMetadata)
 */
export async function regenerateNextjsMetadata(
  articleId: string,
  options?: { robots?: string }
): Promise<MetadataGenerationResult> {
  return generateAndSaveNextjsMetadata(articleId, options);
}
