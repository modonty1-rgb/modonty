import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getSearchResults } from "./helpers/get-search-results";
import { normalizeScope } from "./helpers/normalize-scope";
import { normalizeArticleSort } from "./helpers/normalize-article-sort";
import { normalizeClientSort } from "./helpers/normalize-client-sort";
import { formatResultsCount } from "./helpers/format-results-count";
import { formatClientResultsCount } from "./helpers/format-client-results-count";
import { generateMetadataFromSEO } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";

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

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const scope = normalizeScope(params.type);
  const typeParam = scope !== "all" ? `&type=${scope}` : "";
  return generateMetadataFromSEO({
    title: q ? `بحث: ${q.slice(0, 43)}` : "بحث",
    description: q
      ? messages.seo.search.queryDescription.replace("{q}", q)
      : messages.seo.search.description,
    url: q ? `/search?q=${encodeURIComponent(q)}${typeParam}` : "/search",
    robots: "noindex,nofollow",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q?.trim() : "";
  const scope = normalizeScope(params.type);
  const sortArticles = normalizeArticleSort(params.sort_articles);
  const sortClients = normalizeClientSort(params.sort_clients);
  const page = Math.max(1, parseInt(String(params.page), 10) || 1);
  // Same results the reader mobile API serves (helpers/get-search-results.ts).
  const { posts, clients, total, totalPages } = await getSearchResults({ q, scope, sortArticles, sortClients, page });

  const resultsCountText =
    scope === "clients"
      ? formatClientResultsCount(clients.length)
      : formatResultsCount(total > 0 ? total : posts.length);

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
