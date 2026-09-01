import type { Metadata } from "next";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { generateBreadcrumbStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getIndustriesEnhanced } from "@/lib/queries/get-industries-enhanced";
import { getIndustryFeed } from "@/app/(site)/industries/data/get-industry-feed";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { IndustryPageLayout } from "@/app/(site)/industries/components/page-layout/IndustryPageLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { SITE_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

const FALLBACK_DESCRIPTION = messages.seo.industries.description;

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("industries");
  // Spread the stored `alternates` and replace only the canonical. Writing the whole object
  // wiped the `languages` the admin had just built from Settings — measured 25 Aug 2026:
  // this was the ONE page of nineteen shipping zero hreflang while its sisters shipped nine.
  const merged: Metadata = {
    description: FALLBACK_DESCRIPTION,
    ...(metadata ?? {}),
    alternates: {
      ...(metadata?.alternates ?? {}),
      canonical: `${SITE_URL}/industries`,
    },
  };
  // اللفّ في `absolute` صار مركزياً في `getListingPageSeo` ومشروطاً بأن العنوان المخزَّن
  // ينتهي بالعلامة — كان هنا بلا شرط، فيُسقطها حين لا يحملها.
  return merged;
}

interface IndustriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * The entry point into every field — this IS where the three-column split lives
 * (Khalid, 2026-08-16: «هذه الصفحة الرئيسية التي يكون فيها التقسيم»), not one click
 * deeper. Unfiltered here: the center shows the combined feed across every field, the
 * left shows every active partner who has one. Clicking a field in the right rail takes
 * the visitor to `/industries/[slug]`, the exact same shell narrowed to that field.
 */
export default async function IndustriesPage({ searchParams }: IndustriesPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;

  const [seo, industries, articles, partners] = await Promise.all([
    getListingPageSeo("industries"),
    getIndustriesEnhanced({ sortBy: "clients" }),
    getIndustryFeed(),
    getClientsList().then((all) => all.filter((partner) => partner.industry)),
  ]);

  const buildPageHref = (targetPage: number) => (targetPage > 1 ? `/industries?page=${targetPage}` : "/industries");

  const storedJsonLd = seo.jsonLd?.trim();
  const buildFallbackJsonLd = () =>
    generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "المجالات", url: "/industries" },
    ]);

  return (
    <>
      {storedJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedJsonLd) }} />
      ) : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackJsonLd()) }} />
      )}

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "المجالات" },
        ]}
      />

      <IndustryPageLayout
        industries={industries}
        currentSlug=""
        articles={articles}
        partners={partners}
        partnersHeading={`${partners.length.toLocaleString(SITE_LOCALE)} شريك في كل المجالات`}
        partnersBrowseAllHref="/clients"
        page={page}
        buildPageHref={buildPageHref}
      />
    </>
  );
}
