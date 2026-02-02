import { Metadata } from "next";
import { TrendingArticles } from "@/components/TrendingArticles";
import { getTrendingArticles } from "@/app/api/helpers/article-queries";
import { getSettingsSeoForRoute } from "@/lib/get-settings-seo";
import type { ArticleResponse } from "@/app/api/helpers/types";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { TimePeriodFilter } from "./components/time-period-filter";

interface TrendingPageProps {
  searchParams: Promise<{ period?: string }>;
}

// ISR: Revalidate every 60 seconds (same as homepage)
export const revalidate = 60;

// Dynamic metadata for SEO
export async function generateMetadata({ searchParams }: TrendingPageProps): Promise<Metadata> {
  const { metadata } = await getSettingsSeoForRoute("trending");
  if (metadata?.title ?? metadata?.description) return metadata;
  const params = await searchParams;
  const period = parseInt(params.period || "7");
  const days = [7, 14, 30].includes(period) ? period : 7;
  const periodText = days === 7 ? "السبعة" : days === 14 ? "الأربعة عشر" : "الثلاثين";
  return {
    title: "المقالات الرائجة | Modonty",
    description: `استكشف أكثر المقالات رواجاً والأكثر قراءة خلال الأيام ${periodText} الماضية. محتوى شائع ومميز في التقنية والتصميم والتسويق`,
    keywords: ["مقالات رائجة", "trending", "شائع", "الأكثر قراءة", "popular"],
    openGraph: {
      title: "المقالات الرائجة",
      description: `أكثر المقالات رواجاً خلال آخر ${days} ${days === 7 ? "أيام" : "يوم"}`,
      locale: "ar_SA",
      type: "website",
    },
  };
}

// Fully server-rendered page component
export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;
  const period = parseInt(params.period || '7');
  const days = [7, 14, 30].includes(period) ? period : 7;
  
  // Server-side data fetching
  const trendingArticles = await getTrendingArticles(12, days);
  const { jsonLd: storedJsonLd } = await getSettingsSeoForRoute("trending");

  // Helper function for period text
  const getPeriodText = (days: number) => {
    if (days === 7) return 'آخر 7 أيام';
    if (days === 14) return 'آخر 14 يوم';
    if (days === 30) return 'آخر 30 يوم';
    return `آخر ${days} يوم`;
  };

  // Map to component format
  const trending = trendingArticles.map((article: ArticleResponse) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    image: article.image,
    publishedAt: article.publishedAt,
    client: {
      name: article.client.name,
      slug: article.client.slug,
      logo: article.client.logo,
    },
    category: article.category,
    interactions: {
      views: article.interactions.views,
      likes: article.interactions.likes,
      comments: article.interactions.comments,
    },
    readingTimeMinutes: article.readingTimeMinutes,
  }));

  const periodTextAr = days === 7 ? 'السبعة' : days === 14 ? 'الأربعة عشر' : 'الثلاثين';

  const structuredDataFallback = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "المقالات الرائجة",
    description: `مجموعة من أكثر المقالات رواجاً خلال الأيام ${periodTextAr} الماضية`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/trending`,
    inLanguage: "ar-SA",
  };
  const jsonLdToRender = storedJsonLd?.trim() || JSON.stringify(structuredDataFallback);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdToRender }}
      />
      
      <>
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الرائجة" },
          ]}
        />

        <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
          <h1 className="text-3xl font-bold mb-2">المقالات الرائجة</h1>
          <p className="text-muted-foreground mb-4">
            أكثر المقالات قراءة وتفاعلاً خلال {getPeriodText(days)}
          </p>

          <TimePeriodFilter currentPeriod={days} />

          {/* Server-rendered trending articles */}
          <TrendingArticles articles={trending} showTitle={false} />
        </main>
      </>
    </>
  );
}
