import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";

import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { SITE_URL } from "@/constants";

import { getArticlesArchive, type ArchiveSort } from "@/lib/articles/archive/get-articles-archive";
import { getArticlesFilters } from "@/lib/articles/archive/get-articles-filters";
import { getTagName } from "./data/get-tag-name";
import { buildArchiveHref, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import { ARCHIVE_PAGE_SIZE } from "./helpers/archive-page-size";
import {
  countByReadingTime,
  filterByReadingTime,
  READING_TIME_BUCKETS,
  type ReadingTimeBucket,
} from "@/lib/articles/archive/reading-time-buckets";
import { ArticlesPageLayout } from "./components/page-layout/ArticlesPageLayout";

const SORTS: ArchiveSort[] = ["newest", "mostRead", "mostEngaged"];
const TIMES: ReadingTimeBucket[] = ["short", "medium", "long"];

interface ArticlesPageProps {
  searchParams: Promise<{
    industry?: string;
    category?: string;
    tag?: string;
    search?: string;
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
    search: raw.search?.trim() || undefined,
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

  if (state.search) return `«${state.search}»`;

  return null;
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const state = readState(await searchParams);
  const filters = await getArticlesFilters();
  const scope = await describeScope(state, filters);

  /**
   * A page past the end renders the not-found UI, but the HTTP status stays 200: with Cache
   * Components the shell is flushed before `page.tsx` reaches `notFound()` — the same behaviour
   * `proxy.ts` was written for on `/users/:id`. A 200 with nothing on it is a soft 404, so the
   * page tells Google not to index it instead. Cheap: `getArticlesArchive` is cached, so this is
   * the same read the body already does.
   */
  const outOfRange =
    (state.page ?? 1) > 1 &&
    filterByReadingTime(
      await getArticlesArchive({
        industrySlug: state.industry,
        categorySlug: state.category,
        tagSlug: state.tag,
        search: state.search,
        sort: state.sort,
      }),
      state.time
    ).length <= ((state.page ?? 1) - 1) * ARCHIVE_PAGE_SIZE;
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

  /**
   * The archive was declaring no language at all — measured 2026-08-20: `/audio`, `/clients` and
   * the homepage each ship nine `hrefLang` entries and this one shipped zero, on one of the most
   * important pages on the site. It hand-rolled its `alternates` and simply never grew the map
   * every other page reads from `Settings.defaultAlternateLanguages`.
   *
   * Each entry points at THIS filtered canonical, not at the bare `/articles` — the same single
   * source of Arabic content serving every Gulf market, per filter view.
   */
  const { alternateLanguages } = await getPageSeoDefaults();

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: buildHreflangLanguages(alternateLanguages, canonical, SITE_URL),
    },
    ...(outOfRange && { robots: { index: false, follow: false } }),
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

  const [subjectMatches, filters, wholeArchive] = await Promise.all([
    getArticlesArchive({
      industrySlug: state.industry,
      categorySlug: state.category,
      tagSlug: state.tag,
      search: state.search,
      sort: state.sort,
    }),
    getArticlesFilters(),
    // The reading-time strip counts the whole archive — EXCEPT under a search (Khalid,
    // 23 Aug: search and time now compose), where a whole-archive «١٦» over three matching
    // results would be a number about a different list than the one on screen.
    getArticlesArchive({ search: state.search, sort: state.sort }),
  ]);

  /**
   * Reading time is applied HERE, not in the query, so the strip can count buckets separately
   * from the filter it applies. The counts come from the WHOLE archive (Khalid, 21 Aug: time is
   * a standalone axis) — counted against the current field they dropped to zero and disabled the
   * very question the strip exists to answer.
   */
  const readingTimeCounts = countByReadingTime(wholeArchive);
  const articles = filterByReadingTime(subjectMatches, state.time);

  /**
   * A page number past the end is not an empty page — it is a page that does not exist. Returning
   * 200 with nothing in it is a soft 404: Google indexes the URL, finds no content, and distrusts
   * the whole series. The engine's own contract asks for this explicitly. Measured 2026-08-19:
   * `?page=99` served 200 with zero rows.
   */
  if ((state.page ?? 1) > 1 && articles.length <= ((state.page ?? 1) - 1) * ARCHIVE_PAGE_SIZE) {
    notFound();
  }

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
        total={articles.length}
        filters={filters}
        readingTimeCounts={readingTimeCounts}
        current={state}
        scopeLabel={scopeLabel}
      />
    </>
  );
}
