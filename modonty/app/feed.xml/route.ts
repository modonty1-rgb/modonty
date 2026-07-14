/**
 * RSS 2.0 feed — the distribution channel the site never had (GEO audit 2026-07-13,
 * ن١٤: /feed.xml was 404). Answer engines, aggregators and automation all consume
 * feeds to discover new content the moment it publishes — this complements the
 * sitemap (Google) and IndexNow (Bing/Copilot) as the third notification channel.
 *
 * RSS 2.0 over Atom: universally parsed, and the spec's required channel fields are
 * title/link/description only. Self link via atom:link (RSS best-practice profile).
 */
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { SITE_URL, BRAND_AR } from "@/lib/brand";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await db.article.findMany({
    // Platform-wide convention (sitemap + every query helper): scheduled articles
    // (future datePublished) stay hidden until their moment.
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      client: { select: { name: true } },
    },
    orderBy: { datePublished: "desc" },
    take: 50,
  });

  const lastBuildDate = (articles[0]?.datePublished ?? new Date()).toUTCString();

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/articles/${encodeURIComponent(a.slug)}`;
      return [
        "    <item>",
        `      <title>${escapeXml(a.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        ...(a.datePublished ? [`      <pubDate>${a.datePublished.toUTCString()}</pubDate>`] : []),
        ...(a.excerpt ? [`      <description>${escapeXml(a.excerpt)}</description>`] : []),
        ...(a.client?.name ? [`      <category>${escapeXml(a.client.name)}</category>`] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(BRAND_AR)}</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>${escapeXml("منصة محتوى عربية ودليل أعمال — مقالات موثوقة لشركاء موثوقين في السعودية ومصر")}</description>\n` +
    `    <language>ar</language>\n` +
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n` +
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
    `${items}\n` +
    `  </channel>\n` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Same caching contract as image-sitemap/llms: fresh within the hour.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
