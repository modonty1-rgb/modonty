import { db } from "@/lib/db";

/**
 * The maintenance half of Tarek's task (6 Oct 2026): titles no longer carry the client's name.
 *
 * Saving stopped appending it (metadata-generator · generateSEOTitle), but a few articles have
 * it written INTO the `seoTitle` field (the old auto-fill: «title | client»), and regenerating
 * the metadata builds the title from that field — so the name would survive. This removes a
 * trailing « | client» or « - client» from the field; the caller regenerates right after, so
 * every article ends on the one rule: title = the field, on local and on production alike.
 *
 * Only an exact trailing match of the article's own client name is removed — a title that
 * merely mentions the client elsewhere is the writer's wording and stays.
 *
 * Returns whether the field changed.
 */
export async function stripClientNameFromSeoTitle(articleId: string): Promise<boolean> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { seoTitle: true, client: { select: { name: true } } },
  });
  const seoTitle = article?.seoTitle?.trim();
  const clientName = article?.client?.name?.trim();
  if (!seoTitle || !clientName) return false;

  for (const separator of [" | ", " - ", " – ", " — "]) {
    const suffix = `${separator}${clientName}`;
    if (seoTitle.endsWith(suffix)) {
      const cleaned = seoTitle.slice(0, -suffix.length).trim();
      if (!cleaned) return false;
      await db.article.update({ where: { id: articleId }, data: { seoTitle: cleaned } });
      return true;
    }
  }
  return false;
}
