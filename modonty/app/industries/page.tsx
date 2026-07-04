import type { Metadata } from "next";
import { getIndustriesEnhanced } from "@/app/api/helpers/industry-queries";
import { getIndustriesPageSeo } from "@/lib/seo/industries-page-seo";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { loadMoreIndustries } from "@/app/actions/industry-actions";
import { extractOgImageFromMetadata } from "@/lib/seo/og-image";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ListingHero } from "@/components/shared/ListingHero";
import { EntitySearchForm } from "@/components/shared/EntitySearchForm";
import { EntitySortFilter, type EntitySortOption } from "@/components/shared/EntitySortFilter";
import { InfiniteEntityGrid } from "@/components/shared/InfiniteEntityGrid";
import { IconSearch } from "@/lib/icons";
import type { IndustryListItem } from "@/lib/types";
import type { EntityCardProps } from "@/components/shared/EntityCard";

const PAGE_SIZE = 20;

const SORT_OPTIONS: EntitySortOption[] = [
  { value: "clients", label: "الأكثر شركاء" },
  { value: "name", label: "أبجديًا" },
];

const FALLBACK_DESCRIPTION =
  "استعرض جميع القطاعات والصناعات على مدونتي — اكتشف الشركات والخبراء في كل مجال من التقنية والرعاية الصحية والتجارة الإلكترونية وغيرها.";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getIndustriesPageSeo();
  const merged: Metadata = {
    description: FALLBACK_DESCRIPTION,
    ...(metadata ?? {}),
  };
  // Admin-stored title already includes the brand; wrap in `absolute` so the
  // root layout's `%s | مدونتي` template doesn't append it a second time.
  if (typeof merged.title === "string") {
    merged.title = { absolute: merged.title };
  }
  return merged;
}

interface IndustriesPageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function IndustriesPage({ searchParams }: IndustriesPageProps) {
  const params = await searchParams;
  const search = params.search;
  const sortBy: "clients" | "name" = params.sort === "name" ? "name" : "clients";

  const [seo, all] = await Promise.all([
    getIndustriesPageSeo(),
    getIndustriesEnhanced({ search, sortBy }),
  ]);

  // Hero copy comes from the admin SEO cache (single source of truth) — the visible H1
  // reuses the SEO title minus the "| مدونتي" brand suffix (kept only in <title>); the
  // paragraph reuses the SEO description. Fallbacks mirror generateMetadata above.
  const seoTitle = typeof seo.metadata?.title === "string" ? seo.metadata.title : undefined;
  const heroTitle = (seoTitle ?? "الصناعات").replace(/\s*\|\s*مدونتي\s*$/, "").trim();
  const heroDescription =
    (typeof seo.metadata?.description === "string" && seo.metadata.description) || FALLBACK_DESCRIPTION;
  const { url: heroImageUrl, alt: heroImageAlt } = extractOgImageFromMetadata(seo.metadata);

  // Industry cards carry the partner-company count in the headline (articleCount slot).
  const toCard = (industry: IndustryListItem): EntityCardProps => ({
    type: "industry",
    name: industry.name,
    slug: industry.slug,
    imageUrl: industry.socialImage,
    imageAlt: industry.socialImageAlt,
    articleCount: industry.clientCount,
    clientPreviews: industry.clientPreviews,
    clientCount: industry.clientCount,
  });

  const pageOne = all.slice(0, PAGE_SIZE).map(toCard);
  const hasMore = all.length > PAGE_SIZE;
  const loadMore = loadMoreIndustries.bind(null, { search, sortBy });

  // Prefer the admin-generated + validated JSON-LD cache; fall back to a live
  // breadcrumb so the page never ships with zero structured data.
  const storedJsonLd = seo.jsonLd?.trim();
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "الصناعات", url: "/industries" },
  ]);

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storedJsonLd }} />
      ) : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      )}

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الصناعات" },
        ]}
      />

      <ListingHero
        badgeText="دليل القطاعات والصناعات"
        title={heroTitle}
        description={heroDescription}
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
        accent="teal"
      />

      <div className="container mx-auto max-w-[1128px] flex-1 px-4 py-8">
        <section aria-labelledby="all-industries-heading">
          <h2 id="all-industries-heading" className="sr-only">
            جميع الصناعات
          </h2>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <EntitySearchForm basePath="/industries" placeholder="ابحث عن صناعة..." defaultValue={search} />
            <EntitySortFilter basePath="/industries" options={SORT_OPTIONS} currentSort={sortBy} />
          </div>

          {all.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconSearch className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">لم نجد نتائج</h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                {search
                  ? `لم نتمكن من العثور على صناعات تطابق بحثك عن "${search}".`
                  : "لا توجد صناعات بعد."}
              </p>
            </div>
          ) : (
            // key = search+sort → remount on filter change so the grid re-seeds from filtered initialItems.
            <InfiniteEntityGrid
              key={`${search ?? ""}|${sortBy}`}
              initialItems={pageOne}
              initialHasMore={hasMore}
              loadMoreAction={loadMore}
              columns={3}
              emptyState={null}
            />
          )}
        </section>
      </div>
    </>
  );
}
