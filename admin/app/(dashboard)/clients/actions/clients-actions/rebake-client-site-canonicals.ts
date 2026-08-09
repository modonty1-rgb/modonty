"use server";

import { db } from "@/lib/db";

/**
 * Rebuild the baked URLs of every article that lives on this client's own website.
 *
 * `canonicalUrl` and `mainEntityOfPage` are written INTO the article at save time, from
 * the client's articles address as it stood that day. Change that address later and every
 * article already written keeps pointing at the old one — and those columns are what the
 * JSON-LD, the metadata and the client's own site are all built from. So the address is
 * not really changed until these are rewritten.
 *
 * Runs only when the address actually changed (the caller compares old to new), and only
 * over that client's client-site articles: a modonty article of the same client is built
 * from modonty's domain and has nothing to do with this.
 *
 * The caller regenerates JSON-LD and metadata for the client's articles right after, so
 * this deliberately writes the columns only — one rule, one place.
 */
export interface RebakeResult {
  attempted: number;
  updated: number;
}

export async function rebakeClientSiteCanonicals(
  clientId: string,
  articlesBaseUrl: string | null,
): Promise<RebakeResult> {
  const base = (articlesBaseUrl ?? "").trim().replace(/\/+$/, "");
  if (!base) return { attempted: 0, updated: 0 };

  const articles = await db.article.findMany({
    where: { clientId, isClientSiteArticle: true },
    select: { id: true, slug: true, canonicalUrl: true },
    take: 1000,
  });

  let updated = 0;

  for (const article of articles) {
    const next = `${base}/${article.slug}`;
    if (article.canonicalUrl === next) continue;

    await db.article
      .update({
        where: { id: article.id },
        data: { canonicalUrl: next, mainEntityOfPage: next },
      })
      .then(() => {
        updated++;
      })
      .catch(() => {});
  }

  return { attempted: articles.length, updated };
}
