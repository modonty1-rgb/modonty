import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { ArticleStatus, CommentStatus } from "@prisma/client";

export async function getArticleSlugsForStaticParams() {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");
  return db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    select: { slug: true },
    take: 100,
  });
}

/** Minimal article data for chat/RAG. */
export async function getArticleForChat(slug: string) {
  return db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      OR: [
        { datePublished: null },
        { datePublished: { lte: new Date() } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
      client: { select: { id: true, name: true, slug: true } },
    },
  });
}

/** Articles from other categories for out-of-scope redirect. */
export async function getArticlesForOutOfScopeSearch(
  excludeCategoryId: string | null,
  limit: number
) {
  const where: Record<string, unknown> = {
    status: ArticleStatus.PUBLISHED,
    OR: [
      { datePublished: null },
      { datePublished: { lte: new Date() } },
    ],
  };
  if (excludeCategoryId) {
    where.categoryId = { not: excludeCategoryId };
  }

  return db.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      client: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  status: true,
  parentId: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  _count: {
    select: {
      likes: true,
      dislikes: true,
    },
  },
} as const;

export async function getArticleBySlug(slug: string, userId?: string) {
  const isDev = process.env.NODE_ENV === "development";

  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    include: {
      comments: {
        where: isDev ? {} : { status: CommentStatus.APPROVED },
        orderBy: { createdAt: "asc" as const },
        select: commentSelect,
      },
      ...(userId && {
        likes: { where: { userId }, take: 1, select: { id: true } },
        dislikes: { where: { userId }, take: 1, select: { id: true } },
        favorites: { where: { userId }, take: 1, select: { id: true } },
      }),
      client: {
        include: {
          logoMedia: {
            select: {
              url: true,
            },
          },
          ogImageMedia: {
            select: {
              url: true,
            },
          },
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
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      featuredImage: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      faqs: {
        where: {
          AND: [{ answer: { not: null } }, { answer: { not: "" } }],
        },
        orderBy: {
          position: "asc",
        },
      },
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
        orderBy: {
          position: "asc",
        },
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
              featuredImage: {
                select: {
                  url: true,
                  altText: true,
                },
              },
              client: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  dislikes: true,
                  comments: true,
                  faqs: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
        },
      },
    },
  });

  if (!article) return null;

  const flatComments = flattenCommentsWithContext(article.comments ?? []);
  const userLiked = (article.likes?.length ?? 0) > 0;
  const userDisliked = (article.dislikes?.length ?? 0) > 0;
  const userFavorited = (article.favorites?.length ?? 0) > 0;

  const { likes, dislikes, favorites, ...rest } = article;
  const faqsWithAnswer = (rest.faqs ?? []).filter(
    (f): f is typeof f & { answer: string } => typeof f.answer === "string" && f.answer.length > 0
  );
  return {
    ...rest,
    faqs: faqsWithAnswer,
    comments: flatComments,
    userLiked,
    userDisliked,
    userFavorited,
  };
}

/** Minimal article for initial load: no comments or faqs arrays; use _count for section headers. */
export async function getArticleBySlugMinimal(slug: string, userId?: string) {
  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    include: {
      ...(userId && {
        likes: { where: { userId }, take: 1, select: { id: true } },
        dislikes: { where: { userId }, take: 1, select: { id: true } },
        favorites: { where: { userId }, take: 1, select: { id: true } },
      }),
      client: {
        include: {
          logoMedia: { select: { url: true } },
          ogImageMedia: { select: { url: true } },
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
      featuredImage: {
        select: { url: true, altText: true, width: true, height: true },
      },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
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
              _count: { select: { likes: true, dislikes: true, comments: true, faqs: true } },
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
          favorites: true,
          comments: true,
          views: true,
          faqs: true,
        },
      },
    },
  });

  if (!article) return null;

  const userLiked = (article.likes?.length ?? 0) > 0;
  const userDisliked = (article.dislikes?.length ?? 0) > 0;
  const userFavorited = (article.favorites?.length ?? 0) > 0;
  const { likes, dislikes, favorites, ...rest } = article;

  return {
    ...rest,
    faqs: [],
    comments: [],
    userLiked,
    userDisliked,
    userFavorited,
  };
}

function flattenCommentsWithContext(comments: any[]): any[] {
  const commentMap = new Map();

  comments.forEach(comment => {
    commentMap.set(comment.id, comment);
  });

  const flatComments = comments.map(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      return {
        ...comment,
        replyingTo: parent ? {
          id: parent.id,
          authorName: parent.author?.name || "ضيف"
        } : null,
        isOrphaned: !parent
      };
    }
    return { ...comment, replyingTo: null };
  });

  return flatComments.sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getRelatedArticlesByAuthor(authorId: string, currentArticleId: string) {
  const articles = await db.article.findMany({
    where: {
      authorId,
      id: { not: currentArticleId },
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      featuredImage: {
        select: {
          url: true,
          altText: true,
        },
      },
      client: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
          comments: true,
          faqs: true,
        },
      },
    },
    orderBy: {
      datePublished: "desc",
    },
    take: 6,
  });

  return articles.map(({ _count, ...a }) => ({
    ...a,
    likesCount: _count.likes,
    dislikesCount: _count.dislikes,
    commentsCount: _count.comments,
    questionsCount: _count.faqs,
  }));
}

