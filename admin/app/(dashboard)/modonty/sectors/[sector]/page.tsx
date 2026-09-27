import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";

import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { cn } from "@/lib/utils";
import { PicksPanel } from "@/components/shared/article-picks/picks-panel";
import { PickToggle } from "@/components/shared/article-picks/pick-toggle";
import { LIVE_SECTORS, SECTOR_PICK_LIMIT } from "@modonty/shared/lib/sectors/live-sectors";
import { reorderSectorPicks, setSectorPick } from "../actions";
import { getPage } from "../../setting/actions/page-actions";
import { getPageConfig } from "../../setting/helpers/page-config";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { PageFormWrapper } from "../../components/page-form-wrapper";
import { SectorHeroForm } from "./components/sector-hero-form";
import { SECTOR_TABS, SectorTabs, type SectorTab } from "./components/sector-tabs";

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });
const N = new Intl.NumberFormat("ar-EG");

interface SectorPageProps {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export async function generateMetadata({ params }: SectorPageProps) {
  const { sector: slug } = await params;
  const sector = LIVE_SECTORS.find((s) => s.slug === slug);
  return { title: sector ? `Sector · ${sector.adminLabel}` : "Sector" };
}

/**
 * **صفحة قطاعٍ من صفحات مدونتي — تُدار من هنا** (خالد ٢٧ سبتمبر ٢٠٢٦: «جوا السايد بار تبع مدونتي تكون
 * فيها الصفحات أو السيكتورز… والكنترول يكون من هناك»). كل قطاعٍ حيّ (`LIVE_SECTORS`) بندٌ في قائمة
 * Modonty › Sectors، وهذه صفحته، بثلاثة أقسام في تبويبات (خالد ٢٨ سبتمبر ٢٠٢٦: كانت مكدّسةً في صفحةٍ
 * واحدة «تشويش بصري»): «الصفحة» (الهيرو ثم السيو — «ما في داتا كثيرة فيهم») · «المقالات» («من مدونتي»
 * بترتيب المحرّر). يُرسم القسم المفتوح فقط.
 */
export default async function SectorAdminPage({ params, searchParams }: SectorPageProps) {
  const [{ sector: slug }, { q, tab: rawTab }] = await Promise.all([params, searchParams]);
  const sector = LIVE_SECTORS.find((s) => s.slug === slug);
  if (!sector) notFound();
  const tab: SectorTab = SECTOR_TABS.find((t) => t === rawTab) ?? "page";
  const base = `/modonty/sectors/${sector.slug}`;

  // Modonty's own articles only (Khalid, 27 Sep 2026): «اعرض الارتكل بس اللي تخص العميل اللي اسمه مدونتي
  // لانه مدونتي هو اللي حيكون مسؤول عن كل السيكتورز». No core client configured ⇒ an empty library.
  const coreClientId = await getCoreClientId();
  const now = new Date();
  const [all, pickRows, siteUrl, pageResult, settings, sectorPage] = await Promise.all([
    db.article.findMany({
      where: { clientId: coreClientId ?? "000000000000000000000000", status: "PUBLISHED", OR: [{ datePublished: null }, { datePublished: { lte: now } }] },
      orderBy: [{ datePublished: "desc" }, { id: "desc" }],
      take: 500,
      select: { id: true, title: true, datePublished: true },
    }),
    db.sectorPick.findMany({
      where: { sector: sector.slug },
      orderBy: { order: "asc" },
      select: { article: { select: { id: true, title: true, datePublished: true } } },
    }),
    loadSiteUrl(),
    getPage(sector.slug),
    getAllSettings(),
    db.sectorPage.findUnique({
      where: { sector: sector.slug },
      select: {
        heroTitle: true,
        heroSubtitle: true,
        heroMedia: { select: { id: true, url: true, bunnyUrl: true } },
        heroMobileMedia: { select: { id: true, url: true, bunnyUrl: true } },
      },
    }),
  ]);
  const pageConfig = getPageConfig(sector.slug);

  const picks = pickRows.map((p) => ({ id: p.article.id, title: p.article.title, meta: p.article.datePublished ? dateFmt.format(p.article.datePublished) : "—" }));
  const pickedIds = new Set(picks.map((p) => p.id));
  const full = picks.length >= SECTOR_PICK_LIMIT;
  const needle = q?.trim().toLowerCase() ?? "";
  const rows = all.filter((a) => !needle || a.title.toLowerCase().includes(needle));

  const onPick = setSectorPick.bind(null, sector.slug);
  const onReorder = reorderSectorPicks.bind(null, sector.slug);

  const seoPage = pageResult.success ? pageResult.page : null;
  const heroDone = Boolean(sectorPage?.heroMedia && sectorPage?.heroMobileMedia && sectorPage?.heroTitle);
  const seoDone = Boolean(seoPage?.seoTitle && seoPage?.seoDescription);
  const status = {
    page: { text: heroDone && seoDone ? "جاهزة" : "ناقصة", done: heroDone && seoDone },
    articles: { text: `${N.format(picks.length)} من ${N.format(SECTOR_PICK_LIMIT)}`, done: picks.length > 0 },
  };

  return (
    <div dir="rtl" className="space-y-4 px-4 pb-6 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold">صفحة {sector.label}</h1>
        <a
          href={`${(siteUrl ?? "https://www.modonty.com").replace(/\/+$/, "")}/modonty/${sector.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          افتح الصفحة في مدونتي
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      <SectorTabs base={base} active={tab} status={status} />

      {tab === "page" &&
        (coreClientId ? (
          <SectorHeroForm
            sector={sector.slug}
            sectorLabel={sector.label}
            coreClientId={coreClientId}
            initial={{
              heroTitle: sectorPage?.heroTitle ?? "",
              heroSubtitle: sectorPage?.heroSubtitle ?? "",
              desktop: { mediaId: sectorPage?.heroMedia?.id ?? null, url: sectorPage?.heroMedia ? sectorPage.heroMedia.bunnyUrl || sectorPage.heroMedia.url : "" },
              mobile: { mediaId: sectorPage?.heroMobileMedia?.id ?? null, url: sectorPage?.heroMobileMedia ? sectorPage.heroMobileMedia.bunnyUrl || sectorPage.heroMobileMedia.url : "" },
            }}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">حدّد عميل مدونتي في الإعدادات أوّلاً — صور الهيرو من مكتبته.</p>
        ))}

      {tab === "articles" && (
        <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-1.5 lg:sticky lg:top-4">
            <PicksPanel title="من مدونتي" picks={picks} slots={SECTOR_PICK_LIMIT} onPick={onPick} onReorder={onReorder} />
            <p className="px-1 text-[11px] text-muted-foreground">
              هذي المقالات تطلع في قسم «من مدونتي» بصفحة {sector.label}، بنفس الترتيب. بدون اختيار يختفي القسم.
            </p>
          </div>

          <section aria-label="المكتبة" className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <form action={base} className="relative min-w-[220px] flex-1">
                <input type="hidden" name="tab" value="articles" />
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="ابحث بالعنوان"
                  className="h-8 w-full rounded-md border bg-card ps-8 pe-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </form>
              <span className="text-[11px] text-muted-foreground tabular-nums">{N.format(rows.length)} مقال لمدونتي</span>
            </div>

            {rows.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">لا نتائج.</p>
            ) : (
              <ul className="divide-y rounded-lg border bg-card">
                {rows.map((a) => {
                  const picked = pickedIds.has(a.id);
                  return (
                    <li key={a.id} className={cn("flex items-center gap-3 px-3 py-2", picked && "bg-primary/[0.05]")}>
                      <div className="min-w-0 flex-1">
                        <Link href={`/articles/${a.id}`} className="block truncate text-[13px] font-medium hover:underline">
                          {a.title}
                        </Link>
                        {a.datePublished ? (
                          <p className="truncate text-[11px] text-muted-foreground">{dateFmt.format(a.datePublished)}</p>
                        ) : null}
                      </div>
                      <PickToggle articleId={a.id} picked={picked} full={full} onPick={onPick} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* The page's SEO — title, description, share image, robots, and the JSON-LD graph with its
          validator — the same editor Modonty › Pages uses, so a sector is managed in one place. */}
      {tab === "page" && pageConfig ? (
        <section aria-label="السيو" className="border-t pt-5">
          <PageFormWrapper
            slug={sector.slug}
            pageLabel={`${sector.label} — السيو والمشاركة`}
            pageDescription={`${pageConfig.description} — ${pageConfig.modontyPath}`}
            pageData={seoPage}
            settingsDefaults={{
              siteUrl: settings.siteUrl ?? "https://modonty.com",
              twitterSite: settings.twitterSite ?? "",
              twitterCreator: settings.twitterCreator ?? "",
              logoUrl: settings.logoUrl ?? "",
              defaultMetaRobots: settings.defaultMetaRobots ?? "index, follow",
              defaultGooglebot: settings.defaultGooglebot ?? "index, follow",
              defaultOgType: settings.defaultOgType ?? "website",
              defaultOgLocale: settings.defaultOgLocale ?? "ar_SA",
              defaultOgDeterminer: settings.defaultOgDeterminer ?? "auto",
              defaultTwitterCard: settings.defaultTwitterCard ?? "summary_large_image",
              defaultSitemapPriority: settings.defaultSitemapPriority ?? 0.5,
              defaultSitemapChangeFreq: settings.defaultSitemapChangeFreq ?? "monthly",
            }}
            coreClientId={coreClientId}
            seoOnly
            withPreview={false}
          />
        </section>
      ) : null}
    </div>
  );
}
