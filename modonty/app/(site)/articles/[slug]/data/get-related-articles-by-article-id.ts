import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

const relatedArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  featuredImage: {
    select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true },
  },
  client: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  _count: { select: { views: true, likes: true, dislikes: true, comments: true, faqs: true } },
};

type RelatedArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  client: { name: string; slug: string };
  category?: { name: string; slug: string } | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  questionsCount: number;
};

/**
 * Three widening rings — same tags, then same category, then simply recent — each one topping up
 * what the ring before it could not fill. Private: nothing outside this file asks for the rings
 * directly, they are how `getRelatedArticlesByArticleId` answers.
 */
async function getRelatedArticlesByCategoryTags(
  currentArticleId: string,
  categoryId: string | null,
  tagIds: string[],
  limit: number
): Promise<RelatedArticleItem[]> {
  const whereConditions = {
    id: { not: currentArticleId },
    status: ArticleStatus.PUBLISHED,
    OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
  };

  const mapWithCounts = (
    rows: Array<{ _count: { likes: number; dislikes: number; comments: number; faqs: number }; [k: string]: unknown }>
  ) =>
    rows.map(({ _count, ...a }) => ({
      ...a,
      likesCount: _count.likes,
      dislikesCount: _count.dislikes,
      commentsCount: _count.comments,
      questionsCount: _count.faqs,
    })) as RelatedArticleItem[];

  let relatedArticles: RelatedArticleItem[] = [];

  if (tagIds.length > 0) {
    const byTags = await db.article.findMany({
      where: { ...whereConditions, tags: { some: { tagId: { in: tagIds } } } },
      select: relatedArticleSelect,
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    relatedArticles = mapWithCounts(byTags);
  }

  if (relatedArticles.length < limit && categoryId) {
    const byCategory = await db.article.findMany({
      where: {
        ...whereConditions,
        categoryId,
        id: { not: currentArticleId, notIn: relatedArticles.map((a) => a.id) },
      },
      select: relatedArticleSelect,
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: limit - relatedArticles.length,
    });
    relatedArticles = [...relatedArticles, ...mapWithCounts(byCategory)];
  }

  if (relatedArticles.length < limit) {
    const recent = await db.article.findMany({
      where: {
        ...whereConditions,
        id: { not: currentArticleId, notIn: relatedArticles.map((a) => a.id) },
      },
      select: relatedArticleSelect,
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: limit - relatedArticles.length,
    });
    relatedArticles = [...relatedArticles, ...mapWithCounts(recent)];
  }

  return relatedArticles;
}

/** «مقالات ذات صلة» — reads the article's own category and tags, then fills the three rings. */
export async function getRelatedArticlesByArticleId(articleId: string): Promise<RelatedArticleItem[]> {
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: { categoryId: true, tags: { select: { tagId: true } } },
  });
  if (!article) return [];
  const tagIds = article.tags.map((t) => t.tagId);
  return getRelatedArticlesByCategoryTags(articleId, article.categoryId, tagIds, 3);
}
