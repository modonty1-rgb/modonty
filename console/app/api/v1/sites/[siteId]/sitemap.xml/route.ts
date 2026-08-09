import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import { jsonError } from "../../../_lib/respond";
import { resolveSite } from "../../../_lib/resolve-site";

/**
 * GET /api/v1/sites/{siteId}/sitemap.xml — the client's article sitemap, hosted by us.
 *
 * The URLs inside point at the CLIENT's domain while the file lives on ours. Google
 * documents exactly this: "unless you submit your sitemap through Search Console, a
 * sitemap affects only descendants of the parent directory" — and "adding a line like
 * `Sitemap: https://example.com/my_sitemap.xml` anywhere in robots.txt also eliminates
 * the parent directory constraint", with central hosting for many sites called out by
 * name. So the whole integration costs the client ONE line in their robots.txt, and
 * costs us no per-client file, no upload, and no sync when an article changes.
 *
 * That single line is the client's only obligation. Everything else — which articles
 * exist, when each changed, which one leads — is answered from here, live.
 */
export const dynamic = "force-dynamic";

/** XML has five characters that cannot appear raw in a document. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Arabic slugs are the norm here, and a raw Arabic character in a `<loc>` is not a legal
 * URL. `encodeURI` percent-encodes it while leaving the separators alone.
 */
function articleLoc(base: string, slug: string): string {
  return escapeXml(encodeURI(`${base}/${slug}`));
}

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const resolved = await resolveSite(siteId);
  if (!resolved.ok) return jsonError(resolved.status, resolved.error);

  // No address means no URL can be built. An empty sitemap is a valid document and a
  // truthful one — it says "nothing to crawl yet", which beats a 500 in a crawler log.
  const base = (resolved.site.articlesBaseUrl ?? "").replace(/\/+$/, "");

  const articles = base
    ? await db.article.findMany({
        where: {
          clientId: resolved.site.id,
          isClientSiteArticle: true,
          status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
        },
        select: { slug: true, updatedAt: true, datePublished: true, isMainArticle: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      })
    : [];

  const newest = articles.reduce<Date | null>(
    (latest, a) => (!latest || a.updatedAt > latest ? a.updatedAt : latest),
    null,
  );

  const entries: string[] = [];

  // The list page leads: it is the hub every article links back to, and the one URL on
  // their domain that we know exists because they gave us its address.
  if (base) {
    entries.push(
      `  <url>\n    <loc>${escapeXml(encodeURI(base))}</loc>\n` +
        `    <lastmod>${(newest ?? new Date()).toISOString()}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    );
  }

  for (const article of articles) {
    entries.push(
      `  <url>\n    <loc>${articleLoc(base, article.slug)}</loc>\n` +
        `    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>${article.isMainArticle ? "0.9" : "0.7"}</priority>\n  </url>`,
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries.join("\n")}\n` +
    `</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // An hour matches the pull cache on their site: the two never disagree by more
      // than one cycle, so a crawler is never sent to a page the site cannot render yet.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
