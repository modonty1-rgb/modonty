"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getArticleEngagementCounts(id: string): Promise<{ views: number; comments: number }> {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return { views: 0, comments: 0 };
  const [views, comments] = await Promise.all([
    db.articleView.count({ where: { articleId: id } }),
    db.comment.count({ where: { articleId: id } }),
  ]);
  return { views, comments };
}

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export async function getArticleById(id: string) {
  if (!id || !OBJECT_ID_REGEX.test(id)) {
    return null;
  }
  try {
    const article = await db.article.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            logoMedia: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        category: true,
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                tags: {
                  select: {
                    tag: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        relatedFrom: {
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                tags: {
                  select: {
                    tag: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        versions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Every status the schema defines. The list predated the workflow statuses and
    // silently dropped them → Edit on an AWAITING_APPROVAL / NEEDS_REVISION article
    // returned null and crashed the form (live test 2026-07-14).
    const validStatuses: ArticleStatus[] = [
      ArticleStatus.WRITING,
      ArticleStatus.DRAFT,
      ArticleStatus.AWAITING_APPROVAL,
      ArticleStatus.NEEDS_REVISION,
      ArticleStatus.SCHEDULED,
      ArticleStatus.PUBLISHED,
      ArticleStatus.ARCHIVED,
    ];

    if (article && !validStatuses.includes(article.status)) {
      console.warn(`Article ${id} has invalid status: ${article.status}`);
      return null;
    }

    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

