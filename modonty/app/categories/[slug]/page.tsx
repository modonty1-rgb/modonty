import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getCategoryArticlesEnhanced } from "@/app/api/helpers/category-queries";
import { CategoryDetailHero } from "./components/category-detail-hero";
import { ArticleSearchForm } from "./components/article-search-form";
import { ArticleFilters } from "./components/article-filters";
import { CategoryArticleCard } from "./components/category-article-card";
import { CategoryArticleListItem } from "./components/category-article-list-item";
import { CategoryEmptyState } from "./components/category-empty-state";
import { RelatedCategories } from "./components/related-categories";
import { ArticleSkeleton } from "./components/article-skeleton";
import { parseArticleSearchParams, getTrendingScore } from "./helpers/article-utils";
import type { CategoryDetailPageParams } from "@/app/api/helpers/types";

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({
      select: { slug: true },
    });

    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CategoryDetailPageParams): Promise<Metadata> {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const category = await db.category.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        socialImage: true,
      },
    });

    if (!category) {
      return {
        title: "فئة غير موجودة - مودونتي",
      };
    }

    return generateMetadataFromSEO({
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || `استكشف مقالات فئة ${category.name}`,
      keywords: [category.name],
      url: `/categories/${slug}`,
      type: "website",
      image: category.socialImage || undefined,
    });
  } catch {
    return {
      title: "الفئات - مودونتي",
    };
  }
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageParams) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const searchParamsResolved = await searchParams;
  const { search, sort, view, client } = parseArticleSearchParams(searchParamsResolved);

  try {
    const category = await db.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        seoDescription: true,
        socialImage: true,
        socialImageAlt: true,
      },
    });

    if (!category) {
      notFound();
    }

    let articles = await getCategoryArticlesEnhanced(slug, {
      search,
      sortBy: sort || 'latest',
      clientId: client,
      limit: 50,
    });

    if (sort === 'trending') {
      articles = articles
        .map(article => ({
          article,
          score: getTrendingScore(article),
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ article }) => article);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentArticles = articles.filter(
      a => new Date(a.publishedAt) >= sevenDaysAgo
    );

    const totalEngagement = articles.reduce(
      (sum, a) => sum + a.interactions.likes + a.interactions.comments + a.interactions.favorites,
      0
    );

    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الفئات", url: "/categories" },
      { name: category.name, url: `/categories/${slug}` },
    ]);

    const articleCollectionData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.name,
      description: category.description || category.seoDescription,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/categories/${slug}`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.slice(0, 10).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/articles/${article.slug}`,
            datePublished: article.publishedAt,
            author: {
              "@type": "Person",
              name: article.author.name,
            },
            publisher: {
              "@type": "Organization",
              name: article.client.name,
            },
          },
        })),
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleCollectionData) }}
        />

        <>
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: "الفئات", href: "/categories" },
              { label: category.name },
            ]}
          />

          <CategoryDetailHero
            category={category}
            stats={{
              totalArticles: articles.length,
              recentArticles: recentArticles.length,
              totalEngagement,
            }}
          />

          <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
            <section aria-labelledby="category-articles-heading">
              <h2 id="category-articles-heading" className="sr-only">
                مقالات {category.name}
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <ArticleSearchForm defaultValue={search} categorySlug={slug} />
              <ArticleFilters currentSort={sort} currentView={view} categorySlug={slug} />
            </div>

            {articles.length === 0 ? (
              <CategoryEmptyState categoryName={category.name} searchTerm={search} />
            ) : view === 'list' ? (
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <CategoryArticleListItem 
                    key={article.id} 
                    article={article}
                    priority={index < 3}
                  />
                ))}
              </div>
            ) : view === 'compact' ? (
              <div className="space-y-3">
                {articles.map((article, index) => (
                  <CategoryArticleListItem 
                    key={article.id} 
                    article={article}
                    priority={index < 5}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <CategoryArticleCard 
                    key={article.id} 
                    article={article}
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
            </section>

            {articles.length > 0 && (
              <Suspense fallback={null}>
                <RelatedCategories 
                  currentCategoryId={category.id} 
                  currentCategoryName={category.name} 
                />
              </Suspense>
            )}
          </main>
        </>
      </>
    );
  } catch {
    notFound();
  }
}
