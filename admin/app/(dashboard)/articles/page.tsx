import { getArticles, getArticlesStats, getClients, getCategories, getAuthors, ArticleFilters } from "./actions/articles-actions";
import { ArticlesStats } from "./components/articles-stats";
import { ArticleStatus } from "@prisma/client";
import { ArticlesPageClient } from "./components/articles-page-client";
import { ArticlesHeaderWrapper } from "./components/articles-header-wrapper";

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
  
  const [articles, stats, clients, categories, authors] = await Promise.all([
    getArticles(filters),
    getArticlesStats(),
    getClients(),
    getCategories(),
    getAuthors(),
  ]);

  const getStatusDescription = () => {
    if (filters.status === "DRAFT") return "Viewing draft articles";
    if (filters.status === "PUBLISHED") return "Viewing published articles";
    if (filters.status === "ARCHIVED") return "Viewing archived articles";
    return "Manage all articles in the system";
  };

  return (
    <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ArticlesHeaderWrapper
        articleCount={articles.length}
        description={getStatusDescription()}
        clients={clients}
        categories={categories}
        authors={authors}
      >
        <ArticlesStats stats={stats} />
        <ArticlesPageClient articles={articles} />
      </ArticlesHeaderWrapper>
    </div>
  );
}
