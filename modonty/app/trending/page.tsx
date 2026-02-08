import { Metadata } from "next";
import { TrendingArticles } from "@/components/TrendingArticles";
import { getTrendingArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse } from "@/app/api/helpers/types";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { TimePeriodFilter } from "./components/time-period-filter";
import { getTrendingPageSeo } from "@/lib/seo/trending-page-seo";

interface TrendingPageProps {
  searchParams: Promise<{ period?: string }>;
}

// Metadata from Settings cache
export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getTrendingPageSeo();
  return metadata ?? {};
}

// Fully server-rendered page component
export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;
  const period = parseInt(params.period || '7');
  const days = [7, 14, 30].includes(period) ? period : 7;
  
  // Server-side data fetching
  const trendingArticles = await getTrendingArticles(12, days);
  const { jsonLd: storedJsonLd } = await getTrendingPageSeo();

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

  const jsonLdToRender = storedJsonLd?.trim() || "";

  return (
    <>
      {jsonLdToRender && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdToRender }}
        />
      )}
      
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
