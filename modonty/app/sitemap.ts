import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { getArticleDefaultsFromSettings } from "@/lib/seo/get-article-defaults-from-settings";

type SitemapArticle = {
  slug: string;
  datePublished: Date | null;
  dateModified: Date | null;
  featured: boolean;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

  const [articles, defaults] = await Promise.all([
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
        featured: true,
      },
      orderBy: { datePublished: "desc" },
    }),
    getArticleDefaultsFromSettings(),
  ]);

  const categories = await db.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const clients = await db.client.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const articleUrls: MetadataRoute.Sitemap = articles.map((article: SitemapArticle) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.dateModified || article.datePublished || new Date(),
    changeFrequency: (defaults.sitemapChangeFreq || "weekly") as "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never",
    priority: defaults.sitemapPriority ?? (article.featured ? 0.8 : 0.5),
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const clientUrls: MetadataRoute.Sitemap = clients.map((client) => ({
    url: `${baseUrl}/clients/${client.slug}`,
    lastModified: client.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news/subscribe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/user-agreement`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/copyright-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help/feedback`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/clients`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...staticPages,
    ...articleUrls,
    ...categoryUrls,
    ...clientUrls,
  ];
}
