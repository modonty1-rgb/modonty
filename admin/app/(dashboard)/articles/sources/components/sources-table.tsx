"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, HelpCircle, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { checkSources, type DomainCheck } from "../actions/check-sources";
import { classifySource, type SourceVerdict } from "../helpers/classify-source";
import type { SourceDomain } from "../helpers/extract-article-sources";

/**
 * جرد مصادر المقالات — نطاقٌ في كل صفّ، لا رابطاً في كل صفّ.
 *
 * السبب: ويكيبيديا تتكرّر ٢٧ مرّة، والحكم عليها واحد. فصفٌّ لكل رابطٍ يجعل الجدول
 * مئات الصفوف تحمل نفس القرار — والقرار يخصّ النطاق لا الرابط.
 *
 * والفحص الخارجيّ **بطلبٍ لا تلقائيّاً**: RDAP نداءٌ لكل نطاق، فتحميل الصفحة لا
 * يجوز أن ينتظر تسعين نداءً. المحرّر يضغط «افحص» حين يريد.
 */

/**
 * المصطلح يُشرح في مكانه لا في رأس المحرّر.
 *
 * خالد ١٦ سبتمبر ٢٠٢٦ على النسخة الأولى: «الهيدر مو واضح، ايش يمرّر الثقة فيه،
 * في مصطلحات مو واضحة». فكلّ لفظٍ اصطلاحيّ هنا معه جملةٌ تشرحه لمن يقرأه أوّل مرّة.
 */
const VERDICT_STYLE: Record<SourceVerdict, { label: string; hint: string; cls: string; Icon: typeof CheckCircle2 }> = {
  trusted: {
    label: "موثوق",
    hint: "جهةٌ حكوميّة أو جامعة أو مرجعٌ عالميّ معروف — الرابط إليه يفيدنا.",
    cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-500",
    Icon: CheckCircle2,
  },
  neutral: {
    label: "لا نعرفه",
    hint: "موقعٌ عاديّ لا هو في قائمة المراجع ولا فيه علامة سوء — يُحسم بفحص عمر النطاق.",
    cls: "border-border bg-muted text-muted-foreground",
    Icon: HelpCircle,
  },
  suspect: {
    label: "مشبوه",
    hint: "اسمه أو لاحقته تشبه مواقع بيع الروابط — يُراجَع بعينٍ بشريّة قبل أن يُنشَر.",
    cls: "border-destructive/50 bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
  },
};

/** أقلّ من سنة = نطاقٌ حديث. كل مواقع السبام المقيسة كانت دون الشهرين. */
const YOUNG_DAYS = 365;

/** شرحُ «التزكية» — يُعاد في الشريط وفي رأس العمود، فيُكتب مرّةً واحدة. */
const FOLLOWED_HINT =
  "رابطٌ بلا nofollow: جوجل يقرأه توصيةً منّا بالموقع وينقل إليه جزءاً من قوّة مدونتي.";

/** قوّة النطاق: ما هي، ومن أين. */
const POWER_HINT =
  "قوّة النطاق من ٠ إلى ١٠، محسوبةً من عدد المواقع الّتي تربط إليه في فهرس Common Crawl المفتوح (OpenPageRank). الموقع القويّ يصعب أن يكون مزرعة روابط.";

/**
 * الغياب عن الفهرس ليس حكماً: قِيس ١٦ سبتمبر ٢٠٢٦ أنّ `modonty.com` و`jbrseo.com`
 * نفسيهما ليسا في فهرس Common Crawl، بينما `who.int` فيه بـ٩٫٢٦.
 */
const UNINDEXED_HINT =
  "الموقع ليس في فهرس Common Crawl المفتوح — وهذا ليس حكماً عليه: مدونتي نفسها ليست فيه. اقرأ عمر النطاق بدله.";

/** تحت هذا الحدّ يكون الموقع بلا وزنٍ يُذكر على الويب — إشارةٌ لا حكم. */
const WEAK_RANK = 3;

/** ما الّذي يفعله زرّ الفحص فعلاً — يُقال للمحرّر قبل أن يضغط. */
const SCAN_HINT =
  "يسأل سجلّ النطاقات: منذ متى وهذا الموقع مسجَّل؟ ويسأل جوجل: هل صنّفته خطراً؟ يستغرق ثوانيَ.";

/**
 * العمر بلغةٍ يقرأها الإنسان: «١١ سنة» لا «٤٬٠٢١ يوماً».
 * والجمع العربيّ أربع درجات — والرقم بالأرقام العربيّة كبقيّة الأدمن.
 */
function humanAge(days: number): string {
  const n = (v: number) => v.toLocaleString("ar-EG");
  if (days < 60) return `${n(days)} يوماً`;
  if (days < 365) return `${n(Math.round(days / 30))} أشهر`;
  const years = Math.floor(days / 365);
  if (years === 1) return "سنة واحدة";
  if (years === 2) return "سنتان";
  return years <= 10 ? `${n(years)} سنوات` : `${n(years)} سنة`;
}

