/**
 * Internal links inside a CLIENT-SITE article.
 *
 * A relative `/articles/…` link resolves against whatever domain renders the page —
 * on the client's website it becomes a link to a page of theirs that does not exist.
 * An absolute `modonty.com/…` link is worse: it walks the client's reader off their
 * own site and onto ours, from an article they paid for.
 *
 * So the body of a client-site article carries no hand-written internal links at all.
 * Articles are connected through the `relatedArticles` relation instead, which we
 * resolve to the client's own domain when we build their payload.
 */

/** Links that are not navigation between pages, so not our business. */
function isNonNavigational(href: string): boolean {
  return !href || href.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(href);
}

/** Returns every offending href found in the body — empty when the article is clean. */
export function findManualInternalLinks(content: string): string[] {
  const hrefs = [...content.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1].trim());

  return hrefs.filter((href) => {
    if (isNonNavigational(href)) return false;
    if (href.startsWith("/")) return true; // relative — resolves against the wrong host
    return /^https?:\/\/(www\.)?modonty\.com/i.test(href); // absolute, pointed at us
  });
}

/** One wording, used by both the create and the update path. */
export function manualInternalLinksMessage(links: string[]): string {
  const sample = links.slice(0, 3).join(" · ");
  return `مقال موقع العميل ما يقبل روابط داخلية مكتوبة باليد (${links.length}): ${sample}. اربط المقالات من تبويب «Related» بدل كتابة الرابط.`;
}
