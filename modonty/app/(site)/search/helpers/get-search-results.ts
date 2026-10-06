import { getArticles } from "@/lib/queries/get-articles";
import { getClientsSearch } from "./get-clients-search";
import type { ClientSortOption } from "./client-sort";
import type { ArticleResponse, ClientResponse, FeedPost } from "@/lib/types";

export type SearchScope = "all" | "articles" | "clients";
export type ArticleSortOption = "newest" | "oldest" | "title";

/**
 * What `/search` shows for a query — articles (paged, 20 a page) and partners (top 10). Moved out
 * of the page unchanged (4 Oct 2026) so the reader mobile API serves the SAME results.
 * An empty `q` returns nothing, as the page always did.
 */
export async function getSearchResults(input: {
  q: string;
  scope: SearchScope;
  sortArticles: ArticleSortOption;
  sortClients: ClientSortOption;
  page: number;
}): Promise<{ posts: FeedPost[]; clients: ClientResponse[]; total: number; totalPages: number }> {
  const { q, scope, sortArticles, sortClients, page } = input;
  const limit = 20;

  let articles: ArticleResponse[] = [];
  let pagination: { totalPages: number; total: number } | null = null;
  let clients: ClientResponse[] = [];

  if (q) {
    if (scope === "all" || scope === "articles") {
      const result = await getArticles({ search: q, limit, page, sortBy: sortArticles });
      articles = result.articles;
      pagination = result.pagination;
    }
    if (scope === "all" || scope === "clients") {
      clients = await getClientsSearch(q, 10, sortClients);
    }
  }

  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;

  const posts: FeedPost[] = articles.map((article: ArticleResponse) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt ?? undefined,
    image: article.image,
    imageBlur: article.featuredImage?.blurDataURL ?? undefined,
    slug: article.slug,
    publishedAt: new Date(article.publishedAt),
    clientName: article.client.name,
    clientSlug: article.client.slug,
    clientId: article.client.id,
    clientLogo: article.client.logo,
    readingTimeMinutes: article.readingTimeMinutes,
    author: {
      id: article.author.id,
      // اسم الكاتب من صفّه. كان الاحتياط يكتب اسم الماركة مكان كاتبٍ بلا اسم — فيظهر
      // للقارئ أن الماركة كتبت المقال، وهو ادّعاءٌ عن المؤلِّف لا احتياط عرض.
      name: article.author.name || "",
      title: "",
      company: article.client.name,
      avatar: article.author.image || "",
    },
    likes: article.interactions.likes,
    dislikes: article.interactions.dislikes,
    comments: article.interactions.comments,
    favorites: article.interactions.favorites,
    views: article.interactions.views,
    status: "published" as const,
  }));

  return { posts, clients, total, totalPages };
}
