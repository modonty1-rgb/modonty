import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { SITE_URL } from "@/constants";

import { getArticlesArchive, type ArchiveSort } from "./data/get-articles-archive";
import { getArticlesFilters } from "./data/get-articles-filters";
import { getTagName } from "./data/get-tag-name";
import { buildArchiveHref, type ArchiveState } from "./helpers/build-archive-href";
import {
  countByReadingTime,
  filterByReadingTime,
  READING_TIME_BUCKETS,
  type ReadingTimeBucket,
} from "./helpers/reading-time-buckets";
import { ArticlesPageLayout } from "./components/page-layout/ArticlesPageLayout";

const SORTS: ArchiveSort[] = ["newest", "mostRead", "mostEngaged"];
const TIMES: ReadingTimeBucket[] = ["short", "medium", "long"];

interface ArticlesPageProps {
  searchParams: Promise<{
    industry?: string;
    category?: string;
    tag?: string;
    time?: string;
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
    time: TIMES.includes(raw.time as ReadingTimeBucket) ? (raw.time as ReadingTimeBucket) : undefined,
    sort: SORTS.includes(raw.sort as ArchiveSort) ? (raw.sort as ArchiveSort) : undefined,
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
  };
}

/** The filter in words — used in the heading and the title, so both say the same thing. */
async function describeScope(
  state: ArchiveState,
  filters: Awaited<ReturnType<typeof getArticlesFilters>>
): Promise<string | null> {
  const category = state.category && filters.categories.find((c) => c.slug === state.category)?.name;
  if (category) return category;

  const industry = state.industry && filters.industries.find((i) => i.slug === state.industry)?.name;
  if (industry) return industry;

  // Tags are not offered in the rail any more, but `/tags/[slug]` still links here — so the name
  // is looked up rather than carried through the page.
  if (state.tag) return await getTagName(state.tag);

  return null;
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const state = readState(await searchParams);
  const filters = await getArticlesFilters();
  const scope = await describeScope(state, filters);
  const page = state.page ?? 1;
  const timeLabel = state.time
    ? READING_TIME_BUCKETS.find((b) => b.key === state.time)?.hint
    : undefined;

  const base = scope ? `مقالات ${scope}` : "كل المقالات";
  const title = `${base}${timeLabel ? ` — ${timeLabel}` : ""}${page > 1 ? ` — صفحة ${page}` : ""} - مدونتي`;

  const description = scope
    ? `اقرأ مقالات ${scope} على مدونتي — محتوى يكتبه شركاء موثوقون، مرتّب بالأحدث والأكثر قراءة.`
    : "كل مقالات مدونتي في مكان واحد — صفِّ بالمجال أو التصنيف، واختر حسب الوقت اللي عندك.";

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

  const [subjectMatches, filters] = await Promise.all([
    getArticlesArchive({
      industrySlug: state.industry,
      categorySlug: state.category,
      tagSlug: state.tag,
      sort: state.sort,
    }),
    getArticlesFilters(),
  ]);

  /**
   * Reading time is applied HERE, not in the query, so the left rail can count the buckets against
   * what the subject filters already returned. Counting after the time filter would collapse every
   * other bucket to zero the moment one was picked.
   */
  const readingTimeCounts = countByReadingTime(subjectMatches);
  const articles = filterByReadingTime(subjectMatches, state.time);

  const scopeLabel = await describeScope(state, filters);

  const jsonLd = generateBreadcrumbStructuredData([
    { name: "الرئيسية", url: "/" },
    { name: "المقالات", url: "/articles" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <ArticlesPageLayout
        breadcrumb={
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
        readingTimeCounts={readingTimeCounts}
        current={state}
        scopeLabel={scopeLabel}
      />
    </>
  );
}
