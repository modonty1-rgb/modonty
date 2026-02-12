import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse, FeedPost } from "@/lib/types";
import { generateMetadataFromSEO } from "@/lib/seo";

const SearchInput = dynamic(
  () => import("./components/SearchInput").then((m) => ({ default: m.SearchInput })),
  { ssr: true }
);

const SearchResults = dynamic(
  () => import("./components/SearchResults").then((m) => ({ default: m.SearchResults })),
  { ssr: true }
);

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return generateMetadataFromSEO({
    title: q ? `بحث: ${q}` : "بحث",
    description: q
      ? `نتائج البحث عن "${q}" في مقالات مودونتي`
      : "ابحث في مقالات مدونة مودونتي",
    url: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
  });
}

function formatResultsCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "تم العثور على مقال واحد";
  if (count === 2) return "تم العثور على مقالين";
  if (count <= 10) return `تم العثور على ${count} مقالات`;
  return `تم العثور على ${count} مقال`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q?.trim() : "";

  const { articles } = q
    ? await getArticles({ search: q, limit: 20 })
    : { articles: [] };

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

  const resultsCountText = formatResultsCount(articles.length);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "بحث" },
        ]}
      />
      <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1" dir="rtl">
        <section aria-labelledby="search-heading" className="space-y-6">
          <h1 id="search-heading" className="sr-only">
            بحث المقالات
          </h1>
          <SearchInput defaultValue={q} />
          <SearchResults
            posts={posts}
            query={q}
            resultsCountText={resultsCountText}
          />
        </section>
      </main>
    </>
  );
}
