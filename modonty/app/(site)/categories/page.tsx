import { Metadata } from "next";
import { getCategoriesEnhanced } from "@/app/(site)/categories/helpers/get-categories-enhanced";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { loadMoreCategories } from "@/app/(site)/categories/actions";
import { extractOgImageFromMetadata } from "@/lib/seo/og-image";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ListingHero } from "@/components/listing/ListingHero";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { EntitySortFilter, type EntitySortOption } from "@/components/listing/EntitySortFilter";
import { InfiniteEntityGrid } from "@/components/listing/InfiniteEntityGrid";
import { IconSearch } from "@/lib/icons";
import { parseCategorySearchParams } from "./helpers/parse-category-search-params";
import type { CategoryPageParams } from "./helpers/category-page-params";
import type { CategoryResponse } from "@/lib/types";
import type { EntityCardProps } from "@/components/listing/EntityCard";
import { messages } from "@/lib/i18n/messages";

const SORT_OPTIONS: EntitySortOption[] = [
  { value: "articles", label: "الأكثر مقالات" },
  { value: "trending", label: "الأكثر رواجًا" },
  { value: "recent", label: "الأكثر نشاطًا" },
  { value: "name", label: "أبجديًا" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("categories");
  const merged: Metadata = {
    description: messages.seo.categories.description,
    ...(metadata ?? {}),
  };
  // كان هنا لفٌّ غير مشروط في `absolute` بافتراض «العنوان المخزَّن يحمل العلامة» — وهو
  // افتراض يكذّبه القياس: على الديف العنوان بلا علامة، فمنع اللفُّ القالبَ من إلحاقها
  // وخرجت الصفحة بلا علامة إطلاقاً. صار العلاج مركزياً في `getListingPageSeo` ومشروطاً
  // بوجودها فعلاً في المخزَّن.
  return merged;
}

export default async function CategoriesPage({ searchParams }: CategoryPageParams) {
  const params = await searchParams;
  const { search, sort } = parseCategorySearchParams(params);
  const sortBy = sort || "articles";

  const [seo, all] = await Promise.all([
    getListingPageSeo("categories"),
    getCategoriesEnhanced({ search, sortBy, includeEmpty: true }),
  ]);

  // Hero copy comes from the admin SEO cache (single source of truth): the visible H1 reuses
  // the SEO title, the paragraph reuses the SEO description.
  //
  // The title used to be stripped of a trailing "| مدونتي" here. That was treating the symptom:
  // the brand had been typed into the stored title, and the root layout's template appends it
  // again — so <title> read it twice and the H1 needed a regex to look right. The brand was
  // removed from the stored title instead (25 Aug 2026), so there is nothing left to strip.
  const seoTitle = typeof seo.metadata?.title === "string" ? seo.metadata.title : undefined;
  const heroTitle = seoTitle ?? "تصنيفات المحتوى";
  const heroDescription =
    (typeof seo.metadata?.description === "string" && seo.metadata.description) ||
    messages.seo.categories.description;
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

  // كانت `all.slice(0, 20)`، فما بعد العشرين لا يصل الزاحف: بقيّة العناصر تُجلب
  // بجافاسكربت والرابط يُكتب بـ`history.pushState` (InfiniteEntityGrid.tsx:70) — والسيرفر
  // لا يقرأ `page`، فلا وجود لعنوان ثابت يُزحف. وجوجل صريح: «Give each chunk its own
  // persistent, unique URL … Link sequentially to the individual URLs so that search
  // engines can discover the URLs in a paginated set» (crawling-indexing/javascript/lazy-loading).
  //
  // والفئات مجموعة محدودة تُدار من الأدمن — ١٥ اليوم — لا تدفّقٌ لا نهائيّ مثل المقالات.
  // فالحلّ ليس بناء مسار `/page/n` لها، بل ما تفعله أخواتها الثلاث أصلاً: تُرسَل كاملةً
  // من السيرفر (tags:79 · industries · clients كلها بلا حدّ). فتُزحف كلها مهما نمت،
  // ويبقى الشريط للعرض لا للجلب.
  const initialItems = all.map(toCard);
  const loadMore = loadMoreCategories.bind(null, { search, sortBy });

  // Prefer the admin-generated + validated JSON-LD cache; fall back to a live
  // breadcrumb so the page never ships with zero structured data. The fallback is built
  // inside its own branch — when the cache is present (the normal case) it is never built.
  const storedJsonLd = seo.jsonLd?.trim();

  const buildFallbackJsonLd = () =>
    generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الفئات", url: "/categories" },
    ]);

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedJsonLd) }} />
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackJsonLd()) }}
        />
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
              initialItems={initialItems}
              initialHasMore={false}
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
