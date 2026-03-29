import Link from "next/link";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { ClientCard } from "@/app/clients/components/client-card";
import { SearchSortBar } from "./SearchSortBar";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchNoQueryState } from "./SearchNoQueryState";
import type { ClientResponse, FeedPost } from "@/lib/types";
import type { ClientSortOption } from "@/app/api/helpers/client-queries";

type SearchScope = "all" | "articles" | "clients";
type ArticleSortOption = "newest" | "oldest" | "title";

interface SearchResultsProps {
  scope: SearchScope;
  sortArticles: ArticleSortOption;
  sortClients: ClientSortOption;
  posts: FeedPost[];
  clients?: ClientResponse[];
  query: string;
  resultsCountText: string;
  currentPage?: number;
  totalPages?: number;
}

function buildPaginationUrl(
  query: string,
  scope: SearchScope,
  sortArticles: ArticleSortOption,
  sortClients: ClientSortOption,
  page: number
): string {
  const q = encodeURIComponent(query);
  const type = scope !== "all" ? `&type=${scope}` : "";
  const sortArticlesParam = sortArticles !== "newest" ? `&sort_articles=${sortArticles}` : "";
  const sortClientsParam = sortClients !== "name-asc" ? `&sort_clients=${sortClients}` : "";
  const pageParam = page !== 1 ? `&page=${page}` : "";
  return `/search?q=${q}${type}${sortArticlesParam}${sortClientsParam}${pageParam}`;
}

export function SearchResults({
  scope,
  sortArticles,
  sortClients,
  posts,
  clients = [],
  query,
  resultsCountText,
  currentPage = 1,
  totalPages = 0,
}: SearchResultsProps) {
  if (!query) {
    return (
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          نتائج البحث
        </h2>
        <SearchNoQueryState />
      </section>
    );
  }

  const emptyByScope =
    (scope === "all" && posts.length === 0 && clients.length === 0) ||
    (scope === "articles" && posts.length === 0) ||
    (scope === "clients" && clients.length === 0);

  if (emptyByScope) {
    return (
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="sr-only">
          نتائج البحث
        </h2>
        <SearchEmptyState query={query} />
      </section>
    );
  }

  return (
    <section aria-labelledby="search-results-heading">
      <h2 id="search-results-heading" className="sr-only">
        نتائج البحث
      </h2>
      {resultsCountText && (
        <p className="text-sm text-muted-foreground mb-4">{resultsCountText}</p>
      )}
      <SearchSortBar
        scope={scope}
        query={query}
        sortArticles={sortArticles}
        sortClients={sortClients}
      />
      {(scope === "all" || scope === "clients") && clients.length > 0 && (
        <div className={scope === "clients" ? "" : "mb-8"}>
          <h3 className="text-lg font-semibold text-foreground mb-3">العملاء</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                id={client.id}
                name={client.name}
                slug={client.slug}
                legalName={client.legalName}
                description={client.description}
                industry={client.industry}
                logo={client.logo}
                articleCount={client.articleCount}
                viewsCount={client.viewsCount}
                subscribersCount={client.subscribersCount}
                commentsCount={client.commentsCount}
                likesCount={client.likesCount}
                dislikesCount={client.dislikesCount}
                favoritesCount={client.favoritesCount}
                subscriptionTier={client.subscriptionTier}
                isVerified={client.isVerified}
                url={client.url}
                highlightQuery={query}
              />
            ))}
          </div>
        </div>
      )}
      {(scope === "all" || scope === "articles") && posts.length > 0 && (
        <>
          {scope === "all" && clients.length > 0 && (
            <h3 className="text-lg font-semibold text-foreground mb-3">المقالات</h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                isLcp={index === 0}
                highlightQuery={query}
              />
            ))}
          </div>
          {(scope === "all" || scope === "articles") && totalPages > 1 && (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-4" aria-label="تنقل نتائج البحث">
              {currentPage > 1 && (
                <Link
                  href={buildPaginationUrl(query, scope, sortArticles, sortClients, currentPage - 1)}
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  السابق
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={buildPaginationUrl(query, scope, sortArticles, sortClients, currentPage + 1)}
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  عرض المزيد
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
