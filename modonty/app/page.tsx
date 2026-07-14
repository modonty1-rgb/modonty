import { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { FeedContainer } from "@/components/feed/FeedContainer";
import { HomeBottomBar } from "@/components/feed/HomeBottomBar/HomeBottomBar";
import { getArticles } from "@/app/api/helpers/article-queries";
import { FEED_PAGE_SIZE } from "@/lib/feed-constants";
import type { ArticleResponse, FeedPost } from "@/lib/types";
import { getHomePageSeo } from "@/lib/seo/home-page-seo";
import { jsonLdHtmlFromString } from "@/lib/seo";
import { getFeedBannerSettings } from "@/lib/settings/get-feed-banner-settings";
import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { SITE_URL, BRAND_AR, BRAND_EN } from "@/lib/brand";

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
      name: article.author.name || BRAND_EN,
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
  const safeMetadata = metadata ?? {};
  // Mariam audit 2026-05-27: homepage og:url was https://modonty.com (no www) from DB
  // Settings.homeMetaTags column — mismatched the canonical (www). Force override here so
  // www-only canonical is honored across all metadata fields until DB row is updated.
  const baseOpenGraph = (safeMetadata as { openGraph?: Record<string, unknown> }).openGraph ?? {};
  return {
    description: `${BRAND_AR} — منصة المحتوى العربي المتخصصة. اكتشف مقالات في التقنية والأعمال والتسويق والسياحة والأزياء من أبرز الكتّاب والخبراء العرب.`,
    ...safeMetadata,
    alternates: {
      ...(safeMetadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/`,
      // Mariam audit: Next.js replaces `alternates` entirely from generateMetadata —
      // inherited languages from layout.tsx get lost. Must re-declare here.
      languages: {
        "ar-SA": `${SITE_URL}/`,
        "ar-EG": `${SITE_URL}/`,
        ar: `${SITE_URL}/`,
        "x-default": `${SITE_URL}/`,
      },
    },
    openGraph: {
      ...baseOpenGraph,
      url: `${SITE_URL}/`,
    },
  };
}

export default async function HomePage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("homepage", "articles", "settings");

  const [{ jsonLd }, { articles }, feedBanner, socialLinks] = await Promise.all([
    getHomePageSeo(),
    getArticles({ page: 1, limit: FEED_PAGE_SIZE }),
    getFeedBannerSettings(),
    getPlatformSocialLinks(),
  ]);

  const posts: FeedPost[] = articles.map(mapArticle);

  return (
    <>
      {jsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(jsonLd) }}
        />
      )}
      <h1 className="sr-only">مدونتي — منصة المحتوى العربي</h1>
      <FeedContainer
        posts={posts}
        platformTagline={feedBanner.platformTagline}
        platformDescription={feedBanner.platformDescription}
        socialLinks={socialLinks}
      />
      {/* Mobile-only action bar (filters + newsletter) — homepage only, lazy client shell */}
      <Suspense fallback={null}>
        <HomeBottomBar />
      </Suspense>
    </>
  );
}

