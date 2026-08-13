// Internal-linking score for one article (0–100) — the third dimension beside meta and
// JSON-LD, added 2026-08-13 after Tarek's standing complaint that building the related-
// articles list moved no number anywhere.
//
// He was right, and it was not a plumbing bug: the rubric simply had no criterion for it,
// so `relatedFrom` was never even selected from the database. The links a writer builds do
// render on the public article page, so they were real SEO work that the score ignored.
//
// Sources:
//  - Google Search Central, "Links best practices": internal links help Google discover and
//    understand how pages relate; a page with no path in from related content is harder to
//    surface. Google publishes NO numeric target, so the ladder below is an EDITORIAL
//    standard, not a claimed Google threshold — see RELATED_GOOD.
//  - Only OUTGOING links are scored (`relatedFrom` = rows where this article is the source).
//    Incoming links are other writers' decisions; scoring them would grade an author for
//    work that is not theirs, and would let one popular article inflate its own number.

import type { SeoCheck, SeoScore } from "../client/types";

export interface ArticleLinksInput {
  /**
   * REQUIRED key — how many articles THIS article points at (`_count.relatedFrom`).
   *
   * Required, not optional, for the reason written across this codebase in blood: a scorer
   * cannot tell "not selected" from "zero". If a Prisma select forgot the count, every row
   * would silently score 0 here and the whole table would look broken. Requiring the key
   * turns that omission into a compile error at the call site.
   */
  relatedCount: number;
}

/** Full marks at three related articles — enough to give a reader somewhere to go next
 *  without turning the page into a link farm. Editorial, not a Google-published number. */
const RELATED_GOOD = 3;

export function computeArticleLinksScore(input: ArticleLinksInput): SeoScore {
  const checks: SeoCheck[] = [];
  const n = Number.isFinite(input.relatedCount) ? Math.max(0, Math.trunc(input.relatedCount)) : 0;

  let earned = 0;
  let status: SeoCheck["status"] = "error";
  let hint: string | undefined;

  if (n >= RELATED_GOOD) {
    earned = 100;
    status = "good";
  } else if (n === 2) {
    earned = 70;
    status = "warning";
    hint = "مقالان مرتبطان — أضف ثالثاً ليكتمل المعيار";
  } else if (n === 1) {
    earned = 40;
    status = "warning";
    hint = "مقال مرتبط واحد — الهدف ثلاثة";
  } else {
    hint = "لا مقالات مرتبطة — القارئ يصل ولا يجد وجهة تالية";
  }

  checks.push({
    key: "links.related",
    label: "المقالات المرتبطة",
    status,
    hint,
    earned,
    max: 100,
  });

  return { score: earned, checks };
}
