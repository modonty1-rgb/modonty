import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CalendarX,
  FileCheck,
  FileText,
  FileX,
  Image as ImageIcon,
  Link2,
  MapPin,
  MousePointerClick,
  User,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { db } from "@/lib/db";
import { clientSeoQuality, clientStatusCounts } from "@/lib/dashboard/cached";
import { NOT_INTERNAL } from "@/lib/clients/segments";
import { GroupLabel, type Tier } from "../dashboard-ui";
import { PanelHead } from "../panel-head";
import { SeoHealthCard } from "../seo-health-card";
import { BudgetRow, PipelineRow } from "../pipeline-row";
import { SalesRepsSummary, type SalesRepsSummaryData } from "./sales-reps-summary";

/**
 * Clients — the same ROW language as Articles (Khalid 2026-07-23: «نحول كله نفس فكرة
 * الجدول»). Each dimension is a labelled strip of rows:
 *
 *   Money & portfolio → who is costing me? what is the book made of?
 *   How visitors reach them → a true PARTITION of the book (every client has one CTA
 *     mode), so it earns the segmented budget bar — the honest analog of "In production".
 *   Content · Record data · Images → overlapping flags (a client can be in several), so
 *     they are plain rows, never a budget bar that would imply a false partition.
 *
 * Live numbers get a row; zeros compress into a chip footer. Same three tiers everywhere.
 */

interface Item {
  value: number;
  label: string;
  note: string;
  href: string;
  tier: Tier;
  icon: LucideIcon;
}

function split(items: Item[]) {
  return {
    live: items.filter((i) => i.value > 0),
    empty: items.filter((i) => i.value === 0),
  };
}

const action = (t: Tier) => (t === "hot" || t === "warm" ? "أصلح" : "اعرض");

