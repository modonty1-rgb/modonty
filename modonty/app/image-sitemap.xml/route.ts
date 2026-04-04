import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

  const articles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    select: {
      slug: true,
      dateModified: true,
      featuredImage: {
        select: {
          url: true,
          altText: true,
          title: true,
          license: true,
        },
      },
      gallery: {
        select: {
          media: {
            select: {
              url: true,
              altText: true,
              title: true,
              license: true,
            },
          },
          altText: true,
          caption: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { datePublished: "desc" },
    take: 5000,
  });

  const escapeXml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const article of articles) {
    const images: Array<{ url: string; title?: string; caption?: string; license?: string }> = [];

    if (article.featuredImage?.url) {
      images.push({
        url: article.featuredImage.url,
        title: article.featuredImage.title || article.featuredImage.altText || undefined,
        caption: article.featuredImage.altText || undefined,
        license: article.featuredImage.license || undefined,
      });
    }

    if (article.gallery) {
      for (const item of article.gallery) {
        if (item.media?.url) {
          images.push({
            url: item.media.url,
            title: item.media.title || item.altText || item.media.altText || undefined,
            caption: item.caption || item.media.altText || undefined,
            license: item.media.license || undefined,
          });
        }
      }
    }

    if (images.length === 0) continue;

    xml += `  <url>
    <loc>${escapeXml(`${baseUrl}/articles/${article.slug}`)}</loc>
`;

    for (const img of images) {
      xml += `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
`;
      if (img.title) {
        xml += `      <image:title>${escapeXml(img.title)}</image:title>
`;
      }
      if (img.caption) {
        xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>
`;
      }
      if (img.license) {
        xml += `      <image:license>${escapeXml(img.license)}</image:license>
`;
      }
      xml += `    </image:image>
`;
    }

    xml += `  </url>
`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
