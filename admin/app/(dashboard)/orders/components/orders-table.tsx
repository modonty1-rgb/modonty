"use client";

import type { CheckoutOrderStatus } from "@prisma/client";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Minus, Plus, ReceiptText } from "lucide-react";
import { Fragment, useState } from "react";
import Link from "next/link";

import type { Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OrderStatusBadge } from "./order-status-badge";
import type { SubscriptionState } from "../helpers/get-subscription-standing";

/**
 * صفٌّ جاهزٌ للعرض — كلُّ تنسيقٍ (تاريخ · مبلغ · مدّة) حُسب في الخادم.
 *
 * التواريخُ تحمل نسختين: نصّاً للعرض ورقماً للفرز، لأنّ `DataTable` يفرز بقيمة
 * المفتاح، ونصُّ «١٧‏/٠٩‏/٢٠٢٦» لا يُرتَّب زمنيّاً.
 */
export interface OrderRow {
  id: string;
  number: string;
  needsReview: boolean;
  notes: string | null;
  createdAtLabel: string;
  createdAtMs: number;
  activatedAtLabel: string | null;
  activatedAtMs: number | null;
  firstArticleLabel: string | null;
  firstArticleMs: number | null;
  buyerName: string;
  marketLabel: string;
  planName: string;
  termLabel: string;
  paidMonths: number;
  /** بالعملة — لنافذة التفعيل. */
  totalLabel: string;
  /** رقماً فقط — لعمود الجدول؛ السوقُ بجانبه يقول العملة. */
  amountLabel: string;
  totalMinor: number;
  status: CheckoutOrderStatus;
  providerLabel: string | null;
  /** حالُ الاشتراك اليوم — من التفعيل + شهور الخدمة. */
  subscriptionState: SubscriptionState;
  subscriptionDaysLeft: number | null;
  subscriptionEndsLabel: string | null;
}

const EMPTY = <span className="text-muted-foreground">—</span>;
/** خاناتٌ عربيّة-هنديّة كالمبالغ والتواريخ في الصفّ نفسه. */
const MONTHS_DIGITS = new Intl.NumberFormat("ar-EG", { useGrouping: false });
/** عمودٌ يأخذ عرضَ محتواه فقط؛ الفائضُ كلُّه يذهب لعمود العميل (خالد ١٨ سبتمبر). */
const FIT = "w-[1%]";

const byNumber = (get: (r: OrderRow) => number | null) => (a: OrderRow, b: OrderRow) =>
  (get(a) ?? -Infinity) - (get(b) ?? -Infinity);

/** `cancelled` = إلغاءٌ يدويٌّ على كرت العميل — قرارُ موظّفٍ لا يُشتقّ من المدّة، فيُقال وحده. */
type StandingState = SubscriptionState | "cancelled";

/** ألوانُ معيار الكيانات #٣: أخضر ساري · بنفسجيّ قرب الانتهاء · ورديّ منتهٍ · رماديّ مجهول أو ملغى. */
const STANDING_TONE: Record<StandingState, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  expiring: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  expired: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  unknown: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

const STANDING_CHIP = "inline-flex items-center whitespace-nowrap rounded-full px-1.5 py-0 text-[10px] font-semibold leading-4 tabular-nums";

/** «٤٥ يوم» باقٍ · «منتهٍ ١٢ي» · «ملغى» · «—» بلا تفعيل — رقمٌ واحد يُقرأ من الصفّ. */
function StandingCell({ state, daysLeft, endsLabel }: { state: StandingState; daysLeft: number | null; endsLabel: string | null }) {
  if (state === "cancelled") return <span className={`${STANDING_CHIP} ${STANDING_TONE.cancelled}`}>ملغى</span>;
  if (state === "unknown" || daysLeft === null) return EMPTY;
  const d = Math.abs(daysLeft);
  const label = state === "expired" ? `منتهٍ ${MONTHS_DIGITS.format(d)}ي` : `${MONTHS_DIGITS.format(d)} يوم`;
  return (
    <span title={endsLabel ? `ينتهي ${endsLabel}` : undefined} className={`${STANDING_CHIP} ${STANDING_TONE[state]}`}>
      {label}
    </span>
  );
}

