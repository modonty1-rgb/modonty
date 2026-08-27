/**
 * Next.js Metadata Storage System
 *
 * Handles:
 * - Generating and saving Next.js Metadata to database
 * - Cache invalidation and regeneration
 * - Performance tracking
 */

import { performance } from "perf_hooks";
import { mergeArticleWithDefaults } from "./merge-article-with-defaults";
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
          heroImageMedia: {
            select: {
              url: true,
              bunnyUrl: true, blurDataURL: true,
              altText: true,
              width: true,
              height: true,
            },
          },
          logoMedia: {
            select: {
              url: true,
              bunnyUrl: true, blurDataURL: true,
              altText: true,
              width: true,
              height: true,
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
          bunnyUrl: true, blurDataURL: true,
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
    const articleWithDefaults = mergeArticleWithDefaults(article, articleDefaults) as unknown as ArticleWithMetadataRelations;

    // Generate metadata
    const metadata = await generateNextjsMetadata(articleWithDefaults, {
      robots: options?.robots || articleWithDefaults.metaRobots || undefined,
      // og:site_name names the site the page is served from — Settings is its only source.
      siteName: settings?.siteName || undefined,
    });

    // Calculate generation time
    const generationTimeMs = Math.round(performance.now() - startTime);

    // Save to database.
    //
    // `dateModified` is passed back UNCHANGED — same reason as jsonld-storage.ts: it carries
    // `@updatedAt`, and a cache write is not an edit to the article. Restamping it here made
    // `article:modified_time` disagree with the JSON-LD `dateModified` on the same page, and
    // told Google an untouched article had just changed. Prisma honours the explicit value
    // (Schema Reference, @updatedAt: "If no timestamp is manually supplied, Prisma Client
    // sets it automatically"); a real content edit supplies nothing, so it still bumps.
    await db.article.update({
      where: { id: articleId },
      data: {
        // Guarded: `dateModified` is optional on the merged article type, and Prisma refuses
        // `null` for a non-nullable column. Absent -> the field is simply not written, and
        // `@updatedAt` behaves as before for that row.
        ...(article.dateModified ? { dateModified: article.dateModified } : {}),
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
