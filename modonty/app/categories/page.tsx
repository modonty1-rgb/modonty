import { Metadata } from "next";
import { Suspense } from "react";
import { getCategoriesEnhanced } from "@/app/api/helpers/category-queries";
import { generateMetadataFromSEO } from "@/lib/seo";
import { getSettingsSeoForRoute } from "@/lib/get-settings-seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { CategoriesHero } from "./components/categories-hero";
import { FeaturedCategories } from "./components/featured-categories";
import { CategorySearchForm } from "./components/category-search-form";
import { CategoryFilters } from "./components/category-filters";
import { EnhancedCategoryCard } from "./components/enhanced-category-card";
import { CategoryListItem } from "./components/category-list-item";
import { EmptyState } from "./components/empty-state";
import { CategoriesSkeleton } from "./components/categories-skeleton";
import { parseCategorySearchParams } from "./helpers/category-utils";
import type { CategoryPageParams, CategoryResponse } from "@/app/api/helpers/types";

export const revalidate = 60; // ISR: Revalidate every 60 seconds (optimized)

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getSettingsSeoForRoute("categories");
  if (metadata?.title ?? metadata?.description) return metadata;
  return generateMetadataFromSEO({
    title: "الفئات",
    description: "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
    keywords: ["فئات", "تصنيفات", "مقالات", "محتوى"],
    url: "/categories",
    type: "website",
  });
}

export default async function CategoriesPage({ searchParams }: CategoryPageParams) {
  const params = await searchParams;
  const { search, sort, view, featured } = parseCategorySearchParams(params);

  const [seo, categories] = await Promise.all([
    getSettingsSeoForRoute("categories"),
    getCategoriesEnhanced({
      search,
      sortBy: sort || "articles",
      featured: featured === "true",
    }),
  ]);

  const storedJsonLd = seo.jsonLd;
  const featuredCategories = categories.filter((cat: CategoryResponse) => cat.isFeatured);
  const totalCategories = categories.length;
  const totalArticles = categories.reduce(
    (sum: number, cat: CategoryResponse) => sum + cat.articleCount,
    0
  );

  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "الفئات",
    description: "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/categories`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((category: CategoryResponse, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: category.name,
          description: category.description,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com"}/categories/${category.slug}`,
        },
      })),
    },
  };

  const jsonLdToRender = storedJsonLd?.trim() || JSON.stringify(collectionPageStructuredData);

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
            { label: "الفئات" },
          ]}
        />

        <CategoriesHero totalCategories={totalCategories} totalArticles={totalArticles} />

        <main className="container mx-auto max-w-[1128px] px-4 py-8 flex-1">
          {!search && !featured && (
            <section aria-labelledby="featured-categories-heading">
              <h2 id="featured-categories-heading" className="sr-only">
                الفئات المميزة
              </h2>
              <Suspense fallback={<CategoriesSkeleton count={4} />}>
                <FeaturedCategories categories={featuredCategories} />
              </Suspense>
            </section>
          )}

          <section aria-labelledby="all-categories-heading">
            <h2 id="all-categories-heading" className="sr-only">
              جميع الفئات
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <CategorySearchForm defaultValue={search} />
            <CategoryFilters currentSort={sort} currentView={view} />
          </div>

          {categories.length === 0 ? (
            <EmptyState searchTerm={search} />
          ) : view === 'list' ? (
            <div className="space-y-4">
              {categories.map((category: CategoryResponse) => (
                <CategoryListItem key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: CategoryResponse) => (
                <EnhancedCategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
          </section>
        </main>
      </>
    </>
  );
}




