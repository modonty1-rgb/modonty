"use server";

import { db } from "@/lib/db";
import { regenerateJsonLd } from "@/lib/seo/jsonld-storage";
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
  /** Every article in the database — counted, not capped. */
  totalArticles: number;
  /** How many of them this pass actually read. Below `totalArticles` = the rest went unexamined. */
  scanned: number;
  /** Rows whose stored count disagrees with their body. */
  wrong: number;
  sample: Array<{ id: string; title: string; stored: number | null; real: number }>;
}

export async function getWordCountBackfillStats(): Promise<WordCountBackfillStats> {
  // The cap is real, so it is REPORTED rather than hidden. This read `take: 1000` and then
  // handed the caller `rows.length` as `totalArticles` — so past a thousand articles the
  // screen would say "1000 articles, 0 wrong" while the rest of the library went unexamined.
  // A silent truncation reads as "we covered everything", which is worse than a visible
  // failure: nobody investigates good news.
  //
  // The cap stays (each row carries a full article body; lifting it turns one dashboard click
  // into a multi-megabyte read), but the true total is counted separately and the difference
  // is surfaced through `scanned` / `totalArticles`.
  const SCAN_CAP = 1000;
  const totalArticles = await db.article.count();
  const rows = await db.article.findMany({
    select: { id: true, title: true, content: true, wordCount: true, jsonLdStructuredData: true },
    take: SCAN_CAP,
  });

  const wrongRows = rows
    // No language argument: the helper detects Arabic from the text itself, and the
    // Article row does not carry a language — forcing "ar" would mis-count an English body.
    .map((r) => ({ ...r, real: calculateWordCountImproved(r.content ?? "") }))
    .filter((r) => r.real > 0 && isStale(r.wordCount, r.jsonLdStructuredData, r.real));

  return {
    totalArticles,
    scanned: rows.length,
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

/** The `wordCount` inside the stored JSON-LD card, which Google reads instead of the column. */
function cardWordCount(card: string | null): number | null {
  if (!card) return null;
  const match = card.match(/"wordCount"\s*:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

/** A row is stale if EITHER its column or its stored card disagrees with the body. */
function isStale(stored: number | null, card: string | null, real: number): boolean {
  if (!withinTolerance(stored, real)) return true;
  const inCard = cardWordCount(card);
  return inCard !== null && !withinTolerance(inCard, real);
}

export interface WordCountBackfillResult {
  attempted: number;
  successful: number;
  failed: number;
  /** Rows the cap left unread. Above zero = the sweep was partial; run it again. */
  unscanned: number;
}

export async function backfillArticleWordCount(): Promise<WordCountBackfillResult> {
  // Same cap, same rule: it is reported, not hidden. A run that fixed the first thousand and
  // returned `{ attempted, successful, failed }` looked identical to one that fixed the whole
  // library — so Run-All could report a clean sweep while thousands of rows stayed untouched.
  // `unscanned` is what the panel needs to say "there are more; run it again".
  const SCAN_CAP = 1000;
  const totalArticles = await db.article.count();
  const rows = await db.article.findMany({
    select: { id: true, content: true, wordCount: true, jsonLdStructuredData: true },
    take: SCAN_CAP,
  });

  const targets = rows
    .map((r) => ({
      id: r.id,
      real: calculateWordCountImproved(r.content ?? ""),
      stored: r.wordCount,
      card: r.jsonLdStructuredData,
    }))
    .filter((r) => r.real > 0 && isStale(r.stored, r.card, r.real));

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
          // The visitor reads the column; Google reads the STORED JSON-LD card, which
          // carries its own copy of `wordCount`. Fixing the column alone left the page
          // showing 1,835 words while its structured data still told Google 14.
          .then(() => regenerateJsonLd(t.id).then((r) => r.success))
          .catch(() => false),
      ),
    );
    for (const done of results) done ? successful++ : failed++;
  }

  return { attempted: targets.length, successful, failed, unscanned: Math.max(0, totalArticles - rows.length) };
}
