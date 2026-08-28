import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustriesWithCounts } from "@/lib/queries/get-industries-with-counts";
import { getIndustriesEnhanced } from "@/lib/queries/get-industries-enhanced";
import { getIndustryBySlug } from "@/app/(site)/industries/helpers/get-industry-by-slug";
import { getIndustryFeed } from "@/app/(site)/industries/data/get-industry-feed";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { IndustryPageLayout } from "@/app/(site)/industries/components/page-layout/IndustryPageLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { localizedStoredBreadcrumbJsonLd } from "@/lib/seo";
import { messages } from "@/lib/i18n/messages";
import { SITE_URL } from "@/constants";
import { FEED_ALTERNATE_TYPES } from "@/lib/seo/feed-alternate-types";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface IndustryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  try {
    const industries = await getIndustriesWithCounts();
    if (!industries.length) return [{ slug: "__no_industries__" }];
    return industries.map((i) => ({ slug: i.slug }));
  } catch {
    return [{ slug: "__no_industries__" }];
  }
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(decodeURIComponent(slug));
  if (!industry) return { title: "المجال غير موجود" };
  // Serve-the-stored pattern (same as the client/category/tag pages): the admin generator
  // bakes the full metadata (og:image included) — a hand-built object here would drop it.
  if (industry.nextjsMetadata) {
    const stored = industry.nextjsMetadata as Metadata;
    // The blob is returned as it was baked, with one addition: the feed link. Admin never
    // writes `alternates.types`, and returning the blob untouched sets `alternates` — which
    // in Next replaces the root layout's copy rather than merging with it, taking the feed
    // link with it. Everything else the blob carries is left exactly as stored.
    if (stored.title) {
      return { ...stored, alternates: { ...stored.alternates, types: FEED_ALTERNATE_TYPES } };
    }
  }
  return {
    title: `${industry.name} — المجالات`,
    description:
      industry.description ??
      messages.seo.industries.partnersDescription.replace("{name}", industry.name),
    alternates: { canonical: `${SITE_URL}/industries/${slug}`, types: FEED_ALTERNATE_TYPES },
  };
}

export default async function IndustryPage({ params, searchParams }: IndustryPageProps) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const decodedSlug = decodeURIComponent(slug);
  const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;

  const industry = await getIndustryBySlug(decodedSlug);
  if (!industry) notFound();

  const [industries, articles, allPartners] = await Promise.all([
    getIndustriesEnhanced({ sortBy: "clients" }),
    getIndustryFeed(industry.id),
    getClientsList(),
  ]);

  const partners = allPartners.filter((partner) => partner.industry?.slug === decodedSlug);
  const buildPageHref = (targetPage: number) =>
    targetPage > 1 ? `/industries/${slug}?page=${targetPage}` : `/industries/${slug}`;

  return (
    <>
      {/* CollectionPage JSON-LD — DB cache, same serve-the-stored pattern as the client page. */}
      {industry.jsonLdStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: localizedStoredBreadcrumbJsonLd(industry.jsonLdStructuredData, {
              Home: messages.chrome.footer.home,
              Industries: messages.chrome.footer.industries,
            }),
          }}
        />
      )}

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "المجالات", href: "/industries" },
          { label: industry.name },
        ]}
      />

      <IndustryPageLayout
        industries={industries}
        currentSlug={decodedSlug}
        industryName={industry.name}
        articles={articles}
        partners={partners}
        partnersHeading={`${partners.length.toLocaleString(SITE_LOCALE)} في هذا المجال`}
        partnersBrowseAllHref={`/clients?industry=${encodeURIComponent(decodedSlug)}`}
        page={page}
        buildPageHref={buildPageHref}
      />
    </>
  );
}
