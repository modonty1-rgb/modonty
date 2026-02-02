/**
 * Auto-Fix Engine - Phase 10
 *
 * Automatically fixes common SEO issues:
 * - Missing dateModified
 * - Missing seoTitle/seoDescription
 * - Missing slug
 * - Missing word count
 * - Missing reading time
 */

import { db } from "@/lib/db";

export interface AutoFixResult {
  articleId: string;
  fixes: FixAction[];
  success: boolean;
  error?: string;
}

export interface FixAction {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, "") // Keep Arabic, English, numbers
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Count words in content
 */
function countWords(content: string): number {
  const plainText = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Calculate reading time (words per minute)
 */
function calculateReadingTime(wordCount: number, wpm: number = 200): number {
  return Math.max(1, Math.ceil(wordCount / wpm));
}

/**
 * Generate SEO title from article title
 */
function generateSeoTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title;
  }
  return title.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Generate SEO description from content or excerpt
 */
function generateSeoDescription(
  content: string,
  excerpt?: string | null,
  maxLength: number = 160
): string {
  // Prefer excerpt if available
  if (excerpt && excerpt.length >= 50) {
    if (excerpt.length <= maxLength) {
      return excerpt;
    }
    return excerpt.slice(0, maxLength - 3).trim() + "...";
  }

  // Extract first paragraph from content
  const plainText = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const firstParagraph = plainText.split(/[.،。!؟?]/)[0]?.trim() || "";

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  return firstParagraph.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Auto-fix a single article
 */
export async function autoFixArticle(articleId: string): Promise<AutoFixResult> {
  const fixes: FixAction[] = [];

  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return {
        articleId,
        fixes: [],
        success: false,
        error: "Article not found",
      };
    }

    const updates: Record<string, unknown> = {};

    // Fix: Missing or outdated dateModified
    if (!article.dateModified || article.dateModified < article.updatedAt) {
      fixes.push({
        field: "dateModified",
        oldValue: article.dateModified?.toISOString() || null,
        newValue: new Date().toISOString(),
        reason: "dateModified was missing or outdated",
      });
      updates.dateModified = new Date();
    }

    // Fix: Missing seoTitle
    if (!article.seoTitle) {
      const newSeoTitle = generateSeoTitle(article.title);
      fixes.push({
        field: "seoTitle",
        oldValue: null,
        newValue: newSeoTitle,
        reason: "seoTitle was missing, generated from title",
      });
      updates.seoTitle = newSeoTitle;
    }

    // Fix: Missing seoDescription
    if (!article.seoDescription) {
      const newSeoDescription = generateSeoDescription(article.content, article.excerpt);
      if (newSeoDescription.length >= 50) {
        fixes.push({
          field: "seoDescription",
          oldValue: null,
          newValue: newSeoDescription,
          reason: "seoDescription was missing, generated from content",
        });
        updates.seoDescription = newSeoDescription;
      }
    }

    // Fix: Missing excerpt
    if (!article.excerpt) {
      const newExcerpt = generateSeoDescription(article.content, null, 200);
      if (newExcerpt.length >= 50) {
        fixes.push({
          field: "excerpt",
          oldValue: null,
          newValue: newExcerpt,
          reason: "excerpt was missing, generated from content",
        });
        updates.excerpt = newExcerpt;
      }
    }

    // Fix: Missing or incorrect word count
    const actualWordCount = countWords(article.content);
    if (!article.wordCount || Math.abs(article.wordCount - actualWordCount) > 50) {
      fixes.push({
        field: "wordCount",
        oldValue: article.wordCount,
        newValue: actualWordCount,
        reason: "wordCount was missing or incorrect",
      });
      updates.wordCount = actualWordCount;
    }

    // Fix: Missing or incorrect reading time
    const actualReadingTime = calculateReadingTime(actualWordCount);
    if (!article.readingTimeMinutes || article.readingTimeMinutes !== actualReadingTime) {
      fixes.push({
        field: "readingTimeMinutes",
        oldValue: article.readingTimeMinutes,
        newValue: actualReadingTime,
        reason: "readingTimeMinutes was missing or incorrect",
      });
      updates.readingTimeMinutes = actualReadingTime;
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await db.article.update({
        where: { id: articleId },
        data: updates,
      });
    }

    return {
      articleId,
      fixes,
      success: true,
    };
  } catch (error) {
    return {
      articleId,
      fixes,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Auto-fix multiple articles
 */
export async function batchAutoFix(
  articleIds: string[],
  options?: {
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<{
  successful: number;
  failed: number;
  totalFixes: number;
  results: AutoFixResult[];
}> {
  const results: AutoFixResult[] = [];
  let successful = 0;
  let failed = 0;
  let totalFixes = 0;

  for (let i = 0; i < articleIds.length; i++) {
    const result = await autoFixArticle(articleIds[i]);
    results.push(result);

    if (result.success) {
      successful++;
      totalFixes += result.fixes.length;
    } else {
      failed++;
    }

    options?.onProgress?.(i + 1, articleIds.length);
  }

  return { successful, failed, totalFixes, results };
}

/**
 * Find articles that need auto-fix
 */
export async function findArticlesNeedingFix(): Promise<string[]> {
  const articles = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { seoTitle: null },
        { seoDescription: null },
        { wordCount: null },
        { readingTimeMinutes: null },
        { excerpt: null },
      ],
    },
    select: { id: true },
  });

  return articles.map((a) => a.id);
}

/**
 * Preview fixes without applying them
 */
export async function previewAutoFix(articleId: string): Promise<FixAction[]> {
  const fixes: FixAction[] = [];

  const article = await db.article.findUnique({
    where: { id: articleId },
  });

  if (!article) return fixes;

  // Check all fixable fields
  if (!article.dateModified || article.dateModified < article.updatedAt) {
    fixes.push({
      field: "dateModified",
      oldValue: article.dateModified?.toISOString() || null,
      newValue: new Date().toISOString(),
      reason: "dateModified was missing or outdated",
    });
  }

  if (!article.seoTitle) {
    fixes.push({
      field: "seoTitle",
      oldValue: null,
      newValue: generateSeoTitle(article.title),
      reason: "seoTitle was missing",
    });
  }

  if (!article.seoDescription) {
    const desc = generateSeoDescription(article.content, article.excerpt);
    if (desc.length >= 50) {
      fixes.push({
        field: "seoDescription",
        oldValue: null,
        newValue: desc,
        reason: "seoDescription was missing",
      });
    }
  }

  const wordCount = countWords(article.content);
  if (!article.wordCount || Math.abs(article.wordCount - wordCount) > 50) {
    fixes.push({
      field: "wordCount",
      oldValue: article.wordCount,
      newValue: wordCount,
      reason: "wordCount was incorrect",
    });
  }

  const readingTime = calculateReadingTime(wordCount);
  if (!article.readingTimeMinutes || article.readingTimeMinutes !== readingTime) {
    fixes.push({
      field: "readingTimeMinutes",
      oldValue: article.readingTimeMinutes,
      newValue: readingTime,
      reason: "readingTimeMinutes was incorrect",
    });
  }

  return fixes;
}
