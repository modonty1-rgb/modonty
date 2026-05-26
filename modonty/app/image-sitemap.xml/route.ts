/**
 * Dedicated image sitemap for Google Images discovery.
 *
 * Strategy:
 *   - Lists every PUBLISHED article alongside ALL its associated images:
 *     featuredImage + heroImage + gallery + extracted from content HTML.
 *   - Separate from main sitemap.xml — keeps main sitemap lean while
 *     surfacing every image to Google Images.
 *   - Google's policy (2026): only image:loc is required;
 *     image:caption/title/license/geo_location are deprecated.
 */
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

interface ArticleImagesRow {
  slug: string;
  featuredImage: { url: string } | null;
  content: string | null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractImagesFromHtml(html: string | null): string[] {
  if (!html) return [];
  const urls = new Set<string>();
  // Match <img src="..."> — both single and double quotes
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (url.startsWith("http")) urls.add(url);
  }
  return Array.from(urls);
}

function uniqueAbsolute(urls: Array<string | null | undefined>): string[] {
  const set = new Set<string>();
  for (const u of urls) {
    if (u && u.startsWith("http")) set.add(u);
  }
  return Array.from(set);
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: {
      slug: true,
      featuredImage: { select: { url: true } },
      content: true,
    },
  });

  const entries = (articles as ArticleImagesRow[])
    .map((a) => {
      const images = uniqueAbsolute([
        a.featuredImage?.url,
        ...extractImagesFromHtml(a.content),
      ]);
      if (images.length === 0) return null;
      const articleUrl = escapeXml(new URL(`/articles/${a.slug}`, baseUrl).href);
      const imageBlocks = images
        .map((u) => `    <image:image>\n      <image:loc>${escapeXml(u)}</image:loc>\n    </image:image>`)
        .join("\n");
      return `  <url>\n    <loc>${articleUrl}</loc>\n${imageBlocks}\n  </url>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${entries}\n` +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
