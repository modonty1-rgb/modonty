import Link from "next/link";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { PickToggle } from "./components/pick-toggle";

export const metadata = { title: "Homepage Picks" };

/** صفحةُ رئيسية مدونتي الأولى — `FEED_PAGE_SIZE` في `modonty/lib/queries/feed-constants.ts`. */
const HOMEPAGE_FIRST_PAGE = 10;
const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" });
const N = new Intl.NumberFormat("ar-EG");

/**
 * **اختياراتُ الرئيسية** (خالد ٢٤ سبتمبر ٢٠٢٦: «أغلب عملائي دكاترة، فالزائر يفكّر إنها منصّة طبّية —
 * أبغى أختار الأرتيكلز اللي تظهر في الصفحة الأولى»).
 *
 * المختارُ يتصدّر رئيسيةَ مدونتي، وبعده البقيّة بالأحدث؛ وقائمةُ المقالات والتصنيفات بالأحدث لا
 * يمسّها الاختيار (`modonty/lib/queries/article-feed-shapes.ts` · `sortBy: "homepage"`). وأعلى
 * الصفحة ما يراه الزائرُ الآن مقسوماً بالمجال — فيُرى الميلُ الطبّيّ قبل الاختيار وبعده.
 */
export default async function HomepagePicksPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; show?: string }>;
}) {
  const { industry, show } = await searchParams;
  const now = new Date();
  const published = {
    status: "PUBLISHED" as const,
    OR: [{ datePublished: null }, { datePublished: { lte: now } }],
  };
  const select = {
    id: true,
    title: true,
    featured: true,
    datePublished: true,
    client: { select: { name: true, industry: { select: { id: true, name: true } } } },
  } as const;
  const homepageOrder = [{ featured: "desc" as const }, { datePublished: "desc" as const }, { id: "desc" as const }];

  const [firstPage, all] = await Promise.all([
    db.article.findMany({ where: published, orderBy: homepageOrder, take: HOMEPAGE_FIRST_PAGE, select }),
    db.article.findMany({ where: published, orderBy: homepageOrder, take: 500, select }),
  ]);

  const industryOf = (a: (typeof all)[number]) => a.client?.industry?.name ?? "بلا مجال";
  const tally = (rows: typeof all) => {
    const m = new Map<string, number>();
    for (const a of rows) m.set(industryOf(a), (m.get(industryOf(a)) ?? 0) + 1);
    return [...m.entries()].sort((x, y) => y[1] - x[1]);
  };
  const industries = [...new Map(all.filter((a) => a.client?.industry).map((a) => [a.client!.industry!.id, a.client!.industry!.name])).entries()];
  const pickedCount = all.filter((a) => a.featured).length;
  const rows = all.filter(
    (a) => (!industry || a.client?.industry?.id === industry) && (show !== "picked" || a.featured),
  );
  const href = (next: { industry?: string | null; show?: string | null }) => {
    const p = new URLSearchParams();
    const ind = next.industry === undefined ? industry : next.industry;
    const sh = next.show === undefined ? show : next.show;
    if (ind) p.set("industry", ind);
    if (sh) p.set("show", sh);
    const q = p.toString();
    return `/articles/homepage${q ? `?${q}` : ""}`;
  };
  const chip = (active: boolean) =>
    cn("rounded-full border px-2.5 py-1 text-xs transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted");

  return (
    <div className="space-y-4 p-4 sm:p-6" dir="rtl">
      <header>
        <h1 className="text-lg font-bold sm:text-xl">اختيارات الرئيسية</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          المقالاتُ المختارة تتصدّر رئيسيةَ مدونتي، وبعدها البقيّةُ بالأحدث. صفحةُ المقالات والتصنيفات لا تتأثّر.
        </p>
      </header>

      {/* ما يراه الزائرُ الآن — أوّلُ صفحةٍ في الرئيسية، مقسومةً بالمجال */}
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-bold">أوّل {N.format(HOMEPAGE_FIRST_PAGE)} مقالات في الرئيسية الآن</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tally(firstPage).map(([name, n]) => (
            <span key={name} className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs">
              {name} <b className="tabular-nums">{N.format(n)}</b>
            </span>
          ))}
        </div>
        <ol className="mt-3 grid gap-1 text-[13px] sm:grid-cols-2">
          {firstPage.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2 truncate">
              <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{N.format(i + 1)}</span>
              {a.featured ? <span className="text-primary" aria-label="مختار">★</span> : null}
              <span className="truncate">{a.title}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">· {industryOf(a)}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={href({ show: null })} className={chip(show !== "picked")}>الكل</Link>
        <Link href={href({ show: "picked" })} className={chip(show === "picked")}>
          المختارة <b className="tabular-nums">{N.format(pickedCount)}</b>
        </Link>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Link href={href({ industry: null })} className={chip(!industry)}>كل المجالات</Link>
        {industries.map(([id, name]) => (
          <Link key={id} href={href({ industry: id })} className={chip(industry === id)}>{name}</Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">لا مقالات بهذا الفلتر.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/60 text-[12px] font-bold">
                <th className="px-3 py-2 text-right">المقال</th>
                <th className="px-3 py-2 text-right">الشريك</th>
                <th className="px-3 py-2 text-right">المجال</th>
                <th className="px-3 py-2 text-right">النشر</th>
                <th className="px-3 py-2 text-right">الرئيسية</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className={cn("border-b last:border-0", a.featured && "bg-primary/[0.05]")}>
                  <td className="max-w-[420px] px-3 py-2 font-medium">
                    <Link href={`/articles/${a.id}`} className="line-clamp-2 hover:underline">{a.title}</Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{a.client?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{industryOf(a)}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">
                    {a.datePublished ? dateFmt.format(a.datePublished) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <PickToggle articleId={a.id} picked={a.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
