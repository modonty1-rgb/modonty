import type { Metadata } from "next";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import { getTagsPageSeo } from "@/lib/seo/tags-page-seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getTagsEnhanced } from "@/app/api/helpers/tag-queries";
import { loadMoreTags } from "@/app/actions/tag-actions";
import { extractOgImageFromMetadata } from "@/lib/seo/og-image";
import { InfiniteEntityGrid } from "@/components/shared/InfiniteEntityGrid";
import { ListingHero } from "@/components/shared/ListingHero";
import { EntitySearchForm } from "@/components/shared/EntitySearchForm";
import { EntitySortFilter, type EntitySortOption } from "@/components/shared/EntitySortFilter";
import { IconSearch } from "@/lib/icons";
import type { EntityCardProps } from "@/components/shared/EntityCard";

const PAGE_SIZE = 20;

const SORT_OPTIONS: EntitySortOption[] = [
  { value: "articles", label: "الأكثر مقالات" },
  { value: "trending", label: "الأكثر رواجًا" },
  { value: "name", label: "أبجديًا" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getTagsPageSeo();
  const fallback = await generateMetadataFromSEO({
    title: "الوسوم",
    description: "تصفح جميع الوسوم في مدونتي واكتشف المقالات المصنّفة حسب المواضيع والاهتمامات",
    url: "/tags",
    type: "website",
  });
  const merged: Metadata = { ...fallback, ...(metadata ?? {}) };
  // Both the admin-stored title and the fallback already include the brand
  // ("… | مدونتي"). Wrap in `absolute` so the root layout's `%s | مدونتي`
  // template doesn't append it a second time (Next.js: title.absolute ignores
  // the parent template). og:title is unaffected by the template — stays correct.
  if (typeof merged.title === "string") {
    merged.title = { absolute: merged.title };
  }
  return merged;
}

interface TagsPageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const params = await searchParams;
  const search = params.search;
  const sortBy = (params.sort as "name" | "articles" | "trending") || "articles";

  const [all, seo] = await Promise.all([
    getTagsEnhanced({ search, sortBy }),
    getTagsPageSeo(),
  ]);

  // Hero copy comes from the admin SEO cache (single source of truth) — the visible H1
  // reuses the SEO title minus the "| مدونتي" brand suffix (kept only in <title>); the
  // paragraph reuses the SEO description. Fallbacks mirror generateMetadata above.
  const seoTitle = typeof seo.metadata?.title === "string" ? seo.metadata.title : undefined;
  const heroTitle = (seoTitle ?? "الوسوم").replace(/\s*\|\s*مدونتي\s*$/, "").trim();
  const heroDescription =
    (typeof seo.metadata?.description === "string" && seo.metadata.description) ||
    "تصفح جميع الوسوم في مدونتي واكتشف المقالات المصنّفة حسب المواضيع والاهتمامات";
  const { url: heroImageUrl, alt: heroImageAlt } = extractOgImageFromMetadata(seo.metadata);

  const toCard = (tag: (typeof all)[number]): EntityCardProps => ({
    type: "tag",
    name: tag.name,
    slug: tag.slug,
    imageUrl: tag.socialImage,
    imageAlt: tag.socialImageAlt,
    articleCount: tag.articleCount,
    recentArticleCount: tag.recentArticleCount,
    clientPreviews: tag.clientPreviews,
    clientCount: tag.clientCount,
    digitalImpact: tag.digitalImpact,
  });

  const pageOne = all.slice(0, PAGE_SIZE).map(toCard);
  const hasMore = all.length > PAGE_SIZE;
  const loadMore = loadMoreTags.bind(null, { search, sortBy });

  // Prefer the admin-generated + validated JSON-LD cache (Settings.tagsPageJsonLdStructuredData —
  // same source of truth as getCategoriesPageSeo()); only compute it live as a fallback so the
  // page never ships with zero structured data before admin runs the generator.
  const storedJsonLd = seo.jsonLd?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.modonty.com";
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "الوسوم", url: "/tags" },
  ]);
  const collectionData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "الوسوم - مدونتي",
    description: "تصفح جميع الوسوم في مدونتي واكتشف المقالات المصنّفة حسب المواضيع",
    url: `${siteUrl}/tags`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: all.length,
      itemListElement: all.slice(0, 20).map((tag, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@type": "DefinedTerm", name: tag.name, url: `${siteUrl}/tags/${tag.slug}` },
      })),
    },
  };

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storedJsonLd }} />
      ) : (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionData) }} />
        </>
      )}

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الوسوم" },
        ]}
      />

      <ListingHero
        badgeText="دليل الوسوم والمواضيع"
        title={heroTitle}
        description={heroDescription}
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
        accent="blue"
      />

      {/* Toolbar + Grid */}
      <div className="container mx-auto max-w-[1128px] flex-1 px-4 py-8">
        <section aria-labelledby="all-tags-heading">
          <h2 id="all-tags-heading" className="sr-only">
            جميع الوسوم
          </h2>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <EntitySearchForm basePath="/tags" placeholder="ابحث عن وسم..." defaultValue={search} />
            <EntitySortFilter basePath="/tags" options={SORT_OPTIONS} currentSort={sortBy} />
          </div>

          {all.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconSearch className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">لم نجد نتائج</h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                {search
                  ? `لم نتمكن من العثور على وسوم تطابق بحثك عن "${search}".`
                  : "لا توجد وسوم بعد."}
              </p>
            </div>
          ) : (
            // key = search+sort → remount on filter change so the grid re-seeds
            // from the new (filtered) initialItems instead of keeping stale client state.
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
