import type { Metadata } from "next";
import { Suspense } from "react";

import { isSectorPaused } from "@modonty/shared/lib/sectors/live-sectors";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { ComingSoon } from "@/components/shared/coming-soon/ComingSoon";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconHealth } from "@/lib/icons";
import { fill, messages } from "@/lib/i18n/messages";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { generateBreadcrumbStructuredData, generateStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

import { SectorAlertBody } from "../components/sector-alert/SectorAlertBody";
import { SectorArticles } from "../components/sector-articles/SectorArticles";
import { SectorHeroBanner, heroLineClass } from "../components/sector-hero/SectorHeroBanner";
import { getSectorArticles } from "../data/get-sector-articles";
import { getSectorHero } from "../data/get-sector-hero";
import { DrugLookup } from "./components/drug-lookup/DrugLookup";
import { FacilityLookup } from "./components/facility-lookup/FacilityLookup";

const t = messages.modonty.health;
const PATH = "/modonty/health";
const ABOUT = { "@type": "Thing", name: "الصحة", alternateName: "Health", sameAs: "https://www.wikidata.org/wiki/Q12147" };
// The open-data publisher page — never sfda.gov.sa itself: its terms require approval even to link.
const SFDA = "https://open.data.gov.sa/ar/publishers/ce4b4b1f-e50e-40a0-82f3-44284cec9457";
const CBAHI = "https://open.data.gov.sa/ar/publishers/5c2c5dc0-243c-464d-93c9-d958e9a40bd6";
const CHI = "https://open.data.gov.sa/ar/publishers/86ca88f0-1c3a-4eb7-9274-178582a51a68";
const LICENSE = "https://open.data.gov.sa/ar/pages/policies/license";
/** Off until the data reaches Vercel — see `shared/lib/sectors/live-sectors.ts`. */
const PAUSED = isSectorPaused("health");

/** SEO lives in the admin (Modonty › Sectors › Health), like the other sectors; these fill in until it is saved. */
export async function generateMetadata(): Promise<Metadata> {
  // «قريباً» is thin content — out of the index while the sector is paused.
  if (PAUSED) return { title: fill(messages.modonty.soon.title, { name: t.title }), robots: { index: false, follow: true } };
  return buildMetadataFromPageRow(await getContentPageRow("health"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/health` — the sixth live sector page (28 Sep 2026). Two checks a reader makes, each read
 * from the open data platform with nothing stored in our database (Khalid: «i do not want data in my
 * db»): whether a drug is registered and needs a prescription (هيئة الغذاء والدواء), and a facility's
 * accreditation (سباهي and مجلس الضمان الصحي). Price, leaflet and cosmetics wait for هيئة الغذاء
 * والدواء's approval — its site's terms forbid copying (Khalid: «اي حاجه فيها مخاطره ابعدنا عنها»).
 */
export default async function HealthPage() {
  if (PAUSED) {
    return (
      <>
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "مدونتي", href: "/modonty" },
            { label: t.title },
          ]}
        />
        <ComingSoon name={t.title} blurb={messages.modonty.soon.blurbs.health} icon={IconHealth} />
      </>
    );
  }
  const [articles, hero, { siteName }, seoRow] = await Promise.all([
    getSectorArticles("health"),
    getSectorHero("health"),
    getPageSeoDefaults(),
    getContentPageRow("health"),
  ]);

  const header = (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "مدونتي", href: "/modonty" },
          { label: t.title },
        ]}
      />
      <div className="mt-4">
        <h1 className="text-h1 flex items-center gap-2.5">
          <IconHealth aria-hidden className="size-8 text-primary" />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.lead}</p>
      </div>
    </>
  );

  // The admin's validated graph when it has one; until then BreadcrumbList + WebPage about the field.
  const storedJsonLd = seoRow?.jsonLdStructuredData?.trim();
  const fallbackJsonLd = [
    generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: siteName ?? "", url: "/modonty" },
      { name: t.title, url: PATH },
    ]),
    generateStructuredData({
      type: "WebPage",
      name: t.metaTitle,
      description: t.metaDescription,
      url: PATH,
      inLanguage: "ar",
      about: ABOUT,
    }),
  ];

  const link = "text-link underline-offset-2 hover:underline";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: storedJsonLd ? jsonLdHtmlFromString(storedJsonLd) : jsonLdHtml(fallbackJsonLd) }}
      />
      <TwoColumnLayout
        className="pb-10"
        header={header}
        main={
          <>
            <SectorHeroBanner hero={hero} headingId="health-hero" title={hero.title || t.heroTitle}>
              <Suspense
                fallback={
                  <>
                    <p className={heroLineClass}>{hero.subtitle || t.heroLine}</p>
                    <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
                  </>
                }
              >
                <SectorAlertBody topic="health" path={PATH} guestLine={hero.subtitle || t.heroLine} memberLine={t.alerts.memberBody} onLine={t.alerts.onBody} />
              </Suspense>
            </SectorHeroBanner>
            <DrugLookup labels={t.drugs} />
            {/* Our articles within the first two screens, right after the first live card (NN/g 2018). */}
            <SectorArticles articles={articles} />
            <FacilityLookup labels={t.facilities} />
          </>
        }
        rail={
          <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t.sourcesLabel}{" "}
              <a href={SFDA} target="_blank" rel="noopener noreferrer" className={link}>
                {t.sfdaName}
              </a>{" "}
              ·{" "}
              <a href={CBAHI} target="_blank" rel="noopener noreferrer" className={link}>
                {t.cbahiName}
              </a>{" "}
              ·{" "}
              <a href={CHI} target="_blank" rel="noopener noreferrer" className={link}>
                {t.chiName}
              </a>{" "}
              · {t.portalName} (
              <a href={LICENSE} target="_blank" rel="noopener noreferrer" className={link}>
                {t.licenseName}
              </a>
              ). {t.disclaimer}
            </p>
          </aside>
        }
      />
    </>
  );
}
