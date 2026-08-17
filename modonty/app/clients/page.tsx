import { Metadata } from "next";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { UserCard } from "@/components/shared/user-card/UserCard";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { jsonLdHtmlFromString } from "@/lib/seo";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { parsePartnersQuery } from "@/app/clients/helpers/parse-partners-query";
import { PageLayout } from "@/app/clients/components/page-layout/PageLayout";
import { SITE_URL } from "@/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getListingPageSeo("clients");
  return {
    description:
      "اكتشف أبرز العلامات التجارية والشركات الناشرة على مدونتي — محتوى عربي متخصص وموثوق من مصادر معتمدة في السعودية ومصر والخليج.",
    ...(metadata ?? {}),
    // Search, industry and page live in the URL, so one canonical for all of them —
    // a filtered view is the same directory, not a new page.
    alternates: {
      ...(metadata as { alternates?: object } | null)?.alternates,
      canonical: `${SITE_URL}/clients`,
    },
  };
}

interface ClientsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const [params, { jsonLd: storedJsonLd }, partners] = await Promise.all([
    searchParams,
    getListingPageSeo("clients"),
    getClientsList(),
  ]);

  return (
    <>
      {storedJsonLd?.trim() && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedJsonLd) }} />
      )}
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الشركاء" },
        ]}
      />
      {/* UserCard reads the session cookie, so it is created here — outside anything
          cached — and handed down as a slot the layout never introspects. */}
      <PageLayout partners={partners} query={parsePartnersQuery(params)} userCard={<UserCard />} />
    </>
  );
}
