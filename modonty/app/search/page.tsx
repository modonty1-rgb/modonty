import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getArticles } from "@/app/api/helpers/article-queries";
import { getClientsSearch } from "@/app/api/helpers/client-queries";
import type { ClientSortOption } from "@/app/api/helpers/client-queries";
import type { ArticleResponse, ClientResponse, FeedPost } from "@/lib/types";
import { generateMetadataFromSEO } from "@/lib/seo";

const SearchSection = dynamic(
  () => import("./components/SearchSection").then((m) => ({ default: m.SearchSection })),
  { ssr: true }
);

const SearchResults = dynamic(
  () => import("./components/SearchResults").then((m) => ({ default: m.SearchResults })),
  { ssr: true }
);

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; type?: string; sort_articles?: string; sort_clients?: string }>;
}

type SearchScope = "all" | "articles" | "clients";

function normalizeScope(type: unknown): SearchScope {
  return type === "clients" ? "clients" : type === "articles" ? "articles" : "all";
}

type ArticleSortOption = "newest" | "oldest" | "title";

function normalizeArticleSort(s: unknown): ArticleSortOption {
  return s === "oldest" || s === "title" ? s : "newest";
}

const CLIENT_SORT_OPTIONS: ClientSortOption[] = [
  "name-asc",
  "name-desc",
  "articles-desc",
  "articles-asc",
  "newest",
  "oldest",
];

function normalizeClientSort(s: unknown): ClientSortOption {
  return typeof s === "string" && CLIENT_SORT_OPTIONS.includes(s as ClientSortOption)
    ? (s as ClientSortOption)
    : "name-asc";
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const scope = normalizeScope(params.type);
  const typeParam = scope !== "all" ? `&type=${scope}` : "";
  return generateMetadataFromSEO({
    title: q ? `بحث: ${q.slice(0, 43)}` : "بحث",
    description: q
      ? `نتائج البحث عن "${q}" في مقالات وعملاء مودونتي`
      : "ابحث في مقالات وعملاء مدونة مودونتي",
    url: q ? `/search?q=${encodeURIComponent(q)}${typeParam}` : "/search",
    robots: "noindex,nofollow",
  });
}

function formatResultsCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "تم العثور على مقال واحد";
  if (count === 2) return "تم العثور على مقالين";
  if (count <= 10) return `تم العثور على ${count} مقالات`;
  return `تم العثور على ${count} مقال`;
}

function formatClientResultsCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "تم العثور على عميل واحد";
  if (count === 2) return "تم العثور على عميلين";
  if (count <= 10) return `تم العثور على ${count} عملاء`;
  return `تم العثور على ${count} عميل`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q?.trim() : "";
  const scope = normalizeScope(params.type);
  const sortArticles = normalizeArticleSort(params.sort_articles);
  const sortClients = normalizeClientSort(params.sort_clients);
  const page = Math.max(1, parseInt(String(params.page), 10) || 1);
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
    content: article.excerpt || "",
    excerpt: article.excerpt ?? undefined,
    image: article.image,
    slug: article.slug,
    publishedAt: new Date(article.publishedAt),
    clientName: article.client.name,
    clientSlug: article.client.slug,
    clientId: article.client.id,
    clientLogo: article.client.logo,
    readingTimeMinutes: article.readingTimeMinutes,
    author: {
      id: article.author.id,
      name: article.author.name || "Modonty",
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

  const resultsCountText =
    scope === "clients"
      ? formatClientResultsCount(clients.length)
      : formatResultsCount(total > 0 ? total : articles.length);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "بحث" },
        ]}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-8 flex-1" dir="rtl">
        <section aria-labelledby="search-heading" className="space-y-6">
          <h1 id="search-heading" className="sr-only">
            بحث المقالات
          </h1>
          <SearchSection defaultQuery={q} defaultScope={scope}>
            <SearchResults
              scope={scope}
              sortArticles={sortArticles}
              sortClients={sortClients}
              posts={posts}
              clients={clients}
              query={q}
              resultsCountText={resultsCountText}
              currentPage={page}
              totalPages={totalPages}
            />
          </SearchSection>
        </section>
      </div>
      </div>
    </>
  );
}
