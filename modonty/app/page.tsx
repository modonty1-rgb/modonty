import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { FeedContainer } from "@/components/feed/FeedContainer";
import { getArticles } from "@/app/api/helpers/article-queries";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import type { ArticleResponse, FeedPost } from "@/lib/types";
import { getHomePageSeo } from "@/lib/seo/home-page-seo";
import { getFeedBannerSettings } from "@/lib/settings/get-feed-banner-settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

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

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getHomePageSeo();
  return {
    description: "مودونتي — منصة المحتوى العربي المتخصصة. اكتشف مقالات في التقنية والأعمال والتسويق والسياحة والأزياء من أبرز الكتّاب والخبراء العرب.",
    ...(metadata ?? {}),
    alternates: {
      ...(metadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/`,
    },
  };
}

export default async function HomePage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("homepage", "articles", "settings");

  const [{ jsonLd }, { articles }, feedBanner] = await Promise.all([
    getHomePageSeo(),
    getArticles({ page: 1, limit: FEED_PAGE_SIZE }),
    getFeedBannerSettings(),
  ]);

  const posts: FeedPost[] = articles.map(mapArticle);

  return (
    <>
      {jsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>
      <FeedContainer
        posts={posts}
        platformTagline={feedBanner.platformTagline}
        platformDescription={feedBanner.platformDescription}
      />
    </>
  );
}

