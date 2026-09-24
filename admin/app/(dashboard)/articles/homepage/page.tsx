import Link from "next/link";
import { Search } from "lucide-react";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { HOMEPAGE_ARTICLE_ORDER, HOMEPAGE_PICK_LIMIT } from "@modonty/shared/lib/articles/homepage-article-order";
import { HomepagePanel } from "./components/homepage-panel";
import { PickToggle } from "./components/pick-toggle";
import { IndustryFilter } from "./components/industry-filter";

export const metadata = { title: "Homepage Picks" };

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });
const N = new Intl.NumberFormat("ar-EG");

/**
 * **اختياراتُ الرئيسية** (خالد ٢٤ سبتمبر ٢٠٢٦: «أغلب عملائي دكاترة، فالزائر يفكّر إنها منصّة طبّية —
 * أبغى أختار الأرتيكلز اللي تظهر في الصفحة الأولى» · «أبغى أتحكّم في ترتيبها»).
 *
 * عمودان: يميناً «الرئيسية» — الاختياراتُ وحدها بترتيبها وعدّادُ «كم باقي» من العشر (`HomepagePanel`)؛
 * ويساراً المكتبةُ للبحث والاختيار. كانت ثلاثة أعمدة وقائمتان لنفس الشيء (خالد: «حشو كتير… تكون
 * وحدة»). والترتيبُ هنا وفي الرئيسية واحد (`HOMEPAGE_ARTICLE_ORDER`).
 */
export default async function HomepagePicksPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; show?: string; q?: string }>;
}) {
  const { industry, show, q } = await searchParams;
  const now = new Date();
  const all = await db.article.findMany({
    where: { status: "PUBLISHED", OR: [{ datePublished: null }, { datePublished: { lte: now } }] },
    orderBy: HOMEPAGE_ARTICLE_ORDER,
    take: 500,
    select: {
      id: true,
      title: true,
      featured: true,
      datePublished: true,
      client: { select: { name: true, industry: { select: { id: true, name: true } } } },
    },
  });

  const industryOf = (a: (typeof all)[number]) => a.client?.industry?.name ?? "بلا مجال";
  const slot = (a: (typeof all)[number]) => ({ id: a.id, title: a.title, industry: industryOf(a) });
  const picks = all.filter((a) => a.featured);
  const full = picks.length >= HOMEPAGE_PICK_LIMIT;
  const industries = [...new Map(all.filter((a) => a.client?.industry).map((a) => [a.client!.industry!.id, a.client!.industry!.name])).entries()];
  const needle = q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (a) =>
      (!industry || a.client?.industry?.id === industry) &&
      (show !== "picked" || a.featured) &&
      (!needle || a.title.toLowerCase().includes(needle) || (a.client?.name ?? "").toLowerCase().includes(needle)),
  );

  const href = (next: { industry?: string | null; show?: string | null }) => {
    const p = new URLSearchParams();
    const ind = next.industry === undefined ? industry : next.industry;
    const sh = next.show === undefined ? show : next.show;
    if (ind) p.set("industry", ind);
    if (sh) p.set("show", sh);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/articles/homepage${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) =>
    cn("rounded-full border px-2 py-0.5 text-[11.5px] transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted");

  return (
    <div dir="rtl" className="space-y-3 px-4 pb-4 sm:px-5">
      <h1 className="text-base font-bold">اختيارات الرئيسية</h1>

      <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4">
          <HomepagePanel picks={picks.map(slot)} slots={HOMEPAGE_PICK_LIMIT} />
        </div>

        <section aria-label="المكتبة" className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <form action="/articles/homepage" className="relative min-w-[220px] flex-1">
              {industry ? <input type="hidden" name="industry" value={industry} /> : null}
              {show ? <input type="hidden" name="show" value={show} /> : null}
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="ابحث بالعنوان أو الشريك"
                className="h-8 w-full rounded-md border bg-card ps-8 pe-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </form>
            <Link href={href({ show: null })} className={chip(show !== "picked")}>الكل</Link>
            <Link href={href({ show: "picked" })} className={chip(show === "picked")}>المختارة</Link>
            <IndustryFilter industries={industries} />
            <span className="text-[11px] text-muted-foreground tabular-nums">{N.format(rows.length)} مقال</span>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">لا نتائج.</p>
          ) : (
            <ul className="divide-y rounded-lg border bg-card">
              {rows.map((a) => (
                <li key={a.id} className={cn("flex items-center gap-3 px-3 py-2", a.featured && "bg-primary/[0.05]")}>
                  <div className="min-w-0 flex-1">
                    <Link href={`/articles/${a.id}`} className="block truncate text-[13px] font-medium hover:underline">
                      {a.title}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {a.client?.name ?? "—"} · {industryOf(a)}
                      {a.datePublished ? ` · ${dateFmt.format(a.datePublished)}` : ""}
                    </p>
                  </div>
                  <PickToggle articleId={a.id} picked={a.featured} full={full} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
