"use client";

import type { CheckoutOrderStatus } from "@prisma/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { DataTable, type Column } from "@/components/admin/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OrderStatusBadge } from "./order-status-badge";
import type { SubscriptionState } from "../helpers/get-subscription-standing";
import { ActivateOrderButton } from "./activate-order-button";
import type { ActivatableOrder } from "./activate-order-dialog";

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
  /** يُملأ للمدفوع بلا كرت وحده — وهو تعريف «ينتظر التفعيل» نفسه. */
  activatable: ActivatableOrder | null;
}

const EMPTY = <span className="text-muted-foreground">—</span>;
/** خاناتٌ عربيّة-هنديّة كالمبالغ والتواريخ في الصفّ نفسه. */
const MONTHS_DIGITS = new Intl.NumberFormat("ar-EG", { useGrouping: false });
/** عمودٌ يأخذ عرضَ محتواه فقط؛ الفائضُ كلُّه يذهب لعمود العميل (خالد ١٨ سبتمبر). */
const FIT = "w-[1%]";

const byNumber = (get: (r: OrderRow) => number | null) => (a: OrderRow, b: OrderRow) =>
  (get(a) ?? -Infinity) - (get(b) ?? -Infinity);

/** ألوانُ معيار الكيانات #٣: أخضر ساري · بنفسجيّ قرب الانتهاء · ورديّ منتهٍ · رماديّ مجهول. */
const STANDING_TONE: Record<SubscriptionState, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  expiring: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  expired: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  unknown: "bg-muted text-muted-foreground",
};

/** «٤٥ يوم» باقٍ · «منتهٍ ١٢ي» · «—» بلا تفعيل — رقمٌ واحد يُقرأ من الصفّ. */
function StandingCell({ r }: { r: OrderRow }) {
  if (r.subscriptionState === "unknown" || r.subscriptionDaysLeft === null) return EMPTY;
  const d = Math.abs(r.subscriptionDaysLeft);
  const label = r.subscriptionState === "expired" ? `منتهٍ ${MONTHS_DIGITS.format(d)}ي` : `${MONTHS_DIGITS.format(d)} يوم`;
  return (
    <span
      title={`ينتهي ${r.subscriptionEndsLabel}`}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-1.5 py-0 text-[10px] font-semibold leading-4 tabular-nums ${STANDING_TONE[r.subscriptionState]}`}
    >
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
  { key: "buyerName", header: "العميل", className: FIT, render: (r) => <span className="block max-w-[200px] truncate" title={r.buyerName}>{r.buyerName}</span> },
  { key: "marketLabel", header: "السوق", className: FIT },
  { key: "planName", header: "الباقة", className: FIT },
  // الرأس «شهر» والقيمة رقمٌ فقط (خالد ١٨ سبتمبر): «١٢ شهراً» في كل صفّ يكرّر ما يقوله الرأس.
  { key: "paidMonths", header: "شهر", className: FIT, render: (r) => <span className="font-bold tabular-nums">{MONTHS_DIGITS.format(r.paidMonths)}</span> },
  { key: "totalMinor", header: "الإجمالي", className: FIT, render: (r) => <span className="text-[13.5px] font-bold tabular-nums">{r.amountLabel}</span> },
  // شارةٌ أصغر (خالد ١٨ سبتمبر): 10px وحشوٌ أقلّ — الصفّ 40px ولا يحتمل شارةَ 22px.
  { key: "subscriptionDaysLeft", header: "الاشتراك", className: FIT, sortFn: byNumber((r) => r.subscriptionDaysLeft), render: (r) => <StandingCell r={r} /> },
  { key: "status", header: "الحالة", className: FIT, render: (r) => <OrderStatusBadge status={r.status} className="px-1.5 py-0 text-[10px] leading-4 font-semibold" /> },
  { key: "providerLabel", header: "البوابة", className: FIT, render: (r) => (r.providerLabel ? <span className="text-muted-foreground">{r.providerLabel}</span> : EMPTY) },
  {
    key: "actions",
    header: "",
    sortable: false,
    className: FIT,
    render: (r) => (r.activatable ? <ActivateOrderButton order={r.activatable} /> : null),
  },
];

export function OrdersTable({ rows, emptyText }: { rows: OrderRow[]; emptyText: string }) {
  // عمودُ «فعّل» يظهر حين يوجد ما يُفعَّل فقط — وإلّا بقي عموداً فارغاً يوحي بشيءٍ
  // مخفيّ (خالد ١٨ سبتمبر: «فيه حقل بعد البوابة ماني شايفه»).
  const columns = rows.some((r) => r.activatable) ? COLUMNS : COLUMNS.filter((c) => c.key !== "actions");
  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKey="buyerName"
      searchPlaceholder="ابحث باسم العميل"
      pageSize={10}
      emptyText={emptyText}
      // خطٌّ أصغر درجة (12px) وأيقونةُ الفرز أصغر: ثلاثة عشر عموداً على ١٢٨٠ بلا تمرير.
      className="text-[12px] [&_th_svg]:size-3 [&_th_svg]:ms-1"
      // الأحمرُ للاشتراك المنتهي يغلب الكهرمانيَّ للمراجعة (خالد ١٨ سبتمبر): المالُ المستحقّ
      // أوّل ما يُرى؛ والمثلّثُ في عموده يبقى يقول أنّ الصفّ يحتاج مراجعةً أيضاً.
      rowClassName={(r) =>
        r.subscriptionState === "expired"
          ? "bg-red-500/10 hover:bg-red-500/20"
          : r.needsReview
            ? "bg-amber-500/10 hover:bg-amber-500/20"
            : undefined
      }
    />
  );
}
