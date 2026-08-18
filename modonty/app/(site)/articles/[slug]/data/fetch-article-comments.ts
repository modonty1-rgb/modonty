"use server";

import { getArticleComments } from "./get-article-comments";

/**
 * The client-callable door to the comments, so they load after the article has painted instead of
 * blocking it. Thin on purpose: the query lives in `get-article-comments.ts` and is called
 * directly by anything already running on the server.
 */
export async function fetchArticleComments(articleId: string) {
  return getArticleComments(articleId);
}