export async function getRelatedArticlesByClient(clientId: string, currentArticleId: string) {
  const articles = await db.article.findMany({
    where: {
      clientId,
      id: { not: currentArticleId },
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      datePublished: true,
      createdAt: true,
      featuredImage: {
        select: {
          url: true,
          altText: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
          comments: true,
          faqs: true,
        },
      },
    },
    orderBy: {
      datePublished: "desc",
    },
    take: 6,
  });

  return articles.map(({ _count, ...a }) => ({
    ...a,
    likesCount: _count.likes,
    dislikesCount: _count.dislikes,
    commentsCount: _count.comments,
    questionsCount: _count.faqs,
  }));
}

const relatedArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  datePublished: true,
  createdAt: true,
  featuredImage: {
    select: {
      url: true,
      altText: true,
    },
  },
  client: {
    select: {
      name: true,
      slug: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      views: true,
      likes: true,
      dislikes: true,
      comments: true,
      faqs: true,
    },
  },
};

type RelatedArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  createdAt: Date;
  featuredImage?: { url: string; altText: string | null } | null;
  client: { name: string; slug: string };
  category?: { name: string; slug: string } | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  questionsCount: number;
};

export async function getRelatedArticlesByCategoryTags(
  currentArticleId: string,
  categoryId: string | null,
  tagIds: string[],
  limit: number
): Promise<RelatedArticleItem[]> {
  const whereConditions = {
    id: { not: currentArticleId },
    status: ArticleStatus.PUBLISHED,
    OR: [
      { datePublished: null },
      { datePublished: { lte: new Date() } },
    ],
  };

  const mapWithCounts = (rows: Array<{ _count: { likes: number; dislikes: number; comments: number; faqs: number }; [k: string]: unknown }>) =>
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
      where: {
        ...whereConditions,
        tags: { some: { tagId: { in: tagIds } } },
      },
      select: relatedArticleSelect,
      orderBy: [
        { datePublished: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });
    relatedArticles = mapWithCounts(byTags);
  }

  if (relatedArticles.length < limit && categoryId) {
    const byCategory = await db.article.findMany({
      where: {
        ...whereConditions,
        categoryId,
        id: {
          not: currentArticleId,
          notIn: relatedArticles.map((a) => a.id as string),
        },
      },
      select: relatedArticleSelect,
      orderBy: [
        { datePublished: "desc" },
        { createdAt: "desc" },
      ],
      take: limit - relatedArticles.length,
    });
    relatedArticles = [...relatedArticles, ...mapWithCounts(byCategory)];
  }

  if (relatedArticles.length < limit) {
    const recent = await db.article.findMany({
      where: {
        ...whereConditions,
        id: {
          not: currentArticleId,
          notIn: relatedArticles.map((a) => a.id as string),
        },
      },
      select: relatedArticleSelect,
      orderBy: [
        { datePublished: "desc" },
        { createdAt: "desc" },
      ],
      take: limit - relatedArticles.length,
    });
    relatedArticles = [...relatedArticles, ...mapWithCounts(recent)];
  }

  return relatedArticles;
}

/** Related articles by category/tags for lazy-load; fetches article context by id. */
export async function getRelatedArticlesByArticleId(articleId: string): Promise<RelatedArticleItem[]> {
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: {
      categoryId: true,
      tags: { select: { tagId: true } },
    },
  });
  if (!article) return [];
  const tagIds = article.tags.map((t) => t.tagId);
  return getRelatedArticlesByCategoryTags(articleId, article.categoryId, tagIds, 3);
}

/** Comments for an article (same shape as article.comments). For lazy-load. */
export async function getArticleComments(articleId: string, userId?: string) {
  const isDev = process.env.NODE_ENV === "development";
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: {
      comments: {
        where: isDev ? {} : { status: CommentStatus.APPROVED },
        orderBy: { createdAt: "asc" as const },
        select: commentSelect,
      },
    },
  });
  if (!article) return null;
  return flattenCommentsWithContext(article.comments ?? []);
}

/** Published FAQs for an article (same shape as article.faqs). For lazy-load. */
export async function getArticleFaqs(articleId: string) {
  const faqs = await db.articleFAQ.findMany({
    where: {
      articleId,
      AND: [{ answer: { not: null } }, { answer: { not: "" } }],
    },
    orderBy: { position: "asc" },
    select: {
      id: true,
      question: true,
      answer: true,
      position: true,
    },
  });
  return faqs.filter(
    (f): f is typeof f & { answer: string } => typeof f.answer === "string" && f.answer.length > 0
  );
}
