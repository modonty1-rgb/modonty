import Link from "next/link";
import { SearchCheck } from "lucide-react";

import {
  articleSeoQuality,
  clientSeoQuality,
  contentPagesSeoAudit,
  listingPagesSeoAudit,
  mediaCounts,
  sectorPagesSeoAudit,
  referenceSeoCounts,
} from "@/lib/dashboard/cached";
import { cn } from "@/lib/utils";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * «صحة السيو» — one bar per scored family, the breakdown of the platform number above it.
 * These were five separate places on the old page (the platform card, the Articles and
 * Clients section headers, Pages SEO, Media and Categories). Same cached fetches as the tabs.
 *
 * The media bar is the one derived figure: the share of images scoring 60 or more —
 * the old page showed only the failing count.
 */
export async function SeoSummaryCard() {
  const [articles, clients, listing, content, sectors, media, reference] = await Promise.all([
    articleSeoQuality(),
    clientSeoQuality(),
    listingPagesSeoAudit(),
    contentPagesSeoAudit(),
    sectorPagesSeoAudit(),
    mediaCounts(),
    referenceSeoCounts(),
  ]);

  const nArticles = articles.perfect + articles.below;
  const nClients = clients.perfect + clients.below;
  const platform = nArticles + nClients > 0 ? Math.round((articles.sumScore + clients.sumScore) / (nArticles + nClients)) : 0;

  const pages = [...listing, ...content, ...sectors];
  const pagesAvg = pages.length ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length) : 0;
  const pagesBelow = pages.filter((p) => p.score < 100).length;

  const mediaPass = media.total > 0 ? Math.round(((media.total - media.failingSeo) / media.total) * 100) : 100;
  const refFailing = reference.reduce((s, g) => s + g.failing, 0);
  const refTotal = reference.reduce((s, g) => s + g.total, 0);

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label="صحة السيو">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
          <SearchCheck className="size-4" aria-hidden />
          صحة السيو
        </h2>
        <span className="text-xs text-muted-foreground">تفصيل الـ{platform}٪ فوق</span>
      </div>
      <div className="px-4 py-1.5">
        <Bar href="/articles/segment/seo-imperfect" name="المقالات" note={`${n(articles.perfect)} من ${n(nArticles)} كاملة · ${n(articles.below)} فيها نقص`} pct={articles.avgScore} label={`${articles.avgScore}٪`} />
        <Bar href="/clients/segment/seo-imperfect" name="العملاء" note={`${n(clients.below)} فيهم نقص`} pct={clients.avgScore} label={`${clients.avgScore}٪`} />
        <Bar name="صفحات الموقع" note={pagesBelow > 0 ? `${n(pages.length)} صفحة — ${n(pagesBelow)} تحت 100` : `${n(pages.length)} صفحة كلها 100`} pct={pagesAvg} label={String(pagesAvg)} />
        <Bar href="/media/segment/failing-seo" name="الوسائط" note={`${n(media.failingSeo)} من ${n(media.total)} تحت 60`} pct={mediaPass} label={`${mediaPass}٪`} />
        <Bar name="التصنيفات" note={refFailing > 0 ? `${n(refFailing)} من ${n(refTotal)} تحت 60` : "0 تحت 60"} pct={refTotal > 0 ? Math.round(((refTotal - refFailing) / refTotal) * 100) : 100} label={refFailing > 0 ? `${n(refFailing)} تحت 60` : "سليمة"} />
      </div>
    </section>
  );
}

function Bar({ href, name, note, pct, label }: { href?: string; name: string; note: string; pct: number; label: string }) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold">{name}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <span className="h-2 overflow-hidden rounded-full bg-red-500/15" role="img" aria-label={`${name}: ${label}`}>
        <span className={cn("block h-full rounded-full", pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${pct}%` }} />
      </span>
      <span className="text-end text-sm font-extrabold tabular-nums">{label}</span>
    </>
  );
  const cls = "grid grid-cols-[8.5rem_1fr_4rem] items-center gap-3 border-b border-dashed py-2 last:border-b-0";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:bg-muted/30")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
