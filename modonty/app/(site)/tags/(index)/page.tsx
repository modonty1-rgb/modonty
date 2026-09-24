import type { Metadata } from "next";
import { generateMetadataFromSEO, generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { getTagsEnhanced } from "@/app/(site)/tags/helpers/get-tags-enhanced";
import { loadMoreTags } from "@/app/(site)/tags/actions";
import { extractOgImageFromMetadata } from "@/lib/seo/og-image";
import { InfiniteEntityGrid } from "@/components/listing/InfiniteEntityGrid";
import { ListingHero } from "@/components/listing/ListingHero";
import { EntitySearchForm } from "@/components/listing/EntitySearchForm";
import { EntitySortFilter, type EntitySortOption } from "@/components/listing/EntitySortFilter";
import { IconSearch } from "@/lib/icons";
import type { EntityCardProps } from "@/components/listing/EntityCard";
import { SITE_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";

const SORT_OPTIONS: EntitySortOption[] = [
  { value: "articles", label: "الأكثر مقالات" },
  { value: "trending", label: "الأكثر رواجًا" },
  { value: "name", label: "أبجديًا" },
];

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("tags");
  const fallback = await generateMetadataFromSEO({
    title: "الوسوم",
    description: messages.seo.tags.description,
    url: "/tags",
    type: "website",
  });
  const merged: Metadata = { ...fallback, ...(metadata ?? {}) };
  // كان هنا لفٌّ غير مشروط في `absolute`، وتعليقه يقول إن العنوان المخزَّن والاحتياط
  // «كلاهما يحمل العلامة». الشقّ الثاني لم يعد صحيحاً: `generateMetadataFromSEO` توقّفت
  // عن إلحاقها (`pageTitle = title || siteName` — lib/seo/index.ts:192)، فالاحتياط اليوم
  // «الوسوم» مجرّدة. واللفّ غير المشروط كان يمنع القالب من إلحاقها فتخرج الصفحة بلا علامة —
  // مقيس على الديف. العلاج صار مركزياً في `getListingPageSeo` ومشروطاً بوجودها في المخزَّن.
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
    getListingPageSeo("tags"),
  ]);

  // Hero copy comes from the admin SEO cache (single source of truth): the visible H1 reuses
  // the SEO title, the paragraph reuses the SEO description.
  //
  // The trailing-brand strip that used to live here was treating the symptom — see the same
  // note on `/categories`. The brand left the stored title on 25 Aug 2026.
  const seoTitle = typeof seo.metadata?.title === "string" ? seo.metadata.title : undefined;
  const heroTitle = seoTitle ?? "الوسوم";
  const heroDescription =
    (typeof seo.metadata?.description === "string" && seo.metadata.description) ||
    messages.seo.tags.description;
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

  const initialItems = all.map(toCard);
  const loadMore = loadMoreTags.bind(null, { search, sortBy });

  // Prefer the admin-generated + validated JSON-LD cache (Settings.tagsPageJsonLdStructuredData —
  // same source of truth as getListingPageSeo()); only compute it live as a fallback so the
  // page never ships with zero structured data before admin runs the generator.
  const storedJsonLd = seo.jsonLd?.trim();

  // Built only when the cache is empty — mapping the tag list on every request just to throw
  // the result away is work nobody reads.
  const buildFallbackJsonLd = () => {
    // `SITE_URL` يقرأ نفس المتغيّر ويقصّ الشرطة — نسخةٌ ثانية تعني رابطين قد يفترقان.
    const siteUrl = SITE_URL;
    return {
      breadcrumb: generateBreadcrumbStructuredData([
        { name: "الرئيسية", url: "/" },
        { name: "الوسوم", url: "/tags" },
      ]),
      collection: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        // بلا لاحقة الماركة — اسم المجموعة وحده.
        name: "الوسوم",
        description: messages.seo.tags.shortDescription,
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
      },
    };
  };

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedJsonLd) }} />
      ) : (
        (() => {
          const fallback = buildFallbackJsonLd();
          return (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(fallback.breadcrumb) }} />
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(fallback.collection) }} />
            </>
          );
        })()
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
