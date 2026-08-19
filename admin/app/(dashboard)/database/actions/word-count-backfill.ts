"use server";

import { db } from "@/lib/db";
import {
  calculateWordCountImproved,
  calculateReadingTime,
  determineContentDepth,
} from "@/app/(dashboard)/articles/helpers/word-count";

/**
 * Recompute `wordCount`, `readingTimeMinutes` and `contentDepth` from the article body.
 *
 * Why this exists (measured 2026-08-19 on `modonty_dev`): the create and update mutations
 * accepted a caller-supplied count (`data.wordCount || calculate(...)`), so a wrong number
 * in the payload stuck forever. 23 of 160 articles disagreed with their own body — one
 * stored 14 words for a 1,978-word article, another stored 10 for 1,997.
 *
 * The number is not cosmetic. It is printed under the title, sent to Google inside the
 * article's structured data, graded by the SEO analyser, and it is the field the
 * "عندك كم دقيقة؟" filter on /articles buckets by — so the ten-minute article above was
 * filed under "على الماشي, ≤3 دقائق".
 *
 * The mutations now always derive it. This step brings the rows written before that fix
 * to the same truth, using the same helper, so there is one rule and no second
 * implementation to drift. Idempotent: a row that already agrees is skipped.
 */

/** Below this ratio of difference a row is left alone — the helper's own rounding. */
const TOLERANCE = 0.02;

export interface WordCountBackfillStats {
  totalArticles: number;
  /** Rows whose stored count disagrees with their body. */
  wrong: number;
  sample: Array<{ id: string; title: string; stored: number | null; real: number }>;
}

export async function getWordCountBackfillStats(): Promise<WordCountBackfillStats> {
  const rows = await db.article.findMany({
    select: { id: true, title: true, content: true, wordCount: true },
    take: 1000,
  });

  const wrongRows = rows
    // No language argument: the helper detects Arabic from the text itself, and the
    // Article row does not carry a language — forcing "ar" would mis-count an English body.
    .map((r) => ({ ...r, real: calculateWordCountImproved(r.content ?? "") }))
    .filter((r) => r.real > 0 && !withinTolerance(r.wordCount, r.real));

  return {
    totalArticles: rows.length,
    wrong: wrongRows.length,
    sample: wrongRows.slice(0, 5).map((r) => ({
      id: r.id,
      title: r.title,
      stored: r.wordCount,
      real: r.real,
    })),
  };
}

function withinTolerance(stored: number | null, real: number): boolean {
  if (stored == null) return false;
  return Math.abs(stored - real) <= Math.max(1, real * TOLERANCE);
}

export interface WordCountBackfillResult {
  attempted: number;
  successful: number;
  failed: number;
}

export async function backfillArticleWordCount(): Promise<WordCountBackfillResult> {
  const rows = await db.article.findMany({
    select: { id: true, content: true, wordCount: true },
    take: 1000,
  });

  const targets = rows
    .map((r) => ({ id: r.id, real: calculateWordCountImproved(r.content ?? ""), stored: r.wordCount }))
    .filter((r) => r.real > 0 && !withinTolerance(r.stored, r.real));

  let successful = 0;
  let failed = 0;
  const CONCURRENCY = 5;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map((t) =>
        db.article
          .update({
            where: { id: t.id },
            data: {
              wordCount: t.real,
              readingTimeMinutes: calculateReadingTime(t.real),
              contentDepth: determineContentDepth(t.real),
            },
            select: { id: true },
          })
          .then(() => true)
          .catch(() => false),
      ),
    );
    for (const done of results) done ? successful++ : failed++;
  }

  return { attempted: targets.length, successful, failed };
}