type Filter = "all" | "suspect" | "neutral" | "trusted" | "followed";

export function SourcesTable({ domains, totalArticles, totalLinks }: { domains: SourceDomain[]; totalArticles: number; totalLinks: number }) {
  const [checks, setChecks] = useState<Record<string, DomainCheck>>({});
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const classified = useMemo(
    () => domains.map((d) => ({ ...d, ...classifySource(d.domain) })),
    [domains],
  );

  const counts = useMemo(() => ({
    all: classified.length,
    trusted: classified.filter((d) => d.verdict === "trusted").length,
    neutral: classified.filter((d) => d.verdict === "neutral").length,
    suspect: classified.filter((d) => d.verdict === "suspect").length,
    followed: classified.filter((d) => d.followed > 0).length,
  }), [classified]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classified.filter((d) => {
      if (q && !d.domain.includes(q)) return false;
      if (filter === "followed") return d.followed > 0;
      if (filter === "all") return true;
      return d.verdict === filter;
    });
  }, [classified, filter, query]);

  const runCheck = (targets: string[]) => {
    if (targets.length === 0) return;
    setNote(null);
    startTransition(async () => {
      const res = await checkSources({ domains: targets });
      if (!res.ok) { setNote(res.error); return; }
      setChecks((prev) => {
        const next = { ...prev };
        res.checks.forEach((c) => { next[c.domain] = c; });
        return next;
      });
      /** المفتاح الغائب يُقال صراحةً — عمودٌ فارغ بلا سببٍ يُقرأ عطلاً. */
      const missing = [
        !res.safeBrowsingOn ? "فحص جوجل (مفتاح Safe Browsing)" : null,
        !res.pageRankOn ? "قوّة الموقع (مفتاح OpenPageRank)" : null,
      ].filter(Boolean);
      setNote(missing.length ? `فحص العمر تمّ. وبقي بلا مفتاح: ${missing.join(" · ")}.` : null);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* الرقم الذي تُفتح الصفحة لأجله واحد: كم مصدراً مشبوهاً في مقالاتنا. */}
      <section className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 rounded-lg border bg-card px-4 py-3">
        {/* الصفر بالأرقام العربيّة نقطةٌ صغيرة لا رقمٌ يُقرأ، فالحالة الخالية تُكتب لفظاً. */}
        <div className="flex items-center gap-3">
          {counts.suspect > 0 ? (
            <span className="text-3xl font-bold leading-none tabular-nums text-destructive">
              {counts.suspect.toLocaleString("ar-EG")}
            </span>
          ) : (
            <CheckCircle2 className="size-8 shrink-0 text-emerald-500" aria-hidden />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold leading-none">
              {counts.suspect > 0 ? "مصدرٌ مشبوه" : "لا مصدر مشبوه"}
            </span>
            <span className="text-[11px] leading-none text-muted-foreground">
              {counts.suspect > 0
                ? "راجعها قبل أن تُنشر المقالات الّتي تحتويها."
                : "لا شيء في مقالاتنا يستدعي القلق الآن."}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground tabular-nums">
          {totalLinks} رابطاً خارجيّاً · {domains.length} موقعاً مختلفاً · في {totalArticles} مقالاً
        </p>
      </section>

      {/* المرشّحات، وتحتها شرحُ المصطلح الّذي لا يُفهم من اسمه. */}
      <section className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            { key: "suspect", label: "مشبوه", hint: VERDICT_STYLE.suspect.hint },
            { key: "neutral", label: "لا نعرفه", hint: VERDICT_STYLE.neutral.hint },
            { key: "trusted", label: "موثوق", hint: VERDICT_STYLE.trusted.hint },
            { key: "followed", label: "نُزكّيه لجوجل", hint: FOLLOWED_HINT },
            { key: "all", label: "الكل", hint: "كل المواقع الّتي نربط إليها." },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              title={tab.hint}
              onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                filter === tab.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
              )}
            >
              {tab.label}
              <span className={cn("rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                filter === tab.key ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground")}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <p className="max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">ما معنى «نُزكّيه لجوجل»؟</span>{" "}
          الرابط الّذي لا يحمل <code dir="ltr" className="rounded bg-muted px-1">rel="nofollow"</code> يقرأه
          جوجل توصيةً منّا بذلك الموقع، فينقل له جزءاً من قوّة مدونتي. ومع الموقع الجيّد
          هذا صحيح، ومع موقعٍ رديء نكون قد زكّينا من يضرّنا. أمّا رابط
          <code dir="ltr" className="mx-1 rounded bg-muted px-1">nofollow</code> فيصل إليه القارئ
          ولا تُنقل إليه توصية.
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-4 py-2.5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن نطاق…"
          className="h-8 max-w-56 text-xs"
        />
        <span className="h-4 w-px bg-border" aria-hidden />
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          title={SCAN_HINT}
          onClick={() => runCheck(rows.map((r) => r.domain).slice(0, 200))}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          افحص المعروض ({Math.min(rows.length, 200)})
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          title={SCAN_HINT}
          onClick={() => runCheck(classified.filter((d) => d.verdict !== "trusted").map((d) => d.domain).slice(0, 200))}
        >
          افحص ما لا نعرفه ({Math.min(counts.neutral + counts.suspect, 200)})
        </Button>
        {note ? <span className="text-[11px] text-muted-foreground">{note}</span> : null}
      </section>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="h-9 px-4 text-right text-[11px] font-semibold text-muted-foreground">الموقع</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground" title="حكمٌ فوريّ من اسم الموقع، قبل أي فحصٍ خارجيّ.">الحكم المبدئيّ</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground" title="منذ متى وهذا الموقع مسجَّل. مواقع بيع الروابط تُشترى وتُرمى خلال أشهر.">منذ متى وهو موجود</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground" title={POWER_HINT}>قوّة الموقع</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground" title="فحص Safe Browsing: هل صنّفت جوجل الموقع خطراً (برمجيّة خبيثة أو تصيّد)؟">فحص جوجل</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground">كم مقالاً</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground">كم رابطاً</th>
              <th className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground" title={FOLLOWED_HINT}>منها نُزكّيه</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = VERDICT_STYLE[row.verdict];
              const check = checks[row.domain];
              const young = check?.ageDays != null && check.ageDays < YOUNG_DAYS;
              const isOpen = open === row.domain;
              return (
                /* المفتاح على الغلاف لا على `<tr>` — الصفّ الواحد يخرج عنصرين
                   (الصفّ وتفصيله)، وReact يطلب المفتاح على الجذر الذي يعيده الـmap. */
                <Fragment key={row.domain}>
                  <tr
                    onClick={() => setOpen(isOpen ? null : row.domain)}
                    className={cn("cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/50",
                      isOpen && "bg-accent/40")}
                  >
                    <td className="px-4 py-2">
                      <span className="font-medium" dir="ltr">{row.domain}</span>
                      <a
                        href={`https://${row.domain}/`}
                        target="_blank"
                        rel="noreferrer nofollow"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`افتح ${row.domain}`}
                        className="ms-2 inline-block align-middle text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        title={style.hint}
                        className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold", style.cls)}
                      >
                        <style.Icon className="size-3" />
                        {style.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums">
                      {check
                        ? check.ageDays != null
                          ? <span
                              title={`مسجَّل منذ ${check.registered ?? "—"}`}
                              className={cn(young && "font-bold text-destructive")}
                            >
                              {humanAge(check.ageDays)}
                              {young ? <span className="ms-1 font-normal">— حديثٌ جدّاً</span> : null}
                            </span>
                          : <span className="text-muted-foreground">{check.error ?? "—"}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums">
                      {check?.pageRank != null ? (
                        <span
                          title={check.refDomains != null
                            ? `${check.refDomains.toLocaleString("ar-EG")} موقعاً يربط إليه`
                            : undefined}
                          className={cn("font-semibold", check.pageRank < WEAK_RANK ? "text-amber-500" : "text-foreground")}
                        >
                          {check.pageRank.toLocaleString("ar-EG", { maximumFractionDigits: 1 })}
                          <span className="font-normal text-muted-foreground"> / ١٠</span>
                        </span>
                      ) : check?.indexed === false ? (
                        <span title={UNINDEXED_HINT} className="text-[11px] text-muted-foreground">غير مفهرس</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {check?.threat
                        ? <span className="inline-flex items-center gap-1 rounded border border-destructive/50 bg-destructive/10 px-1.5 py-0.5 font-bold text-destructive"><ShieldAlert className="size-3" />{check.threat}</span>
                        : check ? <span className="text-emerald-500">لا خطر</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs tabular-nums">{row.articles}</td>
                    <td className="px-3 py-2 text-xs tabular-nums">{row.uses}</td>
                    <td className="px-3 py-2 text-xs tabular-nums">
                      {row.followed > 0
                        ? <span title={FOLLOWED_HINT} className="font-bold text-amber-500">{row.followed}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>

                  {isOpen ? (
                    <tr className="border-b bg-muted/20 last:border-0">
                      <td colSpan={8} className="px-4 py-3">
                        <p className="mb-2 text-[11px] text-muted-foreground">{row.reason} · أين يظهر:</p>
                        <ul className="flex flex-col gap-1">
                          {row.samples.map((use, n) => (
                            <li key={n} className="flex flex-wrap items-center gap-2 text-xs">
                              <Link href={`/articles/${use.articleId}`} className="font-medium underline-offset-2 hover:underline">
                                {use.articleTitle}
                              </Link>
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{use.articleStatus}</span>
                              {use.anchor ? <span className="text-muted-foreground">«{use.anchor}»</span> : null}
                              {!use.nofollow ? <span title={FOLLOWED_HINT} className="rounded border border-amber-500/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">نُزكّيه</span> : null}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">لا نطاق يطابق هذا المرشّح.</p>
        ) : null}
      </div>
    </div>
  );
}
