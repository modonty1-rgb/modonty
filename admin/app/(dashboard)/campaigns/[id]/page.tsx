import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Pencil } from "lucide-react";

import { db } from "@/lib/db";
import { LOST_LABEL, type LostReason } from "@/lib/sales/lost-reason";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { getSalesResults } from "../helpers/get-sales-results";
import { ActionItems, type ActionItem } from "./components/action-items";
import { AdsTable, type AdRow } from "./components/ads-table";
import { FunnelSteps, type FunnelStage } from "./components/funnel-steps";
import { MetaTabs } from "./components/meta-tabs";
import { SubmissionsTable } from "./components/submissions-table";
import { TrackingTags } from "./components/tracking-tags";
import { findSubmissionsWithoutLead } from "./helpers/find-submissions-without-lead";
import { getBriefLandingClicks } from "./helpers/get-brief-landing-clicks";
import { getBriefMeta } from "./helpers/get-brief-meta";
import { getBriefSubmissions } from "./helpers/get-brief-submissions";
import { getLandingTracking } from "./helpers/get-landing-tracking";

export const metadata = { title: "تحليل الحملة" };

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const ar2 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });
const riyadhDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
const DOMAIN = { MODONTY: "modonty.com", JBRSEO: "jbrseo.com" } as const;

/** `https://www.modonty.com/business-presence` و`/business-presence` كلاهما ← `/business-presence`. */
function pathOf(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value, "https://x.invalid").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums leading-none">{value}</dd>
      {sub ? <dd className="mt-1.5 text-xs text-muted-foreground">{sub}</dd> : null}
    </div>
  );
}

/**
 * تحليل حملة واحدة (خالد ١٦ أكتوبر ٢٠٢٦: «تحليل كامل للحملة») — ثلاثة مصادر في صفحة:
 * ميتا (الصرف والنقرات والبكسل) · قاعدتنا (تسجيلات صفحة الهبوط وفتح الواتساب) · المبيعات (العملاء
 * المحتملون والمدفوع)، وGTM تحتها مطويّاً.
 *
 * الترتيب أداة قرار (نفس اليوم: «تشويش… تايه»): أربعة أرقام بتكلفتها ← ما يحتاج تصرّفاً بزرّه ←
 * القمع في ثلاث مراحل ← توزيع ميتا في تبويبات ← التسجيلات ← التتبّع.
 */
