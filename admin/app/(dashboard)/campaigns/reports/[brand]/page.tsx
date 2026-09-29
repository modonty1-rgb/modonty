import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, BarChart3, SearchX } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { codeInName } from "../../helpers/code-in-name";
import { GENDER_TERM, OBJECTIVE_TERM, STATUS_TERM, ageTerm, audienceParts, campaignsCount, costUnit, isRunning, resultTerm } from "../helpers/meta-terms";
import { getMetaCampaignReport, type Brand, type ReportCampaign } from "../meta-live-report";
import { SummarySkeleton, TableSkeleton } from "../components/report-skeletons";
import { MakerFilter, ReportFilters, type PlatformFilter, type StatusFilter } from "./components/report-filters";
import { PendingSwap, ReportPendingProvider } from "./components/report-pending";

export const dynamic = "force-dynamic";

const BRAND_LABEL: Record<Brand, string> = { modonty: "مدونتي", jbrseo: "جبر سيو" };
const whole = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const precise = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });

function currentMonthInRiyadh() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit" }).formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}`;
}
function validMonth(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}
function monthRange(value: string) {
  const [year, month] = value.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { since: `${value}-01`, until: `${value}-${String(lastDay).padStart(2, "0")}` };
}
function formatMonth(value: string) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${value}-01T12:00:00+03:00`));
}
function formatDay(value: string) {
  return value
    ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${value}T12:00:00+03:00`))
    : "—";
}
function monthOptions(firstCampaignDate: string | null | undefined) {
  const current = currentMonthInRiyadh();
  const first = firstCampaignDate?.slice(0, 7);
  const start = validMonth(first) ? first : current;
  const [startYear, startMonth] = start.split("-").map(Number);
  const [currentYear, currentMonth] = current.split("-").map(Number);
  const months: string[] = [];
  for (let year = currentYear, month = currentMonth; year > startYear || (year === startYear && month >= startMonth); ) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return months;
}

/** What one result cost — for reach and impressions Meta prices per thousand, and so do we. */
function groupCost(spend: number, count: number, indicator: string) {
  if (count <= 0) return null;
  return resultTerm(indicator).perThousand ? (spend / count) * 1000 : spend / count;
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const label = brand === "modonty" || brand === "jbrseo" ? BRAND_LABEL[brand] : "";
  return { title: label ? `تقرير إعلانات ${label}` : "تقرير الإعلانات" };
}

/**
 * تقرير إعلانات ميتا بلغة الإدارة (خالد ٢٩ سبتمبر ٢٠٢٦). كلّ سطر يجيب ثلاثة أسئلة: كم صرفنا، وش جبنا،
 * وبكم الواحد. والتفاصيل (الوصول · الظهور · أين انصرف) تحت «+». الأرقام من ميتا كما هي؛ الأسماء
 * وحدها مترجمة (`helpers/meta-terms.ts`).
 */