/** A labelled strip of rows for one overlapping-flag dimension: live → rows, zeros → chips. */
function RowGroup({
  icon,
  title,
  hint,
  items,
  emptyGood,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  items: Item[];
  emptyGood?: boolean;
}) {
  const { live, empty } = split(items);
  return (
    <>
      <GroupLabel icon={icon} hint={hint}>
        {title}
      </GroupLabel>
      <div className="mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        {live.map((i) => (
          <PipelineRow
            key={i.label}
            href={i.href}
            tier={i.tier}
            icon={i.icon}
            value={i.value}
            label={i.label}
            note={i.note}
            action={action(i.tier)}
          />
        ))}
        {live.length === 0 && (
          <div className="px-4 py-3 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            كله سليم
          </div>
        )}
        {empty.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t bg-muted/20 px-4 py-2.5">
            {empty.map((i) => (
              <span
                key={i.label}
                className={`text-xs tabular-nums ${
                  emptyGood ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                <b className={`font-bold ${emptyGood ? "" : "text-foreground"}`}>0</b>{" "}
                {i.label}
                {emptyGood ? " — سليم" : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Who brought which client, and who has no rep yet. groupBy on the optional salesRepId
// buckets absent/null together → the "no rep" count in one query.
async function getSalesRepBreakdown(): Promise<SalesRepsSummaryData> {
  const grouped = await db.client.groupBy({
    by: ["salesRepId"],
    where: NOT_INTERNAL,
    _count: { _all: true },
  });

  const repIds = grouped.map((g) => g.salesRepId).filter((x): x is string => Boolean(x));
  const staff = repIds.length
    ? await db.staff.findMany({ where: { id: { in: repIds } }, select: { id: true, name: true, email: true } })
    : [];
  const nameById = new Map(staff.map((s) => [s.id, s.name || s.email || "مندوب"]));

  const reps = grouped
    .filter((g) => g.salesRepId)
    .map((g) => ({ name: nameById.get(g.salesRepId as string) ?? "مندوب", count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  const unassignedCount = grouped.find((g) => !g.salesRepId)?._count._all ?? 0;
  const unassigned = unassignedCount
    ? await db.client.findMany({
        where: { AND: [NOT_INTERNAL, { OR: [{ salesRepId: null }, { salesRepId: { isSet: false } }] }] },
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return { reps, unassignedCount, unassigned };
}

const EXPIRING_THIS_WEEK = "تنتهي هذا الأسبوع";

export async function ClientsPipeline() {
  const [
    { total, needsYou, portfolio, contact, content, images, data, statusUnaccounted },
    seoQuality,
    salesReps,
  ] = await Promise.all([clientStatusCounts(), clientSeoQuality(), getSalesRepBreakdown()]);

  const unreachable = contact.none + contact.unset;
  // An ACTIVE client with no end date cannot match the expiring-soon date filter — so a
  // "0 expiring this week" next to a non-zero count here means "blind", not "safe".
  const renewalBlind = data.noEndDate;

  const money: Item[] = [
    { value: needsYou.overdue, label: "فواتير غير مدفوعة", note: "عليهم مبلغ لنا", href: "/clients/segment/overdue", tier: "hot", icon: Banknote },
    { value: needsYou.expired, label: "الاشتراك انتهى", note: "ما زال ظاهراً، وما عاد يدفع", href: "/clients/segment/expired", tier: "hot", icon: CalendarX },
    { value: needsYou.expiringSoon, label: EXPIRING_THIS_WEEK, note: "اتصل بهم قبل ما ينقطع", href: "/clients/segment/expiring-soon", tier: "hot", icon: Calendar },
    // «ينتظر التفعيل» (عملاء PENDING) حُذف من هنا (خالد ٣٠ سبتمبر ٢٠٢٦، الموكب المعتمد): كان يقول 0
    // وبطاقة «طلب مدفوع ينتظر التفعيل» فوقه تقول 1 — اسمٌ واحد لمعنيين. المصدر الوحيد صار «يحتاجك اليوم».
    { value: data.noEndDate, label: "تاريخ التجديد ناقص", note: "المحتوى ظاهر بلا تاريخ تجديد — ما صدرت فاتورة", href: "/clients/segment/no-end-date", tier: "hot", icon: CalendarX },
  ];

  // CTA modes partition every client, so these ARE a budget: form + link + none + unset = total.
  const reach: Item[] = [
    { value: contact.unset, label: "الزر ما انضبط", note: "الحقل ناقص في سجلّه — يتصرف كأنه بلا زر", href: "/clients/segment/unset", tier: "hot", icon: AlertTriangle },
    { value: contact.none, label: "بلا زر أصلاً", note: "يدفع، والزائر ما عنده طريق للتواصل", href: "/clients/segment/none", tier: "hot", icon: UserX },
    { value: contact.form, label: "نموذج حجز", note: "الليد يوصل قاعدتنا", href: "/clients/segment/form", tier: "ok", icon: Calendar },
    { value: contact.link, label: "رابط خارجي", note: "موقعهم أو واتساب — نشوف النقرة وما نشوف الليد", href: "/clients/segment/link", tier: "plain", icon: MousePointerClick },
  ];

  const contentItems: Item[] = [
    { value: content.noArticles, label: "بلا مقالات", note: "يدفعون مقابل صمت", href: "/clients/segment/no-articles", tier: "warm", icon: FileX },
    { value: content.awaitingApproval, label: "ينتظر موافقة العميل", note: "كتبناه — تابع موافقتهم", href: "/clients/segment/awaiting-approval", tier: "warm", icon: User },
    { value: content.published, label: "نشر مقال على الأقل", note: "مقال واحد على الأقل منشور", href: "/clients/segment/has-published", tier: "ok", icon: FileCheck },
    { value: content.inProgress, label: "قيد التنفيذ", note: "فيه مقالات وما نُشر شي — علينا", href: "/clients/segment/content-in-progress", tier: "plain", icon: FileText },
  ];

  const dataItems: Item[] = [
    { value: data.noAddress, label: "بلا عنوان", note: "بلا مدينة — الـJSON-LD بلا موقع", href: "/clients/segment/no-address", tier: "warm", icon: MapPin },
    { value: data.noSocial, label: "بلا روابط سوشال", note: "sameAs فاضي — ما يربطهم شي بحساباتهم الحقيقية", href: "/clients/segment/no-social", tier: "warm", icon: Link2 },
    { value: data.noDescription, label: "بلا وصف", note: "سكيما المنظمة تقول مين، مو وش", href: "/clients/segment/no-description", tier: "warm", icon: FileText },
  ];

  const imageItems: Item[] = [
    { value: images.noImage, label: "بلا أي صورة", note: "لا شعار ولا غلاف ولا مشاركة — ابدأ هنا", href: "/clients/segment/no-image", tier: "warm", icon: ImageIcon },
    { value: images.noLogo, label: "بلا شعار", note: "يقرأه جوجل في لوحة المعرفة", href: "/clients/segment/no-logo", tier: "warm", icon: ImageIcon },
    { value: images.noHero, label: "بلا صورة غلاف", note: "البانر في صفحتهم", href: "/clients/segment/no-hero", tier: "warm", icon: ImageIcon },
    { value: images.noOg, label: "بلا صورة مشاركة", note: "معاينة الرابط فاضية — 25 نقطة سيو", href: "/clients/segment/no-og", tier: "warm", icon: ImageIcon },
  ];

  const m = split(money);

  return (
    <>
      <PanelHead
        title="العملاء"
        hint="الاشتراك والجاهزية"
        right={
          <Link href="/clients/segment/unreachable" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span
              className={`text-base font-bold tabular-nums ${
                unreachable > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {unreachable}
            </span>
            ما يوصلهم الزائر
            <span className="text-muted-foreground/40">·</span>
            من {total.toLocaleString("en-US")}
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <SeoHealthCard
        score={seoQuality.avgScore}
        perfect={seoQuality.perfect}
        below={seoQuality.below}
        checks={seoQuality.checks}
        contentIcon={User}
        caption={
          <span className="flex shrink-0 items-center gap-3 text-[12px]">
            {seoQuality.below > 0 && (
              <Link
                href="/clients/segment/seo-imperfect"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span className="font-extrabold tabular-nums text-red-600 dark:text-red-400">
                  {seoQuality.below}
                </span>
                <span className="text-muted-foreground">فيهم نقص</span>
                <span className="font-bold text-primary">أصلح ←</span>
              </Link>
            )}
            {seoQuality.perfect > 0 && (
              <Link
                href="/clients/segment/seo-perfect"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span className="font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {seoQuality.perfect}
                </span>
                <span className="text-muted-foreground">كامل</span>
              </Link>
            )}
          </span>
        }
      />
      {statusUnaccounted > 0 && (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-400">
          <b>{statusUnaccounted}</b> عميل بلا حالة اشتراك في سجلّه — نفس فخّ الحقل الناقص اللي أصاب زر
          التواصل. محسوبين في الإجمالي وما هم في أي حالة تحت، فالأرقام ما تتطابق حتى يُعبّى الحقل.
        </p>
      )}
      {/* Money is the section that costs you — a distinctive amber frame + header strip so it
          reads as THE priority, not just another group (Khalid 2026-07-23). */}
      <div className="mb-3 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-transparent shadow-sm ring-1 ring-amber-500/10">
        <div className="flex items-center gap-2.5 border-b border-amber-500/20 bg-amber-500/[0.07] px-4 py-2.5">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Banknote className="h-4 w-4" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            المال والمحفظة
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">— ابدأ هنا</span>
          {m.live.length > 0 && (
            <span className="ms-auto rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              {m.live.length} عليهم علامة
            </span>
          )}
        </div>
        {m.live.map((i) => (
          <PipelineRow
            key={i.label}
            href={i.href}
            tier={i.tier}
            icon={i.icon}
            value={i.value}
            label={i.label}
            note={i.note}
            action="أصلح"
          />
        ))}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t bg-muted/20 px-4 py-2.5">
          {m.empty.map((i) => (
            <span key={i.label} className="text-xs tabular-nums text-muted-foreground">
              {i.label === EXPIRING_THIS_WEEK && renewalBlind > 0 ? (
                <>
                  <b className="font-bold text-amber-600 dark:text-amber-400">؟</b> تنتهي هذا الأسبوع: غير معروف
                  ({renewalBlind} بلا تاريخ تجديد)
                </>
              ) : (
                <>
                  <b className="font-bold text-foreground">0</b> {i.label}
                </>
              )}
            </span>
          ))}
          {m.empty.length > 0 && <span className="text-muted-foreground/40">·</span>}
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
            المحفظة
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.active}</b> نشط
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.ymyl}</b> YMYL
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.standard}</b> عادي
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.cancelled}</b> ملغي
          </span>
        </div>
      </div>

      {/* Reach — the one true partition, so the honest budget bar (mirror of "In production"). */}
      <GroupLabel icon={MousePointerClick} hint={`— ${unreachable} ما يوصلهم الزائر`}>
        كيف يوصلهم الزائر
      </GroupLabel>
      <div className="mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        <BudgetRow
          total={total}
          label="عميل"
          icon={MousePointerClick}
          reviewHref="/clients/segment/unreachable"
          reviewLabel="أصلح"
          segments={reach.map((i) => ({
            key: i.label,
            href: i.href,
            label: i.label,
            value: i.value,
            tier: i.tier,
          }))}
        />
      </div>

      <RowGroup
        icon={FileText}
        title="المحتوى"
        hint="— العميل ممكن يكون في أكثر من واحد"
        items={contentItems}
      />
      <RowGroup
        icon={FileText}
        title="بيانات السجل"
        hint="— نقص في السجل نفسه: المراقبة المالية والسكيما تقرأ هذي"
        items={dataItems}
        emptyGood
      />
      <RowGroup
        icon={ImageIcon}
        title="الصور"
        hint="— أول صف هو التقاطع"
        items={imageItems}
        emptyGood
      />

      <SalesRepsSummary {...salesReps} />
    </>
  );
}
