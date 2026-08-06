"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import {
  describeArticleLoadProblem,
  describeInvalidStatus,
  type ArticleLoadProblem,
} from "./article-load-problem";

export async function getArticleEngagementCounts(id: string): Promise<{ views: number; comments: number }> {
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return { views: 0, comments: 0 };
  const [views, comments] = await Promise.all([
    db.articleView.count({ where: { articleId: id } }),
    db.comment.count({ where: { articleId: id } }),
  ]);
  return { views, comments };
}

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Every status the schema defines. The list predated the workflow statuses and silently
// dropped them → Edit on an AWAITING_APPROVAL / NEEDS_REVISION article returned null and
// crashed the form (live test 2026-07-14).
const VALID_STATUSES: ArticleStatus[] = [
  ArticleStatus.WRITING,
  ArticleStatus.DRAFT,
  ArticleStatus.AWAITING_APPROVAL,
  ArticleStatus.NEEDS_REVISION,
  ArticleStatus.SCHEDULED,
  ArticleStatus.PUBLISHED,
  ArticleStatus.ARCHIVED,
];

/**
 * Read one article, and when that fails say WHY.
 *
 * `problem: null` means the article genuinely is not there (bad id, deleted) — the caller
 * should bounce. A non-null `problem` means the row exists but its data is broken, which
 * is a different situation entirely and must never be shown as "not found": the editor
 * needs to see it so they can report it. Both used to collapse into the same silent
 * redirect back to the list.
 */
export async function loadArticleOrProblem(id: string): Promise<
  | { ok: true; article: NonNullable<Awaited<ReturnType<typeof findArticle>>> }
  | { ok: false; problem: ArticleLoadProblem | null }
> {
  if (!id || !OBJECT_ID_REGEX.test(id)) {
    return { ok: false, problem: null };
  }

  let article: Awaited<ReturnType<typeof findArticle>>;
  try {
    article = await findArticle(id);
  } catch (error) {
    console.error("Error fetching article:", error);
    return { ok: false, problem: describeArticleLoadProblem(error) };
  }

  if (!article) {
    return { ok: false, problem: null };
  }

  if (!VALID_STATUSES.includes(article.status)) {
    console.warn(`Article ${id} has invalid status: ${article.status}`);
    return { ok: false, problem: describeInvalidStatus(article.status) };
  }

  return { ok: true, article };
}

/**
 * Unchanged contract for the callers that only need the row or nothing — the breadcrumb
 * and the form transformer. Anything that renders a page should use
 * `loadArticleOrProblem` instead so a broken row is reported rather than swallowed.
 */
export async function getArticleById(id: string) {
  const result = await loadArticleOrProblem(id);
  return result.ok ? result.article : null;
}

function findArticle(id: string) {
  return db.article.findUnique({
    where: { id },
    include: {
      client: {
          include: {
            logoMedia: {
              select: {
                id: true,
                url: true,
                bunnyUrl: true,
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
            bunnyUrl: true,
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
                bunnyUrl: true,
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
}

