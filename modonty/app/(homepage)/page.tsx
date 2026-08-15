import { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { PageLayout } from "@/app/(homepage)/components/page-layout/PageLayout";
import { BottomBar } from "@/app/(homepage)/components/mobile-bottom-bar/BottomBar";
import { getCorePublisherArticles } from "@/app/(homepage)/data/get-core-publisher-articles";
import { getHomeFeedArticles } from "@/app/(homepage)/data/get-home-feed-articles";
import { getReelsFeedPage } from "@/app/reels/helpers/reels-feed";
import { getIndustriesWithCounts } from "@/lib/queries/get-industries-with-counts";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { getServicesCard } from "@/app/(homepage)/data/get-services-card";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { jsonLdHtmlFromString } from "@/lib/seo";
import { SITE_URL, BRAND_AR } from "@/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("home");
  const safeMetadata = metadata ?? {};
  // Mariam audit 2026-05-27: homepage og:url was https://modonty.com (no www) from DB
  // Settings.homeMetaTags column — mismatched the canonical (www). Force override here so
  // www-only canonical is honored across all metadata fields until DB row is updated.
  const baseOpenGraph = (safeMetadata as { openGraph?: Record<string, unknown> }).openGraph ?? {};
  // Admin-stored title already ends with the brand; wrap in `absolute` so the root
  // layout's `%s | مدونتي` template doesn't append it a second time. Same fix the
  // listing pages carry — the homepage was missed because its title comes from
  // Settings, not from the shared builder.
  const storedTitle = (safeMetadata as { title?: unknown }).title;
  const title: Metadata["title"] =
    typeof storedTitle === "string" ? { absolute: storedTitle } : (storedTitle as Metadata["title"]);
  return {
    description: `${BRAND_AR} — منصة المحتوى العربي المتخصصة. اكتشف مقالات في التقنية والأعمال والتسويق والسياحة والأزياء من أبرز الكتّاب والخبراء العرب.`,
    ...safeMetadata,
    ...(title ? { title } : {}),
    alternates: {
      ...(safeMetadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/`,
      // Mariam audit: Next.js replaces `alternates` entirely from generateMetadata —
      // inherited languages from layout.tsx get lost. Must re-declare here. The list itself
      // comes from Settings: this block used to spell out four locales while Settings held
      // nine, so the homepage — the page Google crawls most — declared the fewest markets.
      languages: buildHreflangLanguages(
        (await getPageSeoDefaults()).alternateLanguages,
        `${SITE_URL}/`,
        SITE_URL,
      ),
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
    getListingPageSeo("home"),
    getHomeFeedArticles(),
    getCorePublisherArticles(),
    getBrandMedia(),
    getIndustriesWithCounts(),
    getReelsFeedPage(),
    getServicesCard(),
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
      <PageLayout posts={posts} corePublisherArticles={corePublisherArticles} brandLogoUrl={brandMedia.logoUrl} industries={industries} reels={reels.items} clientServices={clientServices} />
      {/* Mobile-only action bar (filters + newsletter) — homepage only, lazy client shell */}
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </>
  );
}

