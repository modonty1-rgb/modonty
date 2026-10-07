import { Prisma } from "@prisma/client";

/** شكل الاستعلام والمحوّل لتغذية الصفحة الرئيسية — لا يقرأهما غير ملفَّي الرئيسية. */
export const homeFeedSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  seoDescription: true,
  datePublished: true,
  createdAt: true,
  featured: true,
  readingTimeMinutes: true,
  client: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
  featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
  audioUrl: true,
  likesCount: true,
  commentsCount: true,
  favoritesCount: true,
  viewsCount: true,
} satisfies Prisma.ArticleSelect;
