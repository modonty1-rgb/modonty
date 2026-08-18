import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { SITE_URL } from "@/constants";

import { getArticlesArchive, type ArchiveSort } from "./data/get-articles-archive";
import { getArticlesFilters } from "./data/get-articles-filters";
import { getModontyArticles } from "./data/get-modonty-articles";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { buildArchiveHref, type ArchiveState } from "./helpers/build-archive-href";
import { ArticlesPageLayout } from "./components/page-layout/ArticlesPageLayout";

const SORTS: ArchiveSort[] = ["newest", "mostRead", "mostEngaged"];

interface ArticlesPageProps {
  searchParams: Promise<{
    industry?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

/** Anything the visitor can type into the URL is narrowed to what the page actually supports. */
function readState(raw: Awaited<ArticlesPageProps["searchParams"]>): ArchiveState {
  const page = Number(raw.page);
  return {
    industry: raw.industry?.trim() || undefined,
    category: raw.category?.trim() || undefined,
    tag: raw.tag?.trim() || undefined,
    sort: SORTS.includes(raw.sort as ArchiveSort) ? (raw.sort as ArchiveSort) : undefined,
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
  };
}

/** The filter in words — used in the heading and the title, so both say the same thing. */
function describeScope(
  state: ArchiveState,
  filters: Awaited<ReturnType<typeof getArticlesFilters>>
): string | null {
  const category = state.category && filters.categories.find((c) => c.slug === state.category)?.name;
  const industry = state.industry && filters.industries.find((i) => i.slug === state.industry)?.name;
  const tag = state.tag && filters.tags.find((t) => t.slug === state.tag)?.name;
  return category || industry || tag || null;
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const state = readState(await searchParams);
  const filters = await getArticlesFilters();
  const scope = describeScope(state, filters);
  const page = state.page ?? 1;

  const title = scope
    ? `مقالات ${scope}${page > 1 ? ` — صفحة ${page}` : ""} - مدونتي`
    : `كل المقالات${page > 1 ? ` — صفحة ${page}` : ""} - مدونتي`;

  const description = scope
    ? `اقرأ مقالات ${scope} على مدونتي — محتوى يكتبه شركاء موثوقون، مرتّب بالأحدث والأكثر قراءة.`
    : "كل مقالات مدونتي في مكان واحد — صفِّ بالمجال أو التصنيف أو الوسم، ورتّب بالأحدث أو الأكثر قراءة.";

  /**
   * Every filter combination gets its OWN canonical, not one pointing at `/articles`: the filtered
   * views are the reason this page exists, and collapsing them onto the bare page would ask Google
   * to drop exactly the URLs worth indexing.
   */
  const canonical = `${SITE_URL}${buildArchiveHref(state)}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

/**
 * The archive — and the answer to a question no other page on the site answers.
 *
 * `/industries` already lists every published article newest-first, so a plain "all articles" page
 * would be its twin (measured 2026-08-19: 117 of 117 identical). What is missing is the axis:
 * `/categories/[slug]` and `/tags/[slug]` show PARTNERS, not articles, so thirty-eight pages end
 * with a visitor who came to read looking at a list of companies. This page is that missing axis.
 */
export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const state = readState(await searchParams);

  const [articles, filters, modontyArticles, brandMedia] = await Promise.all([
    getArticlesArchive({
      industrySlug: state.industry,
      categorySlug: state.category,
      tagSlug: state.tag,
      sort: state.sort,
    }),
    getArticlesFilters(),
    getModontyArticles(),
    getBrandMedia(),
  ]);

  const scopeLabel = describeScope(state, filters);

  const jsonLd = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "المقالات", url: "/articles" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <ArticlesPageLayout
        header={
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              ...(scopeLabel
                ? [{ label: "المقالات", href: "/articles" }, { label: scopeLabel }]
                : [{ label: "المقالات" }]),
            ]}
          />
        }
        articles={articles}
        filters={filters}
        modontyArticles={modontyArticles}
        brandLogoUrl={brandMedia.logoUrl}
        current={state}
        scopeLabel={scopeLabel}
      />
    </>
  );
}
