import type { Metadata } from "next";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconFootball } from "@/lib/icons";
import { fill, messages } from "@/lib/i18n/messages";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { generateBreadcrumbStructuredData, generateStructuredData, jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

import { Suspense } from "react";

import { AlertsCard, AlertsCardSkeleton } from "./components/alerts-card/AlertsCard";
import { FixturesCard } from "./components/fixtures-card/FixturesCard";
import { MatchHero } from "./components/match-hero/MatchHero";
import { OthersCard } from "./components/others-card/OthersCard";
import { PromoHero } from "./components/promo-hero/PromoHero";
import { SeasonFacts } from "./components/season-facts/SeasonFacts";
import { ScorersCard } from "./components/scorers-card/ScorersCard";
import { StandingsCard } from "./components/standings-card/StandingsCard";
import { getFootballPage } from "./data/get-football-page";
import { SectorArticles } from "../components/sector-articles/SectorArticles";
import { getSectorArticles } from "../data/get-sector-articles";
import { getSectorHero } from "../data/get-sector-hero";

const t = messages.modonty.football;
const PATH = "/modonty/football";

/**
 * The page's SEO lives in the admin (Modonty › Sectors › Football) like every content page's:
 * title, description, share image, robots and the JSON-LD graph (Khalid, 27 Sep 2026: «كل سيكتور
 * عنده الصورة الخاصة فيه… والتايتل… حتى الجيسون ال دي»). Until the row is saved there, the same
 * builder fills canonical, locales, og: and twitter: from Settings and the fallbacks below.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("football"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/football` — the first live sector page (27 Sep 2026). A folder of its own, so Next
 * matches it before `[sector]`, which keeps serving «قريباً» for the five sectors still unbuilt.
 *
 * Free sources only (Khalid). Since 15 Oct 2026 the radar server (`automation/football/`) pulls the
 * official league site and 365Scores, cross-checks them and sends the page ready; this page only
 * reads that one row. Mockup: `../documentation/FOOTBALL-MOCKUP.html`.
 */
export default async function FootballPage() {
  const [page, articles, { siteName }, seoRow] = await Promise.all([
    getFootballPage(),
    getSectorArticles("football"),
    getPageSeoDefaults(),
    getContentPageRow("football"),
  ]);
  const hero = page.lead ? null : await getSectorHero("football");

  const updated = page.updatedAt
    ? fill(t.updated, {
        time: new Intl.DateTimeFormat(SITE_LOCALE, {
          timeZone: "Asia/Riyadh",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(page.updatedAt)),
      })
    : null;

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
          <IconFootball aria-hidden className="size-8 text-primary" />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.lead}
          {updated && ` · ${updated}`}
        </p>
      </div>
    </>
  );

  // Prefer the graph the admin generated and validated (like /about); build this one only while
  // the row has none. BreadcrumbList earns the trail in the result; WebPage says what the page is
  // about — no standings or scores in markup that the visible page does not carry.
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
      ...(page.updatedAt ? { dateModified: page.updatedAt } : {}),
      about: { "@type": "SportsOrganization", name: "دوري روشن السعودي", alternateName: "Saudi Pro League", sport: "Soccer" },
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
          {/* A match leads when there is one, with the alert strip under it; on other days the
              promo hero (image + text from the admin) takes the spot — Khalid, 27 Sep 2026. */}
          {page.lead ? (
            <>
              <MatchHero match={page.lead} crests={page.crests} today={page.days.today.date} />
              {/* Reads the session — its own Suspense so the rest of the page stays static. */}
              <Suspense fallback={<AlertsCardSkeleton />}>
                <AlertsCard />
              </Suspense>
            </>
          ) : hero ? (
            <PromoHero hero={hero} />
          ) : null}
          <FixturesCard days={page.days} crests={page.crests} />
          {/* Our articles within the first two screens, right after the first live card (NN/g 2018). */}
          <SectorArticles articles={articles} />
          <StandingsCard rows={page.table?.rows ?? null} crests={page.crests} />
          <OthersCard groups={page.others} crests={page.crests} />
        </>
      }
      rail={
        <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
          {/* الهدّافون يعودون فقط إن طابق الموقعُ الرسمي 365Scores في أوّل خمسة (خالد ٢٧ سبتمبر ٢٠٢٦: «لازم
              مية في المية» — ويكيبيديا أعطت لاكازيت ٣ والصحيح ٥). السيرفر يرسل القائمة فارغةً إن لم تتطابق. */}
          {page.table?.scorers.length ? <ScorersCard scorers={page.table.scorers} crests={page.crests} /> : null}
          <SeasonFacts rows={page.table?.rows ?? null} crests={page.crests} />
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            {t.officialSource} ·{" "}
            <a
              href="https://www.spl.com.sa/ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link underline-offset-2 hover:underline"
            >
              spl.com.sa
            </a>
          </p>
        </aside>
      }
    />
    </>
  );
}
