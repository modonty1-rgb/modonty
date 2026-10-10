import type { Metadata } from "next";
import { Suspense } from "react";

import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconEntertainment } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { generateBreadcrumbStructuredData, generateStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

import { SectorAlertBody } from "../components/sector-alert/SectorAlertBody";
import { SectorArticles } from "../components/sector-articles/SectorArticles";
import { SectorHeroBanner, heroLineClass } from "../components/sector-hero/SectorHeroBanner";
import { TranslationCredit } from "../components/translation-credit/TranslationCredit";
import { getSectorArticles } from "../data/get-sector-articles";
import { getSectorHero } from "../data/get-sector-hero";
import { CityGuide } from "./components/city-guide/CityGuide";
import { getCityOptions } from "./data/get-city-options";
import { getCityPlaces } from "./data/get-city-places";
import { getHiddenPlaces } from "./data/get-hidden-places";

const t = messages.modonty.entertainment;
const PATH = "/modonty/entertainment";
const ABOUT = { "@type": "Thing", name: "الترفيه", alternateName: "Entertainment", sameAs: "https://www.wikidata.org/wiki/Q173799" };
const STA = "https://open.data.gov.sa/ar/publishers/acf00fb7-22fb-4cbc-b3e3-7bc5f160bafb";
const GEA = "https://open.data.gov.sa/ar/datasets/view/f739ffa0-6ba2-491c-84f6-b80bc5f58922";
const LICENSE = "https://open.data.gov.sa/ar/pages/policies/license";

/** SEO lives in the admin (Modonty › Sectors › Entertainment), like the other sectors; these fill in until it is saved. */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("entertainment"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/entertainment` — the fifth live sector page (28 Sep 2026): a family outings guide per
 * city, not cinema or concerts (Khalid: «ما حاروج لحاجه فيها شبهة»). هيئة السياحة's places,
 * experiences and restaurants, and هيئة الترفيه's family venues; the editor hides any place from the
 * admin. The busiest city is in the HTML; the others load when picked.
 */
export default async function EntertainmentPage() {
  const [articles, hero, { siteName }, seoRow, hidden] = await Promise.all([
    getSectorArticles("entertainment"),
    getSectorHero("entertainment"),
    getPageSeoDefaults(),
    getContentPageRow("entertainment"),
    getHiddenPlaces(),
  ]);
  const cities = getCityOptions(hidden);
  const first = cities[0];

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
          <IconEntertainment aria-hidden className="size-8 text-primary" />
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
            <SectorHeroBanner hero={hero} headingId="entertainment-hero" title={hero.title || t.heroTitle}>
              <Suspense
                fallback={
                  <>
                    <p className={heroLineClass}>{hero.subtitle || t.heroLine}</p>
                    <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
                  </>
                }
              >
                <SectorAlertBody topic="entertainment" path={PATH} guestLine={hero.subtitle || t.heroLine} memberLine={t.alerts.memberBody} onLine={t.alerts.onBody} />
              </Suspense>
            </SectorHeroBanner>
            {first && <CityGuide cities={cities} initial={getCityPlaces(first.key, hidden)} labels={t.guide} />}
            {/* Our articles within the first two screens, right after the live card (NN/g 2018). */}
            <SectorArticles articles={articles} />
          </>
        }
        rail={
          <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t.sourcesLabel}{" "}
              <a href={STA} target="_blank" rel="noopener noreferrer" className={link}>
                {t.staName}
              </a>{" "}
              ·{" "}
              <a href={GEA} target="_blank" rel="noopener noreferrer" className={link}>
                {t.geaName}
              </a>{" "}
              · {t.portalName} (
              <a href={LICENSE} target="_blank" rel="noopener noreferrer" className={link}>
                {t.licenseName}
              </a>
              ).
            </p>
            <TranslationCredit note={t.translatedNote} />
          </aside>
        }
      />
    </>
  );
}
