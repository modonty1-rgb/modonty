import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";

/**
 * Published, actually-answered questions for an article. An empty answer is not a FAQ.
 *
 * Cached like its siblings (`get-related-articles-by-client`), and for a stronger reason: this
 * result is awaited at the TOP of the article page and feeds the FAQPage JSON-LD, so an uncached
 * read here made the whole article — content already cached and ready — wait on a live MongoDB
 * round trip. When that round trip dropped, React's Flight stream ended early («Connection
 * closed.») and the reader got the error card instead of an article that was sitting in cache.
 * Measured 1 Sep 2026: the boundary fired live at 07:47 on a perfectly healthy article.
 *
 * `cacheTag("articles")` is the same tag the admin fires `revalidateTag` on after every publish
 * or edit, so an answered question still appears immediately — the cache never serves a stale FAQ
 * past a save.
 */
export async function getArticleFaqs(articleId: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  const faqs = await db.articleFAQ.findMany({
    where: {
      articleId,
      status: "PUBLISHED",
      AND: [{ answer: { not: null } }, { answer: { not: "" } }],
    },
    orderBy: { position: "asc" },
    select: { id: true, question: true, answer: true, position: true },
  });
  return faqs.filter(
    (f): f is typeof f & { answer: string } => typeof f.answer === "string" && f.answer.length > 0
  );
}
