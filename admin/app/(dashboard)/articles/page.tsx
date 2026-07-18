import { Suspense } from "react";

import { getArticles, getClients, getCategories, getAuthors, ArticleFilters } from "./actions/articles-actions";
import { getArticleStatusCounts } from "@/app/(dashboard)/actions/article-status-counts";
import { ArticleStatus } from "@prisma/client";
import { ArticlesPageClient } from "./components/articles-page-client";
import { ArticlesHeaderWrapper } from "./components/articles-header-wrapper";
import ArticlesLoading from "./loading";

interface ArticlesContentProps {
  filters: ArticleFilters;
}

async function ArticlesContent({ filters }: ArticlesContentProps) {
  const [articles, clients, categories, authors, statusCounts] = await Promise.all([
    getArticles(filters),
    getClients(),
    getCategories(),
    getAuthors(),
    getArticleStatusCounts(),
  ]);

  return (
    <ArticlesHeaderWrapper
      clients={clients}
      categories={categories}
      authors={authors}
      statusCounts={statusCounts}
    >
      <ArticlesPageClient articles={articles} />
    </ArticlesHeaderWrapper>
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    clientId?: string;
    categoryId?: string;
    authorId?: string;
    createdFrom?: string;
    createdTo?: string;
    publishedFrom?: string;
    publishedTo?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ArticleFilters = {
    status: params.status && Object.values(ArticleStatus).includes(params.status as ArticleStatus)
      ? (params.status as ArticleStatus)
      : undefined,
    clientId: params.clientId || undefined,
    categoryId: params.categoryId || undefined,
    authorId: params.authorId || undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    publishedFrom: params.publishedFrom ? new Date(params.publishedFrom) : undefined,
    publishedTo: params.publishedTo ? new Date(params.publishedTo) : undefined,
  };

  return (
    <div className="space-y-6">
      <Suspense fallback={<ArticlesLoading />}>
        <ArticlesContent filters={filters} />
      </Suspense>
    </div>
  );
}
