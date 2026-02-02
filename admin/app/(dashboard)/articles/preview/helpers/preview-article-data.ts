"use server";

import { db } from "@/lib/db";

export async function getPreviewArticle(id: string) {
  const article = await db.article.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true } },
          ogImageMedia: { select: { url: true } },
          url: true,
          legalName: true,
          email: true,
          phone: true,
          sameAs: true,
          seoDescription: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          image: true,
          url: true,
          jobTitle: true,
          linkedIn: true,
          twitter: true,
          facebook: true,
          sameAs: true,
          expertiseAreas: true,
          credentials: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      featuredImage: { select: { url: true, altText: true, width: true, height: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      faqs: { orderBy: { position: "asc" as const } },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              caption: true,
              width: true,
              height: true,
              filename: true,
            },
          },
        },
        orderBy: { position: "asc" as const },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              datePublished: true,
              createdAt: true,
              featuredImage: { select: { url: true, altText: true } },
              client: { select: { name: true, slug: true } },
            },
          },
        },
      },
      _count: {
        select: { likes: true, dislikes: true, favorites: true, views: true },
      },
    },
  });
  return article;
}

export async function getMoreFromAuthor(authorId: string, excludeArticleId: string) {
  return db.article.findMany({
    where: {
      authorId,
      id: { not: excludeArticleId },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      featuredImage: { select: { url: true, altText: true } },
      client: { select: { name: true, slug: true } },
    },
    orderBy: { datePublished: "desc" },
    take: 6,
  });
}

export async function getMoreFromClient(clientId: string, excludeArticleId: string) {
  return db.article.findMany({
    where: {
      clientId,
      id: { not: excludeArticleId },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      featuredImage: { select: { url: true, altText: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { datePublished: "desc" },
    take: 6,
  });
}
