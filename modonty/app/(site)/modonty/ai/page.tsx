import type { Metadata } from "next";
import { Suspense } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { IconAi } from "@/lib/icons";
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
import { ModelsCard } from "./components/models-card/ModelsCard";
import { PapersCard } from "./components/papers-card/PapersCard";
import { ReposCard } from "./components/repos-card/ReposCard";
import { TranslationCredit } from "./components/translation-credit/TranslationCredit";
import { getAiPage } from "./data/get-ai-page";

const t = messages.modonty.ai;
const PATH = "/modonty/ai";
const ABOUT = { "@type": "Thing", name: "الذكاء الاصطناعي", alternateName: "Artificial intelligence", sameAs: "https://www.wikidata.org/wiki/Q11660" };

/** SEO lives in the admin (Modonty › Sectors › AI), like football's; these fill in until it is saved. */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("ai"), {
    path: PATH,
    fallbackTitle: t.metaTitle,
    fallbackDescription: t.metaDescription,
  });
}

/**
 * `/modonty/ai` — the second live sector page (28 Sep 2026), on football's template. Three open
 * sources whose terms allow a commercial site to list them: the Hugging Face Hub (trending and
 * Arabic models), arXiv (papers on Arabic, metadata CC0) and GitHub (rising open projects). Plan
 * and evidence: `../documentation/SECTORS-PLAN.html`.
 */
export default async function AiPage() {
  const [page, articles, hero, { siteName }, seoRow] = await Promise.all([
    getAiPage(),
    getSectorArticles("ai"),
    getSectorHero("ai"),
    getPageSeoDefaults(),
    getContentPageRow("ai"),
  ]);

  const updated = page.updatedAt
    ? fill(t.updated, {
        time: new Intl.DateTimeFormat(SITE_LOCALE, { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit" }).format(new Date(page.updatedAt)),
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
        <h1 className="flex items-center gap-2.5 text-3xl font-bold">
          <IconAi aria-hidden className="size-8 text-primary" />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.lead}
          {updated && ` · ${updated}`}
        </p>
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
      ...(page.updatedAt ? { dateModified: page.updatedAt } : {}),
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
            {/* The weekly digest invitation streams in per reader, like football's alert (28 Sep 2026). */}
            <SectorHeroBanner hero={hero} headingId="ai-hero" title={hero.title || t.heroTitle}>
              <Suspense
                fallback={
                  <>
                    <p className={heroLineClass}>{hero.subtitle || t.heroLine}</p>
                    <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
                  </>
                }
              >
                <SectorAlertBody topic="ai" path={PATH} guestLine={hero.subtitle || t.heroLine} memberLine={t.alerts.memberBody} onLine={t.alerts.onBody} />
              </Suspense>
            </SectorHeroBanner>
            <ModelsCard id="ai-trending" title={t.trendingTitle} note={t.trendingNote} models={page.trending} />
            {/* Our articles within the first two screens, right after the first live card (NN/g 2018). */}
            <SectorArticles articles={articles} />
            <ModelsCard id="ai-arabic" title={t.arabicTitle} note={t.arabicNote} models={page.arabic} />
            <PapersCard papers={page.papers} />
          </>
        }
        rail={
          <aside className="w-full shrink-0 space-y-4 lg:w-[300px]">
            <ReposCard repos={page.repos} />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {t.sourcesLabel}{" "}
              <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                Hugging Face
              </a>{" "}
              ·{" "}
              <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                arXiv
              </a>{" "}
              ·{" "}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-link underline-offset-2 hover:underline">
                GitHub
              </a>
              . {t.englishNote}
            </p>
            <TranslationCredit />
          </aside>
        }
      />
    </>
  );
}
