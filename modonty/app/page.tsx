import { Metadata } from "next";
import { FeedContainer } from "@/components/feed/FeedContainer";
import { getArticles } from "@/app/api/helpers/article-queries";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import type { ArticleResponse, FeedPost } from "@/lib/types";
import { getHomePageSeo } from "@/lib/seo/home-page-seo";
import { getFeedBannerSettings } from "@/lib/settings/get-feed-banner-settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

function mapArticle(article: ArticleResponse): FeedPost {
  return {
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
    hasAudio: article.hasAudio,
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
  };
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { metadata } = await getHomePageSeo();

  // canonical: page 1 = /, page N = /?page=N
  const canonical = currentPage === 1 ? `${SITE_URL}/` : `${SITE_URL}/?page=${currentPage}`;

  return {
    description: "مودونتي — منصة المحتوى العربي المتخصصة. اكتشف مقالات في التقنية والأعمال والتسويق والسياحة والأزياء من أبرز الكتّاب والخبراء العرب.",
    ...(metadata ?? {}),
    alternates: {
      ...(metadata as { alternates?: object } | null)?.alternates,
      canonical,
    },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const currentCategorySlug = resolvedSearchParams.category || undefined;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page ?? "1", 10) || 1);

  // SEO-INF1: if /?page=N, render all articles up to page N so crawlers see full context
  const limit = currentPage * FEED_PAGE_SIZE;

  const [{ jsonLd }, { articles, pagination }, feedBanner] = await Promise.all([
    getHomePageSeo(),
    getArticles({ page: 1, limit, category: currentCategorySlug }),
    getFeedBannerSettings(),
  ]);

  const posts: FeedPost[] = articles.map(mapArticle);
  const jsonLdToRender = jsonLd?.trim() || "";

  // SEO-INF2: prev/next canonical URLs for crawler navigation
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const hasNextPage = currentPage < pagination.totalPages;
  const nextPageUrl = hasNextPage ? `${SITE_URL}/?page=${currentPage + 1}` : null;
  const prevPageUrl = prevPage && prevPage > 1 ? `${SITE_URL}/?page=${prevPage}` : prevPage === 1 ? `${SITE_URL}/` : null;

  return (
    <>
      {jsonLdToRender && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdToRender }}
        />
      )}
      <h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>

      {/* SEO-INF2: hidden crawlable links for next/prev pages */}
      <div aria-hidden="true" className="hidden">
        {prevPageUrl && <a href={prevPageUrl} rel="prev">الصفحة السابقة</a>}
        {nextPageUrl && <a href={nextPageUrl} rel="next">الصفحة التالية</a>}
      </div>

      <FeedContainer
        posts={posts}
        currentCategorySlug={currentCategorySlug}
        initialPage={currentPage}
        platformTagline={feedBanner.platformTagline}
        platformDescription={feedBanner.platformDescription}
      />
    </>
  );
}

