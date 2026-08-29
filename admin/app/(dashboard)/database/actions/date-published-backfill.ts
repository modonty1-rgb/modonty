"use server";

import { db } from "@/lib/db";
import { regenerateJsonLd } from "@/lib/seo/jsonld-storage";

/**
 * Give every PUBLISHED article a `datePublished`.
 *
 * Why this exists (measured 28 Aug 2026 on production-synced data): 13 of 135 published
 * articles carried `datePublished: null`. They are not test rows — they are live client
 * articles for شركة جبر سيو and شركة جبر الجنوبية, all created 2026-04-09, before the publish
 * mutation started stamping the field. The mutation stamps it now; this step brings the older
 * rows to the same truth, so there is one rule and no second implementation to drift.
 *
 * The field is what Google reads inside `Article` — it is how a result gets a date next to it
 * and one of the conditions an article result is judged on
 * (developers.google.com/search/docs/appearance/structured-data/article).
 *
 * `createdAt` is the source because it is the ONLY date these rows carry: `scheduledAt` and
 * `ogArticlePublishedTime` are empty on all of them, and `dateModified` is months later (a
 * later bulk edit), so using it would claim the article was published after it was modified.
 * `createdAt` is the earliest evidence the database has of the article existing — a
 * conservative, defensible answer rather than an invented one.
 *
 * Idempotent: a row that already has a date is never touched.
 */

export interface DatePublishedBackfillStats {
  /** Every published article — counted, not capped. */
  totalPublished: number;
  /** How many of them lack a `datePublished`. */
  missing: number;
  sample: Array<{ id: string; title: string; willUse: string }>;
}

export async function getDatePublishedBackfillStats(): Promise<DatePublishedBackfillStats> {
  const totalPublished = await db.article.count({ where: { status: "PUBLISHED" } });
  const rows = await db.article.findMany({
    where: { status: "PUBLISHED", datePublished: null },
    select: { id: true, title: true, createdAt: true },
    take: 1000,
  });

  return {
    totalPublished,
    missing: rows.length,
    sample: rows.slice(0, 5).map((r) => ({
      id: r.id,
      title: r.title,
      willUse: r.createdAt.toISOString(),
    })),
  };
}

export interface DatePublishedBackfillResult {
  attempted: number;
  successful: number;
  failed: number;
}

export async function backfillArticleDatePublished(): Promise<DatePublishedBackfillResult> {
  const targets = await db.article.findMany({
    where: { status: "PUBLISHED", datePublished: null },
    select: { id: true, createdAt: true },
    take: 1000,
  });

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
            data: { datePublished: t.createdAt },
            select: { id: true },
          })
          // The column alone is not what Google reads — the STORED JSON-LD card is, and it
          // carries its own copy. Fixing one and not the other is the trap this whole SEO
          // layer keeps falling into (see word-count-backfill.ts for the same note).
          .then(() => regenerateJsonLd(t.id).then((r) => r.success))
          .catch(() => false),
      ),
    );
    for (const done of results) done ? successful++ : failed++;
  }

  return { attempted: targets.length, successful, failed };
}