export default async function BrandReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ period?: string; status?: string; by?: string; platform?: string }>;
}) {
  const { brand: brandParam } = await params;
  if (brandParam !== "modonty" && brandParam !== "jbrseo") notFound();
  const brand = brandParam;

  const query = await searchParams;
  const status: StatusFilter = query.status === "running" || query.status === "stopped" ? query.status : "all";
  const platform: PlatformFilter = query.platform === "facebook" || query.platform === "instagram" ? query.platform : "all";
  const platformLabel = platform === "facebook" ? "فيسبوك" : platform === "instagram" ? "إنستقرام" : "";
  const periodKey = query.period === "all" ? "all" : validMonth(query.period) ? query.period : currentMonthInRiyadh();
  const [report, briefs] = await Promise.all([
    getMetaCampaignReport(brand, periodKey === "all" ? "all" : monthRange(periodKey), platform),
    // Briefs live on Modonty only — their code in a Meta name links the row back to its brief.
    brand === "modonty" ? db.adCampaign.findMany({ select: { id: true, code: true }, take: 500 }) : Promise.resolve([]),
  ]);
  const codes = (briefs as { id: string; code: string | null }[]).flatMap((b) => (b.code ? [{ id: b.id, code: b.code }] : []));

  const periodLabel = periodKey === "all" ? "كل الفترة" : formatMonth(periodKey);
  const months = monthOptions(report.ok ? report.firstCampaignDate : null);
  const cur = report.ok ? currencyLabel(report.currency) : "";
  const money = (n: number) => `${whole.format(n)} ${cur}`;
  const moneyExact = (n: number) => `${precise.format(n)} ${cur}`;

  const everything = report.ok ? [...report.campaigns].sort((a, b) => b.spend - a.spend) : [];
  // «مين أعلن» — the people who built campaigns in this period, most campaigns first.
  const makerCount = new Map<string, number>();
  for (const c of everything) if (c.createdBy) makerCount.set(c.createdBy, (makerCount.get(c.createdBy) ?? 0) + 1);
  const makers = [...makerCount.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  const by = query.by && makerCount.has(query.by) ? query.by : "";
  // One person picked: every figure on the page is theirs. Their reach is the sum of their campaigns —
  // Meta de-duplicates people only at account level, so it is labelled as a sum.
  const all = by ? everything.filter((c) => c.createdBy === by) : everything;
  const totals = !report.ok
    ? { spend: 0, reach: 0, impressions: 0, linkClicks: 0 }
    : by
      ? all.reduce((t, c) => ({ spend: t.spend + c.spend, reach: t.reach + c.reach, impressions: t.impressions + c.impressions, linkClicks: t.linkClicks + c.linkClicks }), { spend: 0, reach: 0, impressions: 0, linkClicks: 0 })
      : report.totals;
  const visible = all.filter((c) => (status === "all" ? true : status === "running" ? isRunning(c.status) : !isRunning(c.status)));

  // «وش جبنا» — one card per result type, summed only across campaigns built for that same result.
  const groups = new Map<string, { count: number; spend: number; campaigns: number }>();
  for (const c of all) {
    if (!c.result) continue;
    const g = groups.get(c.result.indicator) ?? { count: 0, spend: 0, campaigns: 0 };
    g.count += c.result.count;
    g.spend += c.spend;
    g.campaigns += 1;
    groups.set(c.result.indicator, g);
  }
  const resultGroups = [...groups.entries()].sort((a, b) => b[1].spend - a[1].spend);
  const wasted = all.filter((c) => c.spend > 0 && (!c.result || c.result.count === 0));
  const wastedSpend = wasted.reduce((s, c) => s + c.spend, 0);
  const running = all.filter((c) => isRunning(c.status)).length;

  return (
    <ReportPendingProvider>
      <main dir="rtl" className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <BarChart3 className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">تقرير إعلانات {BRAND_LABEL[brand]}</h1>
              <p className="text-sm text-muted-foreground">من ميتا · تتحدّث كل ٥ دقائق · {periodLabel}{platformLabel ? ` · ${platformLabel} فقط` : ""}{by ? ` · حملات ${by}` : ""}</p>
            </div>
          </div>
        </header>

        {!report.ok ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">ما قدرنا نجيب التقرير: {report.error}</CardContent>
          </Card>
        ) : everything.length === 0 ? (
          <>
            {/* No spend in the period: the filters stay, or there is no way out of the empty month. */}
            <div className="flex justify-end">
              <ReportFilters period={periodKey} status={status} by={by} platform={platform} months={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
            </div>
            <PendingSwap skeleton={<><SummarySkeleton /><TableSkeleton /></>}>
              <EmptyReport what={`ما في إعلانات صرفت في ${periodLabel}`} hint="جرّب «كل الفترة» أو شهراً آخر." />
            </PendingSwap>
          </>
        ) : (
          <>
            <PendingSwap skeleton={<SummarySkeleton />}>
              {/* الصورة الكبيرة */}
              <section aria-label="الملخّص" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Big label="صرفنا" value={money(totals.spend)} sub={`على ${campaignsCount(all.length, whole.format)} · ${whole.format(running)} شغّالة الآن`} />
                <Big label="وصل الإعلان لـ" value={`${whole.format(totals.reach)} شخص`} sub={`ظهر ${whole.format(totals.impressions)} مرة${by ? " · مجموع حملاته" : ""}`} />
                <Big
                  label="نقروا على الرابط"
                  value={`${whole.format(totals.linkClicks)} نقرة`}
                  sub={totals.linkClicks > 0 ? `النقرة بـ ${moneyExact(totals.spend / totals.linkClicks)}` : "—"}
                />
                <Big
                  label="صرفنا بدون نتيجة"
                  value={money(wastedSpend)}
                  sub={wasted.length ? `${campaignsCount(wasted.length, whole.format)} ما جابت اللي انعملت عشانه` : "كل حملة جابت نتيجة"}
                  tone={wastedSpend > 0 ? "text-rose-700 dark:text-rose-400" : undefined}
                />
              </section>

              {/* وش جبنا */}
              {resultGroups.length > 0 ? (
                <section aria-labelledby="got-title" className="space-y-2">
                  <h2 id="got-title" className="text-sm font-semibold">وش جبنا</h2>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {resultGroups.map(([indicator, g]) => {
                      const term = resultTerm(indicator);
                      const cost = groupCost(g.spend, g.count, indicator);
                      return (
                        <div key={indicator} className="rounded-lg border bg-card p-3">
                          <p className="text-lg font-semibold tabular-nums">
                            {whole.format(g.count)} <span className="text-sm font-medium">{term.many}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cost != null ? `بـ ${moneyExact(cost)} ${costUnit(indicator)}` : "ولا نتيجة"} · صرفنا {money(g.spend)} على {campaignsCount(g.campaigns, whole.format)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </PendingSwap>

            {/* الحملات */}
            <section aria-labelledby="list-title" className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="list-title" className="text-sm font-semibold">الحملات · {whole.format(visible.length)}</h2>
                <span className="text-xs text-muted-foreground">الأكثر صرفاً أوّلاً · اضغط أيّ حملة للتفاصيل</span>
              </div>
              {/* All filters sit right above the table (Khalid, 29 Sep 2026) — period and state on one side,
                  who advertised on the other. */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <MakerFilter period={periodKey} status={status} by={by} platform={platform} makers={makers} />
                <ReportFilters period={periodKey} status={status} by={by} platform={platform} months={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
              </div>

              <PendingSwap skeleton={<TableSkeleton />}>
                {visible.length === 0 ? (
                  <EmptyReport
                    what={status === "running" ? "ما في حملات شغّالة الآن" : status === "stopped" ? "ما في حملات موقوفة" : "ما في حملات"}
                    hint={`في ${periodLabel}${by ? ` من حملات ${by}` : ""} — غيّر الحالة أو الفترة.`}
                  />
                ) : (
                  <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="hidden grid-cols-[minmax(0,2.2fr)_6rem_7rem_minmax(0,1.4fr)_minmax(0,1.2fr)_1.5rem] gap-3 border-b bg-muted/40 px-4 py-2 text-[11px] font-medium text-muted-foreground lg:grid">
                      <span>الحملة</span>
                      <span>الحالة</span>
                      <span>صرفنا</span>
                      <span>جابت</span>
                      <span>الواحد بكم</span>
                      <span />
                    </div>
                    <Accordion type="single" collapsible>
                      {visible.map((c) => (
                        <CampaignRow key={c.id} c={c} money={money} moneyExact={moneyExact} brief={codes.find((b) => codeInName(b.code, c.name)) ?? null} onePlatform={platform !== "all"} />
                      ))}
                    </Accordion>
                  </div>
                )}
              </PendingSwap>
            </section>
          </>
        )}
      </main>
    </ReportPendingProvider>
  );
}

function EmptyReport({ what, hint }: { what: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <SearchX className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">{what}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Big({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", tone)}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function CampaignRow({
  c,
  money,
  moneyExact,
  brief,
  onePlatform,
}: {
  c: ReportCampaign;
  money: (n: number) => string;
  moneyExact: (n: number) => string;
  brief: { id: string; code: string } | null;
  onePlatform: boolean;
}) {
  const status = STATUS_TERM[c.status] ?? { label: c.status || "—", tone: "text-muted-foreground" };
  const term = c.result ? resultTerm(c.result.indicator) : null;
  const nothing = c.spend > 0 && (!c.result || c.result.count === 0);
  const clickRate = c.impressions > 0 ? (c.linkClicks / c.impressions) * 100 : 0;
  const placed = c.placements.facebook + c.placements.instagram + c.placements.other;

  return (
    <AccordionItem value={c.id} className="border-b last:border-b-0">
      <AccordionTrigger className="px-4 py-3 text-start hover:bg-muted/30 hover:no-underline">
        <div className="grid flex-1 grid-cols-2 items-center gap-x-3 gap-y-1 lg:grid-cols-[minmax(0,2.2fr)_6rem_7rem_minmax(0,1.4fr)_minmax(0,1.2fr)]">
          <div className="col-span-2 min-w-0 lg:col-span-1">
            <p className="flex items-center gap-1.5">
              {brief ? (
                <span dir="ltr" className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold">{brief.code}</span>
              ) : null}
              <span className="truncate text-sm font-medium">{c.name}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              هدفها: {OBJECTIVE_TERM[c.objective] ?? (c.objective || "—")} · سوّاها: {c.createdBy ?? "غير معروف في سجل ميتا"}
            </p>
          </div>
          <span className={cn("text-xs font-semibold", status.tone)}>{status.label}</span>
          <span className="text-sm font-semibold tabular-nums">{money(c.spend)}</span>
          <span className={cn("text-sm tabular-nums", nothing && "text-rose-700 dark:text-rose-400")}>
            {c.result && term ? (
              <>
                <b>{whole.format(c.result.count)}</b> {term.many}
              </>
            ) : (
              "ما في نتيجة من ميتا"
            )}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {c.result?.cost != null && c.result.count > 0 ? `${moneyExact(c.result.cost)} ${costUnit(c.result.indicator)}` : "—"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3 rounded-md bg-muted/40 p-3">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <Detail label="وصل الإعلان لـ" value={`${whole.format(c.reach)} شخص`} />
            <Detail label="ظهر" value={`${whole.format(c.impressions)} مرة`} />
            <Detail label="نقروا على الرابط" value={`${whole.format(c.linkClicks)} نقرة`} />
            <Detail label="من كل ١٠٠ شافوه" value={`${precise.format(clickRate)} نقروا`} />
            <Detail label="تكلفة ١٬٠٠٠ ظهور" value={moneyExact(c.cpm)} />
            <Detail label="النقرة بـ" value={c.linkClicks > 0 ? moneyExact(c.spend / c.linkClicks) : "—"} />
            <Detail
              label="الميزانية"
              value={c.dailyBudget != null ? `${money(c.dailyBudget)} يومياً` : c.lifetimeBudget != null ? `${money(c.lifetimeBudget)} للحملة كلها` : "على مستوى المجموعات"}
            />
            <Detail label="الفترة" value={`${formatDay(c.dateStart)} — ${formatDay(c.dateStop)}`} />
          </dl>
          {/* مين استهدفنا — ومين وصلنا له فعلاً (خالد ٢٩ سبتمبر ٢٠٢٦: «الشريحة المستهدفة موجودة؟») */}
          {c.audience ? (
            <p className="text-xs">
              <b>استهدفنا:</b> {audienceParts(c.audience).join(" · ")}
              {c.audience.metaMayWiden ? <span className="text-muted-foreground"> · وميتا مسموح لها توسّع الجمهور بنفسها</span> : null}
            </p>
          ) : null}
          {c.segments.length > 0 ? (
            <div className="text-xs">
              <b>وصلنا فعلاً لـ:</b>
              {onePlatform ? <span className="text-muted-foreground"> (كل المنصات — ميتا لا تقسم العمر والجنس حسب المنصة)</span> : null}
              <ul className="mt-1 grid gap-1 sm:grid-cols-3">
                {c.segments.slice(0, 3).map((s) => (
                  <li key={`${s.age}-${s.gender}`} className="rounded border bg-background px-2 py-1">
                    <span className="font-medium">{GENDER_TERM[s.gender] ?? s.gender} {ageTerm(s.age)}</span>
                    <span className="block text-muted-foreground">
                      صرفنا {money(s.spend)} ({whole.format(c.spend > 0 ? (s.spend / c.spend) * 100 : 0)}٪)
                      {term && !c.result?.derived ? ` · ${whole.format(s.results)} ${term.many}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {placed > 0 ? (
            <p className="text-xs text-muted-foreground">
              وين انصرف:{" "}
              {[
                ["فيسبوك", c.placements.facebook],
                ["إنستقرام", c.placements.instagram],
                ["أماكن أخرى (شبكة ميتا · ثريدز · ماسنجر)", c.placements.other],
              ]
                .filter(([, v]) => (v as number) > 0)
                .map(([k, v]) => `${k} ${money(v as number)} (${whole.format(((v as number) / placed) * 100)}٪)`)
                .join(" · ")}
            </p>
          ) : null}
          {c.result?.derived ? (
            <p className="text-[11px] text-muted-foreground">
              ميتا ما رجّعت عمود «النتائج» لهذي الحملة — الرقم محسوب عندنا من نوع التحسين في المجموعة الإعلانية.
            </p>
          ) : null}
          {term && !term.known ? (
            <p className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3" aria-hidden /> نوع النتيجة هذا ما له اسم عندنا بعد — ظاهر باسمه من ميتا.
            </p>
          ) : null}
          <p className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
            <span>بدأت {formatDay(c.createdAt)}</span>
            {brief ? (
              <Link href={`/campaigns/${brief.id}/edit`} className="font-medium text-primary hover:underline">
                افتح البريف {brief.code} ↗
              </Link>
            ) : (
              <span>بلا بريف</span>
            )}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
