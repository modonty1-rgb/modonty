"use server";

import { getMoreArticles } from "@/app/(homepage)/data/get-more-articles";

import type { MoreArticlesResult } from "@/app/(homepage)/data/get-more-articles";

export type LoadMoreArticlesResult = MoreArticlesResult;

// Thin door for the web. The mobile endpoint will call getMoreArticles directly.
export async function loadMoreArticles(
  page: number,
  categorySlug?: string,
  clientSlug?: string
): Promise<LoadMoreArticlesResult> {
  return getMoreArticles(page, categorySlug, clientSlug);
}
