"use server";

import {
  getArticleComments,
  getArticleFaqs,
  getRelatedArticlesByArticleId,
  getRelatedArticlesByAuthor,
  getRelatedArticlesByClient,
} from "./article-data";

export async function fetchArticleFaqs(articleId: string) {
  return getArticleFaqs(articleId);
}

export async function fetchArticleComments(articleId: string, userId?: string) {
  return getArticleComments(articleId, userId);
}

export async function fetchMoreFromAuthor(authorId: string, currentArticleId: string) {
  return getRelatedArticlesByAuthor(authorId, currentArticleId);
}

export async function fetchMoreFromClient(clientId: string, currentArticleId: string) {
  return getRelatedArticlesByClient(clientId, currentArticleId);
}

export async function fetchRelatedArticlesByCategoryTags(articleId: string) {
  return getRelatedArticlesByArticleId(articleId);
}
