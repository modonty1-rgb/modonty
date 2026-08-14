import { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { FeedContainer } from "@/app/home-components/feed/FeedContainer";
import { HomeBottomBar } from "@/app/home-components/feed/HomeBottomBar/HomeBottomBar";
import { getCorePublisherArticles } from "@/app/home-helpers/get-core-publisher-articles";
import { getHomeFeedArticles } from "@/app/home-helpers/get-home-feed-articles";
import { getReelsFeedPage } from "@/app/reels/helpers/reels-feed";
import { getIndustriesWithCounts } from "@/lib/queries";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getClientServiceCards } from "@/app/home-helpers/get-client-service-cards";
import { getHomePageSeo } from "@/app/home-helpers/home-page-seo";
import { jsonLdHtmlFromString } from "@/lib/seo";
import { SITE_URL, BRAND_AR } from "@/lib/brand";

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

  const [{ jsonLd }, posts, corePublisherArticles, brandMedia, industries, reels, clientServices] = await Promise.all([
    getHomePageSeo(),
    getHomeFeedArticles(),
    getCorePublisherArticles(),
    getBrandMedia(),
    getIndustriesWithCounts(),
    getReelsFeedPage(),
    getClientServiceCards(),
  ]);

  return (
    <>
      {jsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(jsonLd) }}
        />
      )}
      <h1 className="sr-only">مدونتي — منصة المحتوى العربي</h1>
      <FeedContainer posts={posts} corePublisherArticles={corePublisherArticles} brandLogoUrl={brandMedia.logoUrl} industries={industries} reels={reels.items} clientServices={clientServices} />
      {/* Mobile-only action bar (filters + newsletter) — homepage only, lazy client shell */}
      <Suspense fallback={null}>
        <HomeBottomBar />
      </Suspense>
    </>
  );
}

