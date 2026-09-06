import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMetaCampaignReport, type Brand, type MetaCampaignReport } from "../meta-live-report";
import { ReportFilters } from "./components/report-filters";

export const dynamic = "force-dynamic";

const BRAND_LABEL: Record<Brand, string> = { modonty: "مدونتي", jbrseo: "جبر سيو" };
const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });
const PLATFORM_LABEL = { facebook: "Facebook", instagram: "Instagram" } as const;
const OBJECTIVE_LABEL: Record<string, string> = { OUTCOME_AWARENESS: "وعي", OUTCOME_ENGAGEMENT: "تفاعل", OUTCOME_LEADS: "عملاء محتملون", OUTCOME_SALES: "مبيعات", OUTCOME_TRAFFIC: "زيارات" };

function metric(value: string | number) { const parsed = Number(value); return Number.isFinite(parsed) ? number.format(parsed) : String(value); }
function formatDate(value: string) { return value ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(`${value}T12:00:00+03:00`)) : "غير متاح"; }
function objectiveLabel(value: string) { return OBJECTIVE_LABEL[value] ?? value; }
function total(rows: MetaCampaignReport[], key: "spend" | "impressions" | "clicks") { return rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0); }
function currentMonthInRiyadh() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit" }).formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}`;
}
function validMonth(value: string | undefined): value is string { return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)); }
function monthRange(value: string) {
  const [year, month] = value.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { since: `${value}-01`, until: `${value}-${String(lastDay).padStart(2, "0")}` };
}
function formatMonth(value: string) { return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${value}-01T12:00:00+03:00`)); }
function monthOptions(firstCampaignDate: string | null | undefined) {
  const current = currentMonthInRiyadh();
  const first = firstCampaignDate?.slice(0, 7);
  const start = validMonth(first) ? first : current;
  const [startYear, startMonth] = start.split("-").map(Number);
  const [currentYear, currentMonth] = current.split("-").map(Number);
  const months: string[] = [];
  for (let year = currentYear, month = currentMonth; year > startYear || (year === startYear && month >= startMonth);) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month -= 1;
    if (month === 0) { month = 12; year -= 1; }
  }
  return months;
}
function actionLabel(value: string | undefined) {
  const labels: Record<string, string> = { link_click: "نقرات الرابط", post_engagement: "تفاعلات المنشور", post_reaction: "تفاعلات المنشور", post: "تفاعلات المنشور", "onsite_conversion.messaging_conversation_started_7d": "محادثات بدأت", "onsite_conversion.messaging_user_depth_2_message_send": "رسائل متابعة", lead: "عملاء محتملون", purchase: "مشتريات" };
  return labels[value ?? ""] ?? value ?? "نتيجة Meta";
}
function validDate(value: string | undefined): value is string { return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))); }

function SummaryMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return <div className="flex flex-col gap-1"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="text-lg font-semibold tracking-tight">{value}{unit ? <span className="text-sm font-medium text-muted-foreground">{" "}{unit}</span> : null}</dd></div>;
}

function CampaignMetric({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <div className={`flex flex-col gap-1 ${className}`}><span className="text-xs text-muted-foreground">{label}</span><strong className="text-sm font-semibold tabular-nums">{value}</strong></div>;
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const label = brand === "modonty" || brand === "jbrseo" ? BRAND_LABEL[brand] : "";
  return { title: label ? `تقارير ${label}` : "تقارير الحملات" };
}

export default async function BrandReportsPage({ params, searchParams }: { params: Promise<{ brand: string }>; searchParams: Promise<{ period?: string; range?: string; since?: string; until?: string; platform?: string }> }) {
  const { brand: brandParam } = await params;
  if (brandParam !== "modonty" && brandParam !== "jbrseo") notFound();
  const brand = brandParam;

  const query = await searchParams;
  const platform = query.platform === "facebook" || query.platform === "instagram" ? query.platform : "all";
  const selectedPeriod = query.period === "all" || query.range === "all" ? "all" : validMonth(query.period) ? query.period : currentMonthInRiyadh();
  const selectedMonth = selectedPeriod === "all" ? currentMonthInRiyadh() : selectedPeriod;
  const selected = query.range === "custom" && validDate(query.since) && validDate(query.until) && query.since! <= query.until! ? { since: query.since!, until: query.until! } : selectedPeriod === "all" ? "all" as const : monthRange(selectedMonth);
  const report = await getMetaCampaignReport(brand, selected);
  const campaigns = new Map<string, MetaCampaignReport[]>();

  if (report.ok) for (const row of report.rows.filter((item) => platform === "all" || item.platform === platform)) campaigns.set(row.campaignId, [...(campaigns.get(row.campaignId) ?? []), row]);

  const orderedCampaigns = Array.from(campaigns.values()).sort((left, right) => (right[0].createdAt || "").localeCompare(left[0].createdAt || ""));
  const rows = orderedCampaigns.flat();
  const currency = rows[0]?.currency ?? "SAR";
  const months = monthOptions(report.ok ? report.firstCampaignDate : null);
  const periodLabel = selected === "all" ? "كل الحملات منذ البداية" : query.range === "custom" ? `${formatDate(report.period.since)} — ${formatDate(report.period.until)}` : formatMonth(selectedMonth);

  return (
    <main dir="rtl" className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3"><div className="rounded-md bg-primary/10 p-2 text-primary"><BarChart3 className="size-5" aria-hidden /></div><div className="flex flex-col gap-1"><h1 className="text-2xl font-semibold tracking-tight">تقارير {BRAND_LABEL[brand]}</h1><p className="text-sm text-muted-foreground">سجل الحملات والأداء الفعلي من Meta.</p></div></div>
        <Badge variant="outline">Meta مباشر</Badge>
      </header>

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4 pb-4">
          <CardTitle className="text-base">تقرير: {periodLabel}</CardTitle>
          <ReportFilters period={selected === "all" ? "all" : selectedMonth} platform={platform} months={months.map((month) => ({ value: month, label: formatMonth(month) }))} />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <Separator />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <SummaryMetric label="الحملات" value={metric(orderedCampaigns.length)} />
              <SummaryMetric label="إجمالي الصرف" value={metric(total(rows, "spend"))} unit={currency} />
              <SummaryMetric label="مرات الظهور" value={metric(total(rows, "impressions"))} />
              <SummaryMetric label="النقرات" value={metric(total(rows, "clicks"))} /></dl>
              </CardContent>
      </Card>

      {!report.ok ? <Card><CardContent className="pt-6 text-sm text-destructive">لم يُعرض التقرير: {report.error}</CardContent></Card> : null}
      {report.ok && orderedCampaigns.length === 0 ? <Card><CardContent className="pt-6 text-sm text-muted-foreground">لا توجد حملات مطابقة للفترة والمنصة المحددتين.</CardContent></Card> : null}

      {report.ok && orderedCampaigns.length > 0 ? <>
        <section aria-labelledby="campaigns-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-col gap-1"><h2 id="campaigns-title" className="text-base font-semibold">الحملات</h2><p className="text-sm text-muted-foreground">الأحدث أولًا. اضغط على أي حملة للتفاصيل.</p></div><span className="text-sm text-muted-foreground">عدد الحملات: {metric(orderedCampaigns.length)}</span></div>
          <Card><CardContent className="p-0"><Accordion type="single" collapsible>{orderedCampaigns.map((placements) => {
            const first = placements[0];
            return <AccordionItem key={first.campaignId} value={first.campaignId} className="px-5 first:border-t-0 last:border-b-0"><AccordionTrigger className="gap-3 py-4 text-right hover:no-underline"><div className="grid flex-1 grid-cols-2 items-center gap-x-5 gap-y-3 text-right lg:grid-cols-[minmax(15rem,2fr)_minmax(8rem,1fr)_repeat(3,minmax(5rem,.7fr))]"><div className="col-span-2 flex min-w-0 flex-col gap-1 lg:col-span-1"><span className="truncate text-base font-semibold">{first.campaignName}</span><span className="text-sm text-muted-foreground">{formatDate(first.createdAt)} · {objectiveLabel(first.objective)}</span></div><div className="flex flex-wrap items-center gap-1">{placements.map((row) => <Badge key={row.platform} variant="secondary">{PLATFORM_LABEL[row.platform]}</Badge>)}</div><CampaignMetric label="الصرف" value={`${metric(total(placements, "spend"))} ${first.currency}`} /><CampaignMetric label="الظهور" value={metric(total(placements, "impressions"))} className="hidden sm:flex" /><CampaignMetric label="النقرات" value={metric(total(placements, "clicks"))} className="hidden lg:flex" /></div></AccordionTrigger><AccordionContent className="pb-5"><div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4">{placements.map((row, index) => <div key={row.platform} className="flex flex-col gap-4">{index > 0 ? <Separator /> : null}<section aria-labelledby={`${first.campaignId}-${row.platform}-title`} className="flex flex-col gap-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><h3 id={`${first.campaignId}-${row.platform}-title`} className="font-semibold">{PLATFORM_LABEL[row.platform]}</h3><Badge variant="outline">مكان الظهور</Badge></div><span className="text-sm text-muted-foreground">{formatDate(row.dateStart)} — {formatDate(row.dateStop)}</span></div><dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4"><SummaryMetric label="الصرف" value={metric(row.spend)} unit={row.currency} /><SummaryMetric label="الوصول" value={metric(row.reach)} /><SummaryMetric label="مرات الظهور" value={metric(row.impressions)} /><SummaryMetric label="النقرات" value={metric(row.clicks)} /><SummaryMetric label="نسبة النقر" value={`${metric(row.ctr)}%`} /><SummaryMetric label="تكلفة النقرة" value={metric(row.cpc)} unit={row.currency} /><SummaryMetric label="تكلفة ألف ظهور" value={metric(row.cpm)} unit={row.currency} /><SummaryMetric label="الميزانية" value={metric(row.budget)} unit={row.currency} /></dl><div className="flex flex-col gap-2"><h4 className="text-sm font-medium">نتائج Meta</h4>{row.actions.length ? <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">{row.actions.map((action, index) => <li key={`${action.action_type}-${index}`}>{actionLabel(action.action_type)}: {metric(action.value ?? "0")}</li>)}</ul> : <p className="text-sm text-muted-foreground">لم تُرجع Meta نتائج تحويل لهذه الحملة.</p>}</div><p className="text-xs text-muted-foreground">معرّف Meta: {row.campaignId}</p></section></div>)}</div></AccordionContent></AccordionItem>;
          })}</Accordion></CardContent></Card>
        </section>
      </> : null}
    </main>
  );
}
