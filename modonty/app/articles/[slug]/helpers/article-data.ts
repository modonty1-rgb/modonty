import { db } from "@/lib/db";
import { ArticleStatus, CommentStatus } from "@prisma/client";

export async function getArticleBySlug(slug: string) {
  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    include: {
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

  return article;
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

export async function getArticleComments(articleId: string) {
  const isDev = process.env.NODE_ENV === 'development';
  
  const allComments = await db.comment.findMany({
    where: {
      articleId,
      ...(isDev ? {} : { status: CommentStatus.APPROVED }),
    },
    select: {
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
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  
  return flattenCommentsWithContext(allComments);
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
    },
    orderBy: {
      datePublished: "desc",
    },
    take: 6,
  });

  return articles;
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
    },
    orderBy: {
      datePublished: "desc",
    },
    take: 6,
  });

  return articles;
}

export async function getUserArticleInteractions(articleId: string, userId: string) {
  const [like, dislike, favorite] = await Promise.all([
    db.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    }),
    db.articleDislike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    }),
    db.articleFavorite.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    }),
  ]);

  return {
    liked: !!like,
    disliked: !!dislike,
    favorited: !!favorite,
  };
}
