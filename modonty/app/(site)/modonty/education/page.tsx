import type { Metadata } from "next";
import { Suspense } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconEducation } from "@/lib/icons";
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
import { CalendarCard } from "./components/calendar-card/CalendarCard";
import { HolidayCountdown } from "./components/holiday-countdown/HolidayCountdown";
import { ProgramLookup } from "./components/program-lookup/ProgramLookup";
import { SchoolLookup } from "./components/school-lookup/SchoolLookup";
import { calendar } from "./data/calendar";
import { schools } from "./data/schools";

const t = messages.modonty.education;
const PATH = "/modonty/education";
const ABOUT = { "@type": "Thing", name: "التعليم", alternateName: "Education", sameAs: "https://www.wikidata.org/wiki/Q8434" };
const ETEC = "https://open.data.gov.sa/ar/publishers/a1d3ee70-3479-4c5c-957e-138191417aa9";
const LICENSE = "https://open.data.gov.sa/ar/pages/policies/license";
const YEAR = new Intl.NumberFormat(SITE_LOCALE, { useGrouping: false });

/** SEO lives in the admin (Modonty › Sectors › Education), like the other sectors; these fill in until it is saved. */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("education"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/education` — the fourth live sector page (28 Sep 2026). Three questions students and
 * parents search for, each from its official source: how many days to the next holiday (the
 * Ministry of Education's calendar), how a school ranks in القدرات and التحصيلي, and whether a
 * university programme is accredited (both ETEC, open data licence).
 */
export default async function EducationPage() {
  const [articles, hero, { siteName }, seoRow] = await Promise.all([
    getSectorArticles("education"),
    getSectorHero("education"),
    getPageSeoDefaults(),
    getContentPageRow("education"),
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
        <h1 className="flex items-center gap-2.5 text-3xl font-bold">
          <IconEducation aria-hidden className="size-8 text-primary" />
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
            <SectorHeroBanner hero={hero} headingId="education-hero" title={hero.title || t.heroTitle}>
              <Suspense
                fallback={
                  <>
                    <p className={heroLineClass}>{hero.subtitle || t.heroLine}</p>
                    <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
                  </>
                }
              >
                <SectorAlertBody topic="education" path={PATH} guestLine={hero.subtitle || t.heroLine} memberLine={t.alerts.memberBody} onLine={t.alerts.onBody} />
              </Suspense>
            </SectorHeroBanner>
            <HolidayCountdown events={calendar.events} labels={t.countdown} />
            <SchoolLookup labels={{ ...t.schools, note: fill(t.schools.note, { year: YEAR.format(Math.max(...schools.years)) }) }} />
            {/* Our articles within the first two screens, right after the first live cards (NN/g 2018). */}
            <SectorArticles articles={articles} />
            <ProgramLookup labels={t.programs} />
          </>
        }
        rail={
          <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
            <CalendarCard events={calendar.events} labels={{ ...t.calendar, note: fill(t.calendar.note, { year: calendar.schoolYear }) }} />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t.sourcesLabel}{" "}
              <a href={calendar.source} target="_blank" rel="noopener noreferrer" className={link}>
                {t.moeName}
              </a>{" "}
              ·{" "}
              <a href={ETEC} target="_blank" rel="noopener noreferrer" className={link}>
                {t.etecName}
              </a>{" "}
              · {t.portalName} (
              <a href={LICENSE} target="_blank" rel="noopener noreferrer" className={link}>
                {t.licenseName}
              </a>
              ).
            </p>
          </aside>
        }
      />
    </>
  );
}
