"use client";

import { ArticleTable } from "./article-table";
import type { Article as ArticleViewType } from "../[id]/helpers/article-view-types";
import { useSearchContext } from "./articles-header-wrapper";

type Article = ArticleViewType & {
  views: number;
};

interface ArticlesPageClientProps {
  articles: Article[];
}

export function ArticlesPageClient({ articles }: ArticlesPageClientProps) {
  const { search } = useSearchContext();

  return <ArticleTable articles={articles} search={search} />;
}
