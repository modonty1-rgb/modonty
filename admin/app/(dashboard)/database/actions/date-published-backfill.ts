"use server";

import { db } from "@/lib/db";
import { regenerateJsonLd } from "@/lib/seo/jsonld-storage";

interface DatePublishedBackfillResult {
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