export default async function CampaignAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  const brief = await db.adCampaign.findUnique({
    where: { id },
    select: { id: true, code: true, name: true, site: true, currency: true, utmCampaign: true, landingPath: true, spendCap: true },
  });
  if (!brief) notFound();

  const domain = DOMAIN[brief.site];
  const declaredPath = pathOf(brief.landingPath);
  const [meta, subs, sales, clicks] = await Promise.all([
    getBriefMeta(brief.site === "JBRSEO" ? "jbrseo" : "modonty", brief.code),
    getBriefSubmissions(brief.code, brief.utmCampaign, null),
    getSalesResults([brief.id]),
    getBriefLandingClicks(brief.code, brief.utmCampaign),
  ]);
  // A brief can run several landing pages (B-002: the brief's /business-presence, and /search-visibility
  // written in its note — Khalid's media buyer, Oct 2026). The pages are the brief's own plus every
  // page a tagged submission came from; each has its own GTM container.
  const pathCounts = subs.rows.reduce((m, r) => m.set(r.landingPath, (m.get(r.landingPath) ?? 0) + 1), new Map<string, number>());
  const pages = [
    ...new Set(
      [...[...pathCounts].sort((a, b) => b[1] - a[1]).map(([p]) => p), ...clicks.map((c) => c.landingPath), declaredPath].filter(Boolean) as string[],
    ),
  ];
  const [trackings, untaggedCounts, withoutLead] = await Promise.all([
    Promise.all(pages.map((p) => getLandingTracking(p, domain))),
    Promise.all(pages.map((p) => getBriefSubmissions(null, "", p).then((r) => r.untagged))),
    findSubmissionsWithoutLead(subs.rows),
  ]);
  const untagged = untaggedCounts.reduce((a, b) => a + b, 0);
  const leadOnClick = trackings.some((tr) => tr.ok && tr.leadOnClick);

  const s = sales.get(brief.id) ?? null;
  const t = meta.ok ? meta.totals : null;
  const cur = meta.ok ? meta.currency || brief.currency : brief.currency;
  const spend = t?.spend ?? null;
  const submissions = subs.rows.length;
  const whatsapp = subs.rows.filter((r) => r.whatsappAt).length;
  const paid = s ? (s.paidMinor[cur] ?? 0) / 100 : 0;
  const money = (n: number) => `${ar2.format(n)} ${currencyLabel(cur)}`;
  const each = (n: number | null | undefined) => (spend && n ? `الواحد بـ ${money(spend / n)}` : "ما فيه بعد");

  // Ad ↔ what we saved by `utm_content` («land2») against the ad name («Land 2 - Flex Designs»):
  // form submissions, and WhatsApp clicks from the form-less page (`landing_clicks`).
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
  const ofAd = (label: string, content: string | null) => !!content && norm(content).length >= 3 && norm(label).startsWith(norm(content));
  const ads: AdRow[] = meta.ok
    ? meta.byAd.map((a) => ({
        ...a,
        saved: subs.rows.filter((r) => ofAd(a.label, r.utmContent)).length,
        waClicks: clicks.filter((c) => ofAd(a.label, c.utmContent)).length,
      }))
    : [];
  const savingAds = ads.filter((a) => a.saved > 0);
  const notSavingAds = ads.filter((a) => a.saved === 0 && a.waClicks === 0 && a.leads > 0);

  const items: ActionItem[] = [];
  if (!meta.ok) items.push({ title: "ما قدرنا نجيب أرقام ميتا", detail: meta.error });
  if (notSavingAds.length > 0) {
    const n = notSavingAds.reduce((s2, a) => s2 + a.leads, 0);
    items.push({
      title: `${ar.format(n)} عميل حسب ميتا ما عندنا لهم أي بيانات`,
      detail: `من إعلان ${notSavingAds.map((a) => a.label.split(" - ")[0]).join(" و")}${declaredPath && !pathCounts.has(declaredPath) ? ` — صفحته ${declaredPath} تودّي واتساب مباشرة` : ""}. كانت قبل ما نحفظ ضغطات الواتساب (١٦ أكتوبر)؛ الجديدة تنحفظ.`,
    });
  }
  const savingLeads = savingAds.reduce((s2, a) => s2 + a.leads, 0);
  if (savingLeads > submissions)
    items.push({
      title: "ميتا تعدّ تسجيلات أكثر من اللي انحفظت",
      detail:
        `إعلان ${savingAds.map((a) => a.label.split(" - ")[0]).join(" و")}: ميتا ${ar.format(savingLeads)} وعندنا ${ar.format(submissions)}.` +
        (leadOnClick ? " السبب: حدث Lead في GTM ينطلق عند ضغط الزر، مو بعد نجاح الحفظ." : ""),
    });
  if (withoutLead.length > 0)
    items.push({
      title: `${ar.format(withoutLead.length)} سجّلوا وما دخلوا المبيعات`,
      detail: withoutLead.map((w) => w.businessName).join(" · "),
      href: "/sales-leads/new",
      cta: "أضف عميل",
    });
  if (untagged > 0)
    items.push({ title: `${ar.format(untagged)} تسجيل بلا مصدر`, detail: "سجّلوا على نفس صفحة الهبوط بدون UTM — ما نعرف من أي حملة جوا." });

  const lost = s ? (Object.entries(s.lost) as [LostReason, number][]).sort((a, b) => b[1] - a[1]) : [];
  const stages: FunnelStage[] = [
    {
      title: "الإعلان",
      source: "ميتا",
      tone: "sky",
      steps: [
        {
          label: "ظهر",
          n: t?.impressions ?? null,
          note: t ? `لـ ${ar.format(t.reach)} شخص مختلف` : undefined,
          cost: t && t.impressions ? `الألف ظهور بـ ${money((t.spend / t.impressions) * 1000)}` : undefined,
        },
        { label: "ضغطوا الرابط", n: t?.clicks ?? null },
        { label: "فتحوا الصفحة", n: t?.landingViews ?? null },
      ],
    },
    {
      title: "صفحة الهبوط",
      source: "قاعدتنا",
      tone: "emerald",
      steps: [
        {
          label: "سجّلوا",
          n: submissions,
          note: notSavingAds.length
            ? `ومعها ${ar.format(notSavingAds.reduce((s2, a) => s2 + a.leads, 0))} حسب ميتا ما انحفظوا عندنا`
            : undefined,
        },
        { label: "فتحوا الواتساب", n: whatsapp },
      ],
      // Direct WhatsApp clicks skip the form, so they sit beside the chain, not in it — inside it they read «١٢٠٪ من اللي قبلها».
      footer: clicks.length ? (
        <p>
          ومعهم <b className="text-foreground">{ar.format(clicks.length)}</b> ضغطوا واتساب مباشرة من صفحة بلا نموذج — بلا اسم ولا رقم.
        </p>
      ) : undefined,
    },
    {
      title: "المبيعات",
      source: "المندوب",
      tone: "violet",
      steps: [
        { label: "عميل محتمل", n: s?.leads ?? 0 },
        { label: "تواصلنا", n: s?.contacted ?? 0 },
        { label: "عرض سعر", n: s?.quoted ?? 0 },
        { label: "تقفلت", n: s?.closed ?? 0 },
      ],
      footer:
        s && (s.good + s.weak + s.invalid > 0 || lost.length > 0) ? (
          <>
            {s.good + s.weak + s.invalid > 0 ? <p>الجودة: مناسب {ar.format(s.good)} · ضعيف {ar.format(s.weak)} · مو صالح {ar.format(s.invalid)}</p> : null}
            {lost.length ? <p>ليش خسرنا: {lost.map(([k, n]) => `${LOST_LABEL[k]} ${ar.format(n)}`).join(" · ")}</p> : null}
          </>
        ) : undefined,
    },
  ];

  const submissionsByDay = subs.rows.reduce((m, r) => m.set(riyadhDay(r.createdAt), (m.get(riyadhDay(r.createdAt)) ?? 0) + 1), new Map<string, number>());

  return (
    <div dir="rtl" className="space-y-5">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 space-y-1">
          <Link href="/campaigns" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowRight className="size-3" aria-hidden /> الحملات
          </Link>
          <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
            {brief.code ? <span dir="ltr" className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold">{brief.code}</span> : null}
            <span dir="auto">{brief.name}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {pages.length > 1 ? "صفحات الهبوط" : "صفحة الهبوط"}{" "}
            {pages.length ? (
              pages.map((p, i) => (
                <span key={p}>
                  {i > 0 ? "، " : ""}
                  <span dir="ltr">{domain}{p}</span>
                </span>
              ))
            ) : (
              <span dir="ltr">{domain}</span>
            )}
            {brief.spendCap != null ? ` · السقف ${money(brief.spendCap)}` : ""}
          </p>
        </div>
        <Link href={`/campaigns/${brief.id}/edit`} className="ms-auto inline-flex h-8 items-center gap-1 rounded border px-3 text-xs font-medium hover:bg-accent">
          <Pencil className="size-3" aria-hidden /> تعديل البريف
        </Link>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="الصرف" value={spend == null ? "—" : money(spend)} sub={brief.spendCap != null && spend != null ? `${ar.format((spend / brief.spendCap) * 100)}٪ من السقف` : undefined} />
        <Kpi label="سجّلوا في الصفحة" value={ar.format(submissions)} sub={each(submissions)} />
        <Kpi label="عملاء محتملون" value={ar.format(s?.leads ?? 0)} sub={each(s?.leads)} />
        <Kpi label="عقود" value={ar.format(s?.closed ?? 0)} sub={paid ? `دفعوا ${money(paid)}${spend ? ` · العائد ${ar2.format(paid / spend)}×` : ""}` : "ما فيه دفع بعد"} />
      </dl>

      <ActionItems items={items} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">من الإعلان حتى العقد</h2>
        <FunnelSteps stages={stages} spend={spend} money={money} />
      </section>

      {ads.length > 1 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">إعلان إعلان</h2>
          <AdsTable rows={ads} money={money} />
        </section>
      ) : null}

      {meta.ok ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">تفاصيل ميتا</h2>
          <MetaTabs meta={meta} submissionsByDay={submissionsByDay} />
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">مين سجّل ({ar.format(submissions)})</h2>
        <SubmissionsTable rows={subs.rows} />
      </section>

      {trackings.map((tr, i) => (
        <TrackingTags key={pages[i]} tracking={tr} page={`${domain}${pages[i]}`} />
      ))}
    </div>
  );
}
