"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArticleStatus } from "@prisma/client";
import { CalendarCheck, ExternalLink, FileWarning, Gauge, ImageOff, Loader2, PenLine, Search, Workflow } from "lucide-react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { Input } from "@/components/ui/input";
import { CountTab } from "@/components/admin/count-tab";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { getArticleSeoScore } from "@/lib/seo/article-seo-score";
import { cn } from "@/lib/utils";
import { STATUS_TONE } from "../helpers/status-colors";
import { ArticlesFilters } from "./articles-filters";
import type { Article as ArticleViewType } from "../[id]/helpers/article-view-types";

type Article = ArticleViewType & { views: number };

const N = new Intl.NumberFormat("en-US");
const NO_WRITER = "none";
const day = (d: Date | string | null | undefined) => (d ? format(new Date(d), "d MMM yyyy") : "—");

/**
 * The attention cards — each IS its filter (entity-standard #4). Amber for all three «needs
 * work» cards: in the «Advanced Table» palette amber means «still to do», and the status colours
 * stay free for the statuses. Arabic labels, as on Client Quotas.
 */
type KpiKey = "publishedThisMonth" | "lowSeo" | "noImage" | "noDescription";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (a: Article, seo: number) => boolean }> = {
  publishedThisMonth: {
    label: "منشور هذا الشهر",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    icon: CalendarCheck,
    test: (a) => {
      if (a.status !== "PUBLISHED" || !a.datePublished) return false;
      const d = new Date(a.datePublished);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    },
  },
  lowSeo: {
    label: "سيو أقل من 60",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: Gauge,
    test: (_a, seo) => seo < 60,
  },
  noImage: {
    label: "بدون صورة رئيسية",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: ImageOff,
    test: (a) => !a.featuredImage,
  },
  noDescription: {
    label: "بدون وصف سيو",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: FileWarning,
    test: (a) => !a.seoDescription?.trim(),
  },
};

/** ✓ or the missing thing, in the colour of its meaning. */
function Check({ ok, missing }: { ok: boolean; missing: string }) {
  return ok ? (
    <span className="text-emerald-600 dark:text-emerald-400">موجود</span>
  ) : (
    <span className="text-amber-600 dark:text-amber-400">{missing}</span>
  );
}

/**
 * All Articles as an «Advanced Table» (Khalid, 27 Sep 2026: «طبّق الأدفانس تيبل على All
 * Articles»). Header: filters left (writer · status), attention cards right. Main row: the
 * basics. «+»: the article's content, quality and dates, with its links.
 *
 * Status stays a server filter (`?status=`, the page refetches); writer, cards and search are
 * client-side over the rows already loaded — the same split the old header had.
 */
