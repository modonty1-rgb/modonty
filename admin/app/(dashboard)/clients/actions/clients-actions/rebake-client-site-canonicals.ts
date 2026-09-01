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
  /**
   * Articles whose baked URL could NOT be rewritten. They still point at the old address, and
   * everything built from those columns afterwards inherits it — so the caller must not treat
   * a run with failures as an address change that completed.
   */
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export async function rebakeClientSiteCanonicals(
  clientId: string,
  articlesBaseUrl: string | null,
): Promise<RebakeResult> {
  const base = (articlesBaseUrl ?? "").trim().replace(/\/+$/, "");
  if (!base) return { attempted: 0, updated: 0, failed: 0, errors: [] };

  // ── لماذا ترقيم لا سقف (٣١ أغسطس ٢٠٢٦) ──────────────────────────────
  // كان هنا `take: 1000` بلا إعلان. وهذه ليست شاشة عرض بل **كتابة canonical**: مقالات
  // العميل فوق الألف كانت تبقى بعنوانٍ أساسيّ قديم يشير إلى المكان الخطأ، وهو ما يصل
  // جوجل ويُفهرَس عليه. والدالّة ترجع `attempted` فيبدو العمل مكتملاً وهو ناقص بصمت.
  // الترقيم بمؤشّر يزيل الشرط: كل صفٍّ يُعالَج مهما نما العدد.
  const BATCH = 500;
  const articles: Array<{ id: string; slug: string; canonicalUrl: string | null }> = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await db.article.findMany({
      where: { clientId, isClientSiteArticle: true },
      select: { id: true, slug: true, canonicalUrl: true },
      orderBy: { id: "asc" },
      take: BATCH,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (page.length === 0) break;
    articles.push(...page);
    if (page.length < BATCH) break;
    cursor = page[page.length - 1].id;
  }

  let updated = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const article of articles) {
    const next = `${base}/${article.slug}`;
    if (article.canonicalUrl === next) continue;

    // This used to end in `.catch(() => {})`. A row that refused the write was then
    // indistinguishable from a row that was already correct: `updated` simply did not go up,
    // and the caller went on to regenerate that article's card from the OLD address and
    // publish it. The failure has to travel back up.
    try {
      await db.article.update({
        where: { id: article.id },
        data: { canonicalUrl: next, mainEntityOfPage: next },
      });
      updated++;
    } catch (e) {
      errors.push({ id: article.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return { attempted: articles.length, updated, failed: errors.length, errors };
}
