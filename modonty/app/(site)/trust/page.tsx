import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { BRAND_AR, SITE_URL, CR_CERTIFICATE_FALLBACK_IMAGE } from "@/constants";
import { jsonLdHtml } from "@/lib/seo";
import { getLegalEntity, buildOrganizationJsonLd } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getBrandMedia } from "@/lib/settings/get-brand-media";

import { getWhatsappContactUrl } from "./helpers/get-whatsapp-contact";
import { getTrustPageForMetadata } from "./helpers/trust-metadata";
import { buildLegalFacts } from "./helpers/build-legal-facts";
import { buildContactRows } from "./helpers/build-contact-rows";
import { IdentityCard } from "./components/identity-card/IdentityCard";
import { RecordCard } from "./components/record-card/RecordCard";
import { PillarsCard } from "./components/pillars-card/PillarsCard";
import { LocationCard } from "./components/location-card/LocationCard";
import { PromisesCard } from "./components/promises-card/PromisesCard";
import { QuestionCard } from "./components/question-card/QuestionCard";

const PAGE_URL = `${SITE_URL}/trust`;
const PAGE_DESC =
  "شركة سعودية موثّقة. سجل تجاري رسمي قابل للتحقّق، عنوان حقيقي، وشفافية كاملة — لأن فلسفتنا حضور لا وعود.";

// Title and description come from the page's own row, edited at /modonty/pages/trust.
// The constants below stay as the fallback for a row that does not exist yet — an indexed
// page must never ship with an empty title while someone fills a form.
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getTrustPageForMetadata(), {
    path: "/trust",
    fallbackTitle: "الموثوقية",
    fallbackDescription: PAGE_DESC,
  });
}

export default async function TrustPage() {
  let ogImageUrl: string | null = null;
  let whatsappHref: string | null = null;
  let certificateSrc: string = CR_CERTIFICATE_FALLBACK_IMAGE;
  // The legal entity joins the same parallel read — it is one cached Settings query
  // shared with /story, so the two pages can never publish conflicting Organization data.
  const [entity] = await Promise.all([getLegalEntity()]);
  try {
    const [media, wa] = await Promise.all([getBrandMedia(), getWhatsappContactUrl()]);
    ogImageUrl = media.ogImageUrl;
    whatsappHref = wa;
    if (media.certificateImageUrl) certificateSrc = media.certificateImageUrl;
  } catch (error) {
    console.error("Trust page settings fetch failed:", error);
  }

  const organizationJsonLd = buildOrganizationJsonLd(entity);
  // Same row the JSON-LD above was built from — what the visitor reads and what Google
  // reads can no longer be two different numbers.
  const legal = toLegalEntityDisplay(entity);
  const map =
    legal.latitude != null && legal.longitude != null
      ? { lat: legal.latitude, lng: legal.longitude }
      : null;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "الموثوقية — مدونتي",
    description: PAGE_DESC,
    url: PAGE_URL,
    inLanguage: "ar",
    isPartOf: { "@type": "WebSite", name: BRAND_AR, url: SITE_URL },
    about: organizationJsonLd,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(organizationJsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPage) }} />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الموثوقية" },
          ]}
        />

        <div className="space-y-4">
          <IdentityCard ogImageUrl={ogImageUrl} legal={legal} />
          <RecordCard certificateSrc={certificateSrc} legal={legal} facts={buildLegalFacts(legal)} />
          <PillarsCard />
          <LocationCard contact={buildContactRows(legal)} map={map} legal={legal} />
          <PromisesCard />
          <QuestionCard whatsappHref={whatsappHref} />
        </div>
      </div>
    </>
  );
}