/**
 * مثلّثٌ صغير يُضغط فيفتح أسبابَ المراجعة — لا شارةٌ نصّيّة تمدّ العمود.
 * الأسبابُ مكتوبةٌ في `notes` مفصولةً بـ« · » كما كتبها سكربتُ الترحيل.
 */
function ReviewFlag({ notes }: { notes: string | null }) {
  const reasons = (notes ?? "")
    .replace(/^⚠\s*ترحيلٌ يحتاج مراجعة\s*—\s*/, "")
    .split(" · ")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="أسباب المراجعة"
          className="inline-flex size-5 items-center justify-center rounded text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
        >
          <AlertTriangle className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3 text-[12px]" dir="rtl">
        <div className="mb-1.5 flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          يحتاج مراجعة — {reasons.length} {reasons.length === 1 ? "سبب" : "أسباب"}
        </div>
        <ul className="space-y-1">
          {reasons.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span className="text-muted-foreground">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

const COLUMNS: Column<OrderRow>[] = [
  {
    key: "review",
    header: "",
    sortable: false,
    className: FIT,
    // صحٌّ أخضر لما لا ملاحظة عليه (خالد ١٨ سبتمبر) — العمودُ يُقرأ كاملاً لا بالفراغ.
    render: (r) =>
      r.needsReview ? (
        <ReviewFlag notes={r.notes} />
      ) : (
        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-label="بلا ملاحظات" role="img" />
      ),
  },
  {
    key: "number",
    header: "رقم الطلب",
    className: FIT,
    render: (r) => (
      <Link href={`/orders/${r.id}`} className="whitespace-nowrap font-medium tabular-nums underline-offset-2 hover:underline">
        {r.number}
      </Link>
    ),
  },
  { key: "createdAtMs", header: "التاريخ", className: FIT, sortFn: byNumber((r) => r.createdAtMs), render: (r) => <span className="tabular-nums text-muted-foreground">{r.createdAtLabel}</span> },
  { key: "activatedAtMs", header: "التفعيل", className: FIT, sortFn: byNumber((r) => r.activatedAtMs), render: (r) => (r.activatedAtLabel ? <span className="tabular-nums text-muted-foreground">{r.activatedAtLabel}</span> : EMPTY) },
  { key: "firstArticleMs", header: "أوّل مقال", className: FIT, sortFn: byNumber((r) => r.firstArticleMs), render: (r) => (r.firstArticleLabel ? <span className="tabular-nums text-muted-foreground">{r.firstArticleLabel}</span> : EMPTY) },
  // يُقصّ عند 200px والاسمُ كاملاً في التلميح (خالد ١٨ سبتمبر: «صغّر عمود العميل») —
  // فلا يبتلع الفائضَ وحده، بل يتوزّع على الأعمدة كلّها.
  { key: "buyerName", header: "المشتري", className: FIT, render: (r) => <span className="block max-w-[200px] truncate" title={r.buyerName}>{r.buyerName}</span> },
  { key: "marketLabel", header: "السوق", className: FIT },
  { key: "planName", header: "الباقة", className: FIT },
  // الرأس «شهر» والقيمة رقمٌ فقط (خالد ١٨ سبتمبر): «١٢ شهراً» في كل صفّ يكرّر ما يقوله الرأس.
  { key: "paidMonths", header: "شهر", className: FIT, render: (r) => <span className="font-bold tabular-nums">{MONTHS_DIGITS.format(r.paidMonths)}</span> },
  { key: "totalMinor", header: "الإجمالي", className: FIT, render: (r) => <span className="text-[13.5px] font-bold tabular-nums">{r.amountLabel}</span> },
  // شارةٌ أصغر (خالد ١٨ سبتمبر): 10px وحشوٌ أقلّ — الصفّ 40px ولا يحتمل شارةَ 22px.
  { key: "subscriptionDaysLeft", header: "الاشتراك", className: FIT, sortFn: byNumber((r) => r.subscriptionDaysLeft), render: (r) => <StandingCell state={r.subscriptionState} daysLeft={r.subscriptionDaysLeft} endsLabel={r.subscriptionEndsLabel} /> },
  { key: "status", header: "الحالة", className: FIT, render: (r) => <OrderStatusBadge status={r.status} className="px-1.5 py-0 text-[10px] leading-4 font-semibold" /> },
  { key: "providerLabel", header: "البوابة", className: FIT, render: (r) => (r.providerLabel ? <span className="text-muted-foreground">{r.providerLabel}</span> : EMPTY) },
  /**
   * **لا عمودَ تفعيلٍ هنا** (خالد ١٩ سبتمبر ٢٠٢٦: «التفعيل اتّفقنا إنّه حتكون له آلية
   * ثانية، فشيل لي التفعيل من الجدول هذا نهائي»).
   *
   * كان آخرُ عمودٍ يحمل زرَّ «فعّل» للمدفوع بلا كرت. والتفعيلُ يفتح حساباً ويرسل بيانات
   * دخول — قرارٌ لا يُتَّخذ من صفٍّ في قائمةٍ يُمرّ عليها بالعين. وبابُه يبقى مفتوحاً من
   * صفحة الطلب نفسِها، حيث تُقرأ بياناتُ المشتري كاملةً قبل الضغط.
   */
];



/** حالُ العميل اليوم في سطره — الباقةُ الحاليّة وأيّامُ الاشتراك. */
export interface GroupStanding {
  planName: string | null;
  state: StandingState;
  daysLeft: number | null;
  endsLabel: string | null;
  /**
   * الطلبُ الذي قُرئ منه هذا الحال — وحده يُصبغ أحمرَ في الجدول الفرعيّ (٢٣ سبتمبر ٢٠٢٦ —
   * خالد: مصدرٌ واحد). طلبٌ قديم لعميلٍ جدّد انقضت مدّتُه هو، لا اشتراكُ العميل.
   */
  orderId: string | null;
}

/**
 * عميلٌ وطلباتُه — يُبنى في الخادم (`page.tsx`) ويصل منسَّقاً.
 *
 * `clientId` فارغٌ لطلبٍ مدفوعٍ لم يُفعَّل بعد: يُجمَع ببريد المشتري ويُقال «بلا حساب».
 */
export interface ClientGroup {
  key: string;
  clientId: string | null;
  name: string;
  /** المقبوضُ من طلباته المدفوعة بعملاته — `null` حين لا شيء مدفوع. */
  paidLabel: string | null;
  /**
   * من **طلبه الساري** (`getClientSubscriptions`) لا من أحدث صفٍّ مدفوعٍ ظاهرٍ بالفلتر
   * (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد): الفلترُ يُخفي صفوفاً، والمؤشّرُ قد يخالف أحدثَ طلبٍ
   * أُنشئ. ومن لا حسابَ له بعد يُقال حالُ طلبه هو.
   */
  standing: GroupStanding;
  /** الأحدثُ أوّلاً — ترتيبُ الجلب نفسُه. */
  rows: OrderRow[];
}

/** أعمدةُ الطلب تحت العميل — بلا اسمٍ ولا سوق: قالهما سطرُ العميل فوقها. */
const ORDER_COLUMNS = COLUMNS.filter((c) => c.key !== "buyerName" && c.key !== "marketLabel");

function cell(c: Column<OrderRow>, r: OrderRow): React.ReactNode {
  return c.render ? c.render(r) : String(r[c.key as keyof OrderRow] ?? "");
}

const PAGE_SIZE = 10;

/**
 * **جدولٌ رئيسيّ للعملاء، وتحت كلٍّ جدولٌ فرعيّ لطلباته** (خالد ٢٣ سبتمبر ٢٠٢٦: «جدول
 * رئيسي، ولما أضغط الزائد جدول فرعي»).
 *
 * الرئيسيُّ يجيب «مَن العميل وما حالُه اليوم» — والحالُ من **طلبه الساري** (`g.standing`،
 * يُحسب في الخادم) لا من صفوف الجدول الفرعيّ. والفرعيُّ جدولٌ برأسه وأعمدته، مُزاحٌ داخل
 * إطارٍ خفيف فيُقرأ «تابعاً لهذا العميل» لا صفوفاً مختلطة بالعملاء.
 *
 * مغلقٌ ابتداءً، وعشرةُ عملاء في الصفحة. وطلبٌ يحتاج مراجعةً أو اشتراكٌ منتهٍ يَصبغ سطرَ
 * عميله، فلا يختبئ النقصُ خلف ➕ مغلقة.
 */
export function OrdersTable({ groups, emptyText }: { groups: ClientGroup[]; emptyText: string }) {
  /**
   * **عميلٌ واحدٌ مفتوح** (خالد ٢٣ سبتمبر ٢٠٢٦: «أمور ماليّة، ما ينفع أكثر من جدول ينفتح»):
   * جدولان فرعيّان مفتوحان معاً يجعلان صفَّ طلبٍ يُقرأ تحت عميلٍ غيرِ عميله. فتحُ عميلٍ يقفل السابق.
   */
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = groups.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));
  const goTo = (next: number) => {
    setOpenKey(null);
    setPage(next);
  };

  if (groups.length === 0) {
    return <p className="rounded-lg border bg-card px-4 py-10 text-center text-[13px] text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="text-[12px]">
          <TableHeader>
            <TableRow className="bg-muted/70 hover:bg-muted/70">
              <TableHead className="h-10 w-[1%] px-2" aria-label="فتح الطلبات" />
              <TableHead className="h-10 text-right text-[12px] font-bold text-foreground">العميل</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">السوق</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">الطلبات</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">الباقة الحالية</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">آخر طلب</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">المدفوع</TableHead>
              <TableHead className="h-10 w-[1%] whitespace-nowrap text-right text-[12px] font-bold text-foreground">الاشتراك</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((g) => {
              const isOpen = openKey === g.key;
              const newest = g.rows[0];
              const market = (g.rows.find((r) => r.status === "PAID") ?? newest)?.marketLabel;
              const needsReview = g.rows.some((r) => r.needsReview);
              const expired = g.standing.state === "expired";
              return (
                <Fragment key={g.key}>
                  <TableRow
                    onClick={() => toggle(g.key)}
                    aria-expanded={isOpen}
                    className={cn(
                      "cursor-pointer [&>td]:py-2.5",
                      // المفتوحُ يأخذ لونَ الجدول الفرعيّ تحته وخطَّه — فيُقرأ الاثنان كتلةً واحدة.
                      isOpen
                        ? "border-b-0 bg-primary/[0.07] hover:bg-primary/[0.09] [&>td:first-child]:border-s-2 [&>td:first-child]:border-s-primary"
                        : expired
                          ? "bg-red-500/10 hover:bg-red-500/20"
                          : needsReview
                            ? "bg-amber-500/10 hover:bg-amber-500/20"
                            : "hover:bg-muted/50",
                    )}
                  >
                    <TableCell className="w-[1%] px-2 py-2">
                      <button
                        type="button"
                        aria-label={isOpen ? `اقفل طلبات ${g.name.trim()}` : `افتح طلبات ${g.name.trim()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(g.key);
                        }}
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-md border transition-colors",
                          isOpen ? "border-primary/40 bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                      </button>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="flex items-center gap-2">
                        {/* نصٌّ لا رابط (خالد ٢٣ سبتمبر ٢٠٢٦): هذا قسمُ المبيعات، وكرتُ العميل شأنُ قسمٍ آخر.
                            والضغطُ على السطر يفتح طلباتِه. */}
                        <span className="max-w-[260px] truncate text-[13.5px] font-bold" title={g.name}>
                          {g.name}
                        </span>
                        {!g.clientId ? (
                          <span className="whitespace-nowrap rounded-full bg-amber-500/15 px-1.5 text-[10px] font-semibold leading-4 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300">
                            بلا حساب بعد
                          </span>
                        ) : null}
                        {needsReview ? (
                          <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-label="فيه طلب يحتاج مراجعة" />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2 text-muted-foreground">{market ?? "—"}</TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          "inline-flex min-w-6 justify-center rounded-full px-1.5 text-[11px] font-bold leading-5 tabular-nums",
                          g.rows.length > 1 ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {MONTHS_DIGITS.format(g.rows.length)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2">{g.standing.planName || EMPTY}</TableCell>
                    <TableCell className="whitespace-nowrap py-2 tabular-nums text-muted-foreground">{newest?.createdAtLabel ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap py-2 text-[13px] font-bold tabular-nums">{g.paidLabel ?? EMPTY}</TableCell>
                    <TableCell className="py-2">
                      <StandingCell state={g.standing.state} daysLeft={g.standing.daysLeft} endsLabel={g.standing.endsLabel} />
                    </TableCell>
                  </TableRow>

                  {isOpen ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="border-s-2 border-s-primary bg-primary/[0.04] px-4 pb-4 pt-1">
                        {/* الفرعيُّ لوحةٌ داخل سطر العميل: عنوانٌ يسمّيه، ثمّ جدولٌ أصغرُ خطّاً
                            وأخفُّ رأساً ومُزاحٌ تحت الاسم — فلا يُخلط بجدول العملاء. */}
                        <div className="ms-8">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                            <ReceiptText className="size-3.5" aria-hidden />
                            طلبات {g.name.trim()} · {MONTHS_DIGITS.format(g.rows.length)}
                          </div>
                          <div className="overflow-x-auto rounded-md border bg-background shadow-sm">
                          <Table className="text-[12px]">
                            <TableHeader>
                              <TableRow className="border-b hover:bg-transparent">
                                {ORDER_COLUMNS.map((c) => (
                                  <TableHead key={String(c.key)} className={cn("h-7 whitespace-nowrap text-right text-[10.5px] font-medium text-muted-foreground", c.className)}>
                                    {c.header}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {g.rows.map((r) => (
                                <TableRow
                                  key={r.id}
                                  className={
                                    expired && r.id === g.standing.orderId
                                      ? "bg-red-500/10 hover:bg-red-500/20"
                                      : r.needsReview
                                        ? "bg-amber-500/10 hover:bg-amber-500/20"
                                        : undefined
                                  }
                                >
                                  {ORDER_COLUMNS.map((c) => (
                                    <TableCell key={String(c.key)} className={cn("py-1 text-[11.5px]", c.className)}>
                                      {cell(c, r)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
        <span className="tabular-nums">
          {MONTHS_DIGITS.format(groups.length)} عميل · {MONTHS_DIGITS.format(groups.reduce((n, g) => n + g.rows.length, 0))} طلب
        </span>
        {pages > 1 ? (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2" disabled={current === 0} onClick={() => goTo(current - 1)} aria-label="الصفحة السابقة">
              <ChevronRight className="size-4" />
            </Button>
            <span className="px-2 tabular-nums">
              {MONTHS_DIGITS.format(current + 1)} / {MONTHS_DIGITS.format(pages)}
            </span>
            <Button variant="outline" size="sm" className="h-7 px-2" disabled={current >= pages - 1} onClick={() => goTo(current + 1)} aria-label="الصفحة التالية">
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
