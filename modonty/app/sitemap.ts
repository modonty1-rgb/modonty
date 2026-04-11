import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

type SitemapArticle = {
  slug: string;
  datePublished: Date | null;
  dateModified: Date | null;
  featuredImage: { url: string } | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

  const [articles, categories, clients, authors, tags] = await Promise.all([
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
        featuredImage: { select: { url: true } },
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
    db.tag.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  // Google ignores priority and changeFrequency — omit both per official docs
  // images[] → Google Image Search indexing (Next.js official: MetadataRoute.Sitemap images property)
  const articleUrls: MetadataRoute.Sitemap = articles.map((article: SitemapArticle) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.dateModified || article.datePublished || new Date(),
    ...(article.featuredImage?.url && { images: [article.featuredImage.url] }),
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

  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: tag.updatedAt,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/news`, lastModified: new Date() },
    { url: `${baseUrl}/legal/user-agreement`, lastModified: new Date() },
    { url: `${baseUrl}/legal/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/cookie-policy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/copyright-policy`, lastModified: new Date() },
    { url: `${baseUrl}/help`, lastModified: new Date() },
    { url: `${baseUrl}/help/feedback`, lastModified: new Date() },
    { url: `${baseUrl}/help/faq`, lastModified: new Date() },
    // /news/subscribe is a form page — excluded from sitemap intentionally
  ];

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/categories`, lastModified: new Date() },
    { url: `${baseUrl}/clients`, lastModified: new Date() },
    { url: `${baseUrl}/tags`, lastModified: new Date() },
    ...authorUrls,
    ...staticPages,
    ...articleUrls,
    ...categoryUrls,
    ...clientUrls,
    ...tagUrls,
  ];
}
