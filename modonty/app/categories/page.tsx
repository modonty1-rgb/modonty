import { Metadata } from "next";
import { getCategoriesEnhanced } from "@/app/api/helpers/category-queries";
import { getCategoriesPageSeo } from "@/lib/seo/categories-page-seo";
import { generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { loadMoreCategories } from "@/app/actions/category-actions";
import { extractOgImageFromMetadata } from "@/lib/seo/og-image";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ListingHero } from "@/components/shared/ListingHero";
import { EntitySearchForm } from "@/components/shared/EntitySearchForm";
import { EntitySortFilter, type EntitySortOption } from "@/components/shared/EntitySortFilter";
import { InfiniteEntityGrid } from "@/components/shared/InfiniteEntityGrid";
import { IconSearch } from "@/lib/icons";
import { parseCategorySearchParams } from "./helpers/category-utils";
import type { CategoryPageParams, CategoryResponse } from "@/lib/types";
import type { EntityCardProps } from "@/components/shared/EntityCard";

const PAGE_SIZE = 20;

const SORT_OPTIONS: EntitySortOption[] = [
  { value: "articles", label: "الأكثر مقالات" },
  { value: "trending", label: "الأكثر رواجًا" },
  { value: "recent", label: "الأكثر نشاطًا" },
  { value: "name", label: "أبجديًا" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getCategoriesPageSeo();
  const merged: Metadata = {
    description:
      "استعرض جميع تصنيفات مدونتي — اختر تصنيفك المفضل وتابع أحدث المقالات في التقنية والأعمال والتسويق وغيرها من المجالات.",
    ...(metadata ?? {}),
  };
  // Admin-stored title already includes the brand; wrap in `absolute` so the
  // root layout's `%s | مدونتي` template doesn't append it a second time.
  if (typeof merged.title === "string") {
    merged.title = { absolute: merged.title };
  }
  return merged;
}

export default async function CategoriesPage({ searchParams }: CategoryPageParams) {
  const params = await searchParams;
  const { search, sort } = parseCategorySearchParams(params);
  const sortBy = sort || "articles";

  const [seo, all] = await Promise.all([
    getCategoriesPageSeo(),
    getCategoriesEnhanced({ search, sortBy }),
  ]);

  // Hero copy comes from the admin SEO cache (single source of truth) — the visible H1
  // reuses the SEO title minus the "| مدونتي" brand suffix (kept only in <title>); the
  // paragraph reuses the SEO description. Fallbacks mirror generateMetadata above.
  const seoTitle = typeof seo.metadata?.title === "string" ? seo.metadata.title : undefined;
  const heroTitle = (seoTitle ?? "تصنيفات المحتوى").replace(/\s*\|\s*مدونتي\s*$/, "").trim();
  const heroDescription =
    (typeof seo.metadata?.description === "string" && seo.metadata.description) ||
    "استعرض جميع تصنيفات مدونتي — اختر تصنيفك المفضل وتابع أحدث المقالات في التقنية والأعمال والتسويق وغيرها من المجالات.";
  const { url: heroImageUrl, alt: heroImageAlt } = extractOgImageFromMetadata(seo.metadata);

  const toCard = (cat: CategoryResponse): EntityCardProps => ({
    type: "category",
    name: cat.name,
    slug: cat.slug,
    imageUrl: cat.socialImage,
    imageAlt: cat.socialImageAlt,
    articleCount: cat.articleCount,
    recentArticleCount: cat.recentArticleCount,
    clientPreviews: cat.clientPreviews ?? [],
    clientCount: cat.clientCount ?? 0,
    digitalImpact: cat.digitalImpact,
  });

  const pageOne = all.slice(0, PAGE_SIZE).map(toCard);
  const hasMore = all.length > PAGE_SIZE;
  const loadMore = loadMoreCategories.bind(null, { search, sortBy });

  // Prefer the admin-generated + validated JSON-LD cache; fall back to a live
  // breadcrumb so the page never ships with zero structured data.
  const storedJsonLd = seo.jsonLd?.trim();
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "الفئات", url: "/categories" },
  ]);

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedJsonLd) }} />
      ) : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbData) }} />
      )}

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الفئات" },
        ]}
      />

      <ListingHero
        badgeText="دليل الشركاء الرقميين"
        title={heroTitle}
        description={heroDescription}
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
        accent="blue"
      />

      <div className="container mx-auto max-w-[1128px] flex-1 px-4 py-8">
        <section aria-labelledby="all-categories-heading">
          <h2 id="all-categories-heading" className="sr-only">
            جميع الفئات
          </h2>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <EntitySearchForm basePath="/categories" placeholder="ابحث عن فئة..." defaultValue={search} />
            <EntitySortFilter basePath="/categories" options={SORT_OPTIONS} currentSort={sortBy} />
          </div>

          {all.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconSearch className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">لم نجد نتائج</h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                {search
                  ? `لم نتمكن من العثور على فئات تطابق بحثك عن "${search}".`
                  : "لا توجد فئات بعد."}
              </p>
            </div>
          ) : (
            // key = search+sort → remount on filter change so the grid re-seeds from filtered initialItems.
            <InfiniteEntityGrid
              key={`${search ?? ""}|${sortBy}`}
              initialItems={pageOne}
              initialHasMore={hasMore}
              loadMoreAction={loadMore}
              columns={4}
              emptyState={null}
            />
          )}
        </section>
      </div>
    </>
  );
}
