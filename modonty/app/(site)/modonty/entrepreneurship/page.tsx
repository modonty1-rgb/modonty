import type { Metadata } from "next";
import { Suspense } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconMarkets } from "@/lib/icons";
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
import { ActivityLookup } from "./components/activity-lookup/ActivityLookup";
import { CalculatorsCard } from "./components/calculators/CalculatorsCard";
import { TopActivitiesCard } from "./components/top-activities/TopActivitiesCard";
import { activities } from "./data/activities";
import { getTopActivities } from "./data/get-top-activities";

const t = messages.modonty.entrepreneurship;
const PATH = "/modonty/entrepreneurship";
const ABOUT = { "@type": "Thing", name: "ريادة الأعمال", alternateName: "Entrepreneurship", sameAs: "https://www.wikidata.org/wiki/Q3908516" };
const VAT_SOURCE = "https://zatca.gov.sa/en/RulesRegulations/VAT/Pages/default.aspx";
const LICENSE = "https://open.data.gov.sa/ar/pages/policies/license";
const TOP_COUNT = 8;

/** SEO lives in the admin (Modonty › Sectors › Entrepreneurship), like the other sectors; these fill in until it is saved. */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("entrepreneurship"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/entrepreneurship` — the third live sector page (28 Sep 2026), where «المال والأعمال»
 * was: stock prices need the exchange's paid licence, and Khalid wanted what helps someone make a
 * business succeed rather than figures. Its own data is the Ministry of Commerce's count of
 * commercial registrations per activity (open data licence) — «how many competitors does my
 * activity have» — beside two calculators and the sector's picked articles.
 */
export default async function EntrepreneurshipPage() {
  const [articles, hero, { siteName }, seoRow] = await Promise.all([
    getSectorArticles("entrepreneurship"),
    getSectorHero("entrepreneurship"),
    getPageSeoDefaults(),
    getContentPageRow("entrepreneurship"),
  ]);

  const period = fill(t.period, {
    quarter: t.quarters[String(activities.quarter) as keyof typeof t.quarters],
    year: new Intl.NumberFormat(SITE_LOCALE, { useGrouping: false }).format(activities.year),
  });

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
          <IconMarkets aria-hidden className="size-8 text-primary" />
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
            <SectorHeroBanner hero={hero} headingId="entrepreneurship-hero" title={hero.title || t.heroTitle}>
              <Suspense
                fallback={
                  <>
                    <p className={heroLineClass}>{hero.subtitle || t.heroLine}</p>
                    <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
                  </>
                }
              >
                <SectorAlertBody
                  topic="entrepreneurship"
                  path={PATH}
                  guestLine={hero.subtitle || t.heroLine}
                  memberLine={t.alerts.memberBody}
                  onLine={t.alerts.onBody}
                />
              </Suspense>
            </SectorHeroBanner>
            <ActivityLookup labels={{ ...t.lookup, note: fill(t.lookup.note, { period }) }} />
            {/* Our articles within the first two screens, right after the first live card (NN/g 2018). */}
            <SectorArticles articles={articles} />
            <CalculatorsCard />
          </>
        }
        rail={
          <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
            <TopActivitiesCard activities={getTopActivities(TOP_COUNT)} />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t.sourcesLabel}{" "}
              <a href={activities.source} target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                {t.mcName}
              </a>{" "}
              · {t.portalName} (
              <a href={LICENSE} target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                {t.licenseName}
              </a>
              ) ·{" "}
              <a href={VAT_SOURCE} target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                {t.vatSource}
              </a>
              . {t.disclaimer}
            </p>
          </aside>
        }
      />
    </>
  );
}
