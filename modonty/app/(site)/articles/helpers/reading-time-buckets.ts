import type { FeedPost } from "@/lib/types";

export type ReadingTimeBucket = "short" | "medium" | "long";

export interface BucketDefinition {
  key: ReadingTimeBucket;
  /** What the visitor reads on the button — the way he'd say it out loud, not a range. */
  label: string;
  /** The range, spelled out underneath. */
  hint: string;
  min: number;
  max: number;
}

/**
 * Three buckets, cut where the articles actually fall.
 *
 * Measured 2026-08-19 on all 117 published articles — every one of them carries
 * `readingTimeMinutes`, spread from 1 to 27. These cuts split them 27 / 49 / 41, so no bucket is
 * a decoration and none swallows the rest. Cuts invented without looking would have produced an
 * empty button, which is the one thing a filter must never do.
 *
 * The names are one Gulf image, not three labels: standing, sitting with coffee, settling in.
 * Khalid named the last one himself («جلسة روقان») and rejected the first draft's «على السريع»
 * for being flat.
 */
export const READING_TIME_BUCKETS: BucketDefinition[] = [
  { key: "short", label: "على الماشي", hint: "٣ دقائق أو أقل", min: 0, max: 3 },
  { key: "medium", label: "فنجان قهوة", hint: "٤ إلى ٧ دقائق", min: 4, max: 7 },
  { key: "long", label: "جلسة روقان", hint: "٨ دقائق فأكثر", min: 8, max: Number.MAX_SAFE_INTEGER },
];

function bucketOf(minutes: number | undefined): ReadingTimeBucket | null {
  if (!minutes || minutes < 1) return null;
  return READING_TIME_BUCKETS.find((b) => minutes >= b.min && minutes <= b.max)?.key ?? null;
}

/** Keeps only the articles that fit the chosen bucket. */
export function filterByReadingTime(articles: FeedPost[], bucket: ReadingTimeBucket | undefined) {
  if (!bucket) return articles;
  return articles.filter((a) => bucketOf(a.readingTimeMinutes) === bucket);
}

/**
 * How many articles sit in each bucket, counted on the CURRENT result set — so the numbers move
 * with the industry or category the visitor already picked instead of quoting the whole site.
 */
export function countByReadingTime(articles: FeedPost[]): Record<ReadingTimeBucket, number> {
  const counts: Record<ReadingTimeBucket, number> = { short: 0, medium: 0, long: 0 };
  for (const article of articles) {
    const key = bucketOf(article.readingTimeMinutes);
    if (key) counts[key] += 1;
  }
  return counts;
}
