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
import { truncateAtWordBoundary } from "@modonty/shared/lib/seo/truncate-at-word-boundary";

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
  return truncateAtWordBoundary(title, maxLength);
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
    return truncateAtWordBoundary(excerpt, maxLength);
  }

  // Extract first paragraph from content
  const plainText = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // «،» (U+060C ARABIC COMMA) is NOT a sentence end and used to be in this class, so the
  // first "sentence" of an Arabic article ended at its first comma — «…في السعودية ومصر»,
  // 85 characters, chopped mid-thought — and that string was written to `excerpt` and
  // `seoDescription`. Unicode UAX #29 assigns U+060C the Sentence_Break value SContinue,
  // the class whose whole meaning is that the sentence continues, alongside U+002C COMMA
  // and U+003B SEMICOLON. <https://www.unicode.org/reports/tr29/>
  const firstParagraph = plainText.split(/[.。!؟?]/)[0]?.trim() || "";

  return truncateAtWordBoundary(firstParagraph, maxLength);
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

    // Fix: MISSING dateModified. Only missing.
    //
    // The condition used to be `!dateModified || dateModified < updatedAt`, and the second
    // half was always true. Article carries BOTH `dateModified @updatedAt` and
    // `updatedAt @updatedAt` (schema.prisma:1304, 1371). Every write bumps both, so
    // `dateModified < updatedAt` is not evidence of a stale date — it is the ordinary state
    // of every row, and this branch restamped the date on each run. The article had not
    // changed; Google was told it had.
    //
    // It also fought the fix in jsonld-storage.ts / metadata-storage.ts, which preserve
    // `dateModified` across a cache write precisely so it stops moving on its own. Those
    // writes still bump `updatedAt`, so the old rule would have undone them on the next run.
    if (!article.dateModified) {
      fixes.push({
        field: "dateModified",
        oldValue: null,
        newValue: new Date().toISOString(),
        reason: "dateModified was missing",
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

  // Check all fixable fields. `dateModified` only when MISSING — see the same check in
  // applyAutoFixes above: `dateModified < updatedAt` is true on every row, because both
  // fields carry `@updatedAt` and every write bumps both. As a preview it reported a fix
  // that was never warranted, on every article, every run.
  if (!article.dateModified) {
    fixes.push({
      field: "dateModified",
      oldValue: null,
      newValue: new Date().toISOString(),
      reason: "dateModified was missing",
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
