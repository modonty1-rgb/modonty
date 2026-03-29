import { Metadata } from "next";
import { TrendingArticles } from "@/components/feed/TrendingArticles";
import { getTrendingArticles } from "@/app/api/helpers/article-queries";
import type { ArticleResponse } from "@/lib/types";
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
          <div className="relative -mx-4 mb-6 overflow-hidden bg-gradient-to-br from-[#0e065a] to-primary px-4 pb-8 pt-6">
            <div
              className="pointer-events-none absolute bottom-4 left-8 flex items-end gap-1 opacity-30"
              aria-hidden
            >
              <span className="h-4 w-1.5 rounded-sm bg-white" />
              <span className="h-6 w-1.5 rounded-sm bg-white" />
              <span className="h-3 w-1.5 rounded-sm bg-white" />
              <span className="h-8 w-1.5 rounded-sm bg-accent" />
              <span className="h-5 w-1.5 rounded-sm bg-white" />
            </div>
            <div className="relative z-10">
              <h1 className="mb-2 text-3xl font-bold text-white">
                المقالات الرائجة
              </h1>
              <p className="mb-4 text-white/70">
                أكثر المقالات قراءة وتفاعلاً خلال {getPeriodText(days)}
              </p>

              <div
                className="[&>div]:mb-0 [&_svg]:text-white/70 [&_div.flex]:border-white/20 [&_button.bg-primary]:!bg-white/20 [&_button.bg-primary]:!text-white [&_button.bg-primary:hover]:!bg-white/30 [&_button:not(.bg-primary)]:!bg-transparent [&_button:not(.bg-primary)]:!text-white/60 [&_button:not(.bg-primary):hover]:!bg-white/10 [&_button:not(.bg-primary):hover]:!text-white"
              >
                <TimePeriodFilter currentPeriod={days} />
              </div>
            </div>
          </div>

          {/* Server-rendered trending articles */}
          <TrendingArticles articles={trending} showTitle={false} />
        </main>
      </>
    </>
  );
}