export function ArticlesBoard({
  articles,
  clients,
  categories,
  authors,
  statusCounts,
}: {
  articles: Article[];
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  statusCounts: Record<ArticleStatus, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const status = params.get("status");
  const writer = params.get("writer");
  const kpi = (params.get("kpi") as KpiKey | null) ?? null;
  // Client-site articles live on their own page (Client-Site Articles) and this list never loads
  // them (getArticles: NOT isClientSiteArticle) — counting them here made «All» read 288 over
  // a table of 264 (27 Sep 2026). The pills show only what this table can show.
  const listed = Object.values(ArticleStatus).filter((s) => s !== "PUBLISHED_ON_CLIENT_SITE");
  const totalCount = listed.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);

  const setParam = (key: "status" | "writer" | "kpi", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    // Status refetches on the server — show it loading; the rest is instant.
    if (key === "status") startTransition(() => router.push(url));
    else router.replace(url, { scroll: false });
  };

  const seo = useMemo(() => new Map(articles.map((a) => [a.id, getArticleSeoScore(a)])), [articles]);

  // Writers present in the loaded rows (through each article's client), busiest first.
  const writers = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; count: number }>();
    let none = 0;
    for (const a of articles) {
      const ed = a.client?.editor;
      if (!ed?.id) { none++; continue; }
      const w = byId.get(ed.id) ?? { id: ed.id, name: ed.name?.trim() || "بلا اسم", count: 0 };
      w.count++;
      byId.set(ed.id, w);
    }
    return { list: [...byId.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)), none };
  }, [articles]);

  const byWriter = useMemo(
    () => (writer ? articles.filter((a) => (writer === NO_WRITER ? !a.client?.editor?.id : a.client?.editor?.id === writer)) : articles),
    [articles, writer],
  );
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return byWriter.filter((a) => {
      if (kpi && KPIS[kpi] && !KPIS[kpi].test(a, seo.get(a.id) ?? 0)) return false;
      if (!term) return true;
      return (
        a.title.toLowerCase().includes(term) ||
        !!a.client?.name.toLowerCase().includes(term) ||
        !!a.category?.name.toLowerCase().includes(term) ||
        !!a.client?.editor?.name?.toLowerCase().includes(term)
      );
    });
  }, [byWriter, kpi, search, seo]);

  const columns: Column<Article>[] = [
    {
      key: "title",
      header: "المقال",
      sortFn: (a, b) => a.title.localeCompare(b.title),
      render: (a) => (
        <div className="flex min-w-0 items-center gap-2.5 whitespace-normal">
          <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted" title={a.client?.name}>
            {mediaSrc(a.client?.logoMedia) ? (
              <OptimizedImage
                media={asMedia(mediaSrc(a.client?.logoMedia)!, a.client?.name ?? "")}
                alt={a.client?.name ?? ""}
                sizes="28px"
                width={28}
                height={28}
                className="size-full object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">{a.client?.name?.charAt(0).toUpperCase() ?? "?"}</span>
            )}
          </span>
          <span className="min-w-0">
            <Link
              href={`/articles/${a.id}`}
              onClick={(e) => e.stopPropagation()}
              className="line-clamp-1 font-medium hover:text-primary hover:underline"
              title={a.title}
            >
              {a.title}
            </Link>
            <span className="block truncate text-xs text-muted-foreground">{a.client?.name ?? "بلا عميل"}</span>
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortFn: (a, b) => a.status.localeCompare(b.status),
      className: "w-[1%]",
      render: (a) => (
        <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1", STATUS_TONE[a.status].badge)}>
          <span className={cn("size-1.5 rounded-full", STATUS_TONE[a.status].dot)} aria-hidden />
          {STATUS_TONE[a.status].label}
        </span>
      ),
    },
    {
      key: "writer",
      header: "الكاتب",
      className: "w-[1%]",
      sortFn: (a, b) => (a.client?.editor?.name ?? "~").localeCompare(b.client?.editor?.name ?? "~"),
      render: (a) =>
        a.client?.editor?.name ? <span dir="auto">{a.client.editor.name}</span> : <span className="text-muted-foreground">بلا كاتب</span>,
    },
    {
      key: "seo",
      header: "السيو",
      className: "w-[1%] text-center",
      sortFn: (a, b) => (seo.get(a.id) ?? 0) - (seo.get(b.id) ?? 0),
      render: (a) => <SeoScoreBadge score={seo.get(a.id) ?? 0} size="sm" />,
    },
    {
      key: "date",
      header: "التاريخ",
      className: "w-[1%] tabular-nums",
      sortFn: (a, b) =>
        new Date(a.datePublished || a.scheduledAt || a.createdAt).getTime() - new Date(b.datePublished || b.scheduledAt || b.createdAt).getTime(),
      render: (a) => <span className="text-xs text-muted-foreground">{day(a.datePublished || a.scheduledAt || a.createdAt)}</span>,
    },
  ];

  const details = (a: Article) => (
    <DetailCard
      columns="lg:grid-cols-[auto_1px_minmax(0,1fr)_1px_auto]"
      groups={[
        <FactGroup key="content" title="المحتوى">
          <Fact label="الفئة" value={<span className="text-sm font-semibold">{a.category?.name ?? "—"}</span>} />
          <Fact label="الكاتب" value={<span className="text-sm font-semibold">{a.author?.name ?? "—"}</span>} />
          <Fact label="الكلمات" value={a.wordCount ? N.format(a.wordCount) : "—"} />
          <Fact label="الأسئلة الشائعة" value={N.format(a.faqs?.length ?? 0)} />
        </FactGroup>,
        <FactGroup key="quality" title="الجودة" spread>
          <Fact label="درجة السيو" value={<SeoScoreBadge score={seo.get(a.id) ?? 0} size="sm" />} />
          <Fact label="المشاهدات" value={N.format(a.views)} tone={a.views > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"} />
          <Fact label="عنوان السيو" value={<Check ok={!!a.seoTitle?.trim()} missing="ناقص" />} />
          <Fact label="وصف السيو" value={<Check ok={!!a.seoDescription?.trim()} missing="ناقص" />} />
          <Fact label="الصورة الرئيسية" value={<Check ok={!!a.featuredImage} missing="ناقصة" />} />
          <Fact label="النص البديل للصورة" value={<Check ok={!!a.featuredImage?.altText?.trim()} missing={a.featuredImage ? "ناقص" : "—"} />} />
        </FactGroup>,
        <FactGroup key="dates" title="التواريخ">
          <Fact label="الإنشاء" value={<span className="text-sm">{day(a.createdAt)}</span>} />
          {a.scheduledAt ? <Fact label="الجدولة" value={<span className="text-sm">{day(a.scheduledAt)}</span>} tone={STATUS_TONE.SCHEDULED.text} /> : null}
          <Fact label="النشر" value={<span className="text-sm">{day(a.datePublished)}</span>} tone={a.datePublished ? STATUS_TONE.PUBLISHED.text : undefined} />
        </FactGroup>,
      ]}
      footer={
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link href={`/articles/${a.id}`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
            <ExternalLink className="size-3.5" /> افتح
          </Link>
          <Link href={`/articles/${a.id}/edit`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
            <PenLine className="size-3.5" /> تعديل
          </Link>
          <Link
            href={`/articles/pipeline/${a.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 px-2 py-1 font-medium text-purple-600 hover:bg-purple-500/10 dark:text-purple-400"
          >
            <Workflow className="size-3.5" /> المسار
          </Link>
        </div>
      }
    />
  );

  return (
    <div dir="rtl" className="space-y-3">
      <header className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">المقالات</h1>
        <span className="text-sm text-muted-foreground tabular-nums">({N.format(totalCount)})</span>
      </header>

      {/* Two panels: what you choose on the left, what needs attention on the right. */}
      {/* The cards keep a fixed 460px so their Arabic labels never truncate; the filters take the rest. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="الكاتب">
            <CountTab label="الكل" count={N.format(articles.length)} active={!writer} onClick={() => setParam("writer", null)} />
            {writers.list.map((w) => (
              <CountTab
                key={w.id}
                label={<span dir="auto">{w.name}</span>}
                count={N.format(w.count)}
                active={writer === w.id}
                onClick={() => setParam("writer", writer === w.id ? null : w.id)}
              />
            ))}
            {writers.none ? (
              <CountTab
                label="بلا كاتب"
                count={N.format(writers.none)}
                active={writer === NO_WRITER}
                onClick={() => setParam("writer", writer === NO_WRITER ? null : NO_WRITER)}
              />
            ) : null}
          </FilterRow>
          <FilterRow label="الحالة">
            <CountTab label="الكل" count={N.format(totalCount)} active={!status} onClick={() => setParam("status", null)} />
            {listed
              .filter((s) => statusCounts[s] > 0 || status === s)
              .map((s) => (
                <CountTab
                  key={s}
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", STATUS_TONE[s].dot)} aria-hidden />
                      {STATUS_TONE[s].label}
                    </span>
                  }
                  count={N.format(statusCounts[s])}
                  active={status === s}
                  onClick={() => setParam("status", status === s ? null : s)}
                />
              ))}
          </FilterRow>
        </section>
        <section aria-label="يحتاج انتباه">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(KPIS) as KpiKey[]).map((key) => {
              const k = KPIS[key];
              const hits = byWriter.filter((a) => k.test(a, seo.get(a.id) ?? 0)).length;
              return (
                <KpiToggle
                  variant="tile"
                  key={key}
                  meta={k}
                  icon={k.icon}
                  value={N.format(hits)}
                  active={kpi === key}
                  disabled={hits === 0 && kpi !== key}
                  onClick={() => setParam("kpi", kpi === key ? null : key)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <div className="relative">
        {isPending ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-20 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <Loader2 className="size-4 animate-spin text-primary" /> Loading…
            </span>
          </div>
        ) : null}
        <div className={isPending ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
          <DataTable
            data={visible}
            columns={columns}
            pageSize={20}
            emptyText="ما في مقالات بهذي الفلاتر."
            arabic
            toolbar={
              <>
                <div className="relative min-w-[220px] flex-1">
                  <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالمقال أو العميل أو الفئة…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-10"
                  />
                </div>
                <ArticlesFilters clients={clients} categories={categories} authors={authors} />
              </>
            }
            renderExpanded={details}
            expandLabel={(a) => `تفاصيل ${a.title}`}
          />
        </div>
      </div>
    </div>
  );
}
