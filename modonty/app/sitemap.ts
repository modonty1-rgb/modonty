import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

type SitemapArticle = {
  slug: string;
  datePublished: Date | null;
  dateModified: Date | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

  const [articles, categories, clients, authors] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { datePublished: null },
          { datePublished: { lte: new Date() } },
        ],
      },
      select: {
        slug: true,
        datePublished: true,
        dateModified: true,
      },
      orderBy: { datePublished: "desc" },
    }),
    db.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    db.client.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    db.author.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  // Google ignores priority and changeFrequency — omit both per official docs
  const articleUrls: MetadataRoute.Sitemap = articles.map((article: SitemapArticle) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.dateModified || article.datePublished || new Date(),
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
  }));

  const clientUrls: MetadataRoute.Sitemap = clients.map((client) => ({
    url: `${baseUrl}/clients/${client.slug}`,
    lastModified: client.updatedAt,
  }));

  const authorUrls: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: author.updatedAt,
  }));

  // TODO: Add tag archive pages (/tags/[slug]) to sitemap once the route is created.
  // Tags exist in DB but have no public page yet — needed for search engine discoverability.

  // TODO: Create a dedicated image sitemap (app/image-sitemap.xml/route.ts) for article featured images.
  // This improves discoverability in Google Image Search.

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/subscribe`, lastModified: new Date() },
    { url: `${baseUrl}/news`, lastModified: new Date() },
    { url: `${baseUrl}/news/subscribe`, lastModified: new Date() },
    { url: `${baseUrl}/legal/user-agreement`, lastModified: new Date() },
    { url: `${baseUrl}/legal/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/cookie-policy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/copyright-policy`, lastModified: new Date() },
    { url: `${baseUrl}/help`, lastModified: new Date() },
    { url: `${baseUrl}/help/feedback`, lastModified: new Date() },
    { url: `${baseUrl}/help/faq`, lastModified: new Date() },
  ];

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/categories`, lastModified: new Date() },
    { url: `${baseUrl}/clients`, lastModified: new Date() },
    ...authorUrls,
    ...staticPages,
    ...articleUrls,
    ...categoryUrls,
    ...clientUrls,
  ];
}
