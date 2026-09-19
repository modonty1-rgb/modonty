"use client";

import { useRouter } from "next/navigation";

import { DataTable, type Column } from "@/components/admin/data-table";

export interface QueueRow {
  id: string;
  number: string;
  buyerName: string;
  contact: string;
  phone: string;
  market: string;
  planName: string;
  termLabel: string;
  amountLabel: string;
  currency: string;
  providerLabel: string | null;
  paidAtLabel: string;
  waitingDays: number;
}

const FIT = "w-[1%] whitespace-nowrap";
const EMPTY = <span className="text-muted-foreground">—</span>;

/**
 * **الانتظارُ هو العمودُ الذي يُرتَّب به الطابور.**
 *
 * الصفوفُ مرتّبةٌ بالأقدمِ دفعاً، ويومُ الانتظار مصبوغٌ بثلاث درجات: مالُ العميل عندنا
 * وخدمتُه لم تبدأ، وكلُّ يومٍ يمرّ دَينٌ عليه لا عليه. والصبغُ على الرقم لا على الصفّ
 * كلِّه — الصفُّ ملوَّنٌ كلُّه يصير جداراً، والعينُ تتوقّف عند نقطةٍ واحدة.
 */
const COLUMNS: Column<QueueRow>[] = [
  {
    key: "waitingDays",
    header: "انتظار",
    className: FIT,
    sortFn: (a, b) => a.waitingDays - b.waitingDays,
    render: (r) => (
      <span
        className={`rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
          r.waitingDays >= 3
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : r.waitingDays >= 1
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        }`}
        title={r.waitingDays === 0 ? "دفع اليوم" : `مضى ${r.waitingDays} يوماً على الدفع`}
      >
        {r.waitingDays === 0 ? "اليوم" : `${r.waitingDays}ي`}
      </span>
    ),
  },
  { key: "number", header: "رقم الطلب", className: FIT, render: (r) => <span className="font-medium tabular-nums">{r.number}</span> },
  { key: "paidAtLabel", header: "الدفع", className: FIT, render: (r) => <span className="tabular-nums text-muted-foreground">{r.paidAtLabel}</span> },
  {
    key: "buyerName",
    header: "المشتري",
    render: (r) => (
      <div className="min-w-0 max-w-[230px]">
        <div className="truncate font-medium">{r.buyerName}</div>
        <div dir="ltr" className="truncate text-start text-[11px] text-muted-foreground">{r.contact}</div>
      </div>
    ),
  },
  { key: "market", header: "السوق", className: FIT, render: (r) => <span className="text-muted-foreground">{r.market}</span> },
  { key: "planName", header: "الباقة", className: FIT },
  { key: "termLabel", header: "شهر", className: FIT, render: (r) => <span className="font-bold tabular-nums">{r.termLabel}</span> },
  { key: "amountLabel", header: "المدفوع", className: FIT, render: (r) => <span className="font-bold tabular-nums">{r.amountLabel}</span> },
  { key: "providerLabel", header: "البوابة", className: FIT, render: (r) => (r.providerLabel ? <span className="text-muted-foreground">{r.providerLabel}</span> : EMPTY) },
];

export function ActivationQueueTable({ rows }: { rows: QueueRow[] }) {
  const router = useRouter();
  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      searchKey="buyerName"
      searchPlaceholder="ابحث باسم المشتري"
      pageSize={10}
      className="text-[12px]"
      emptyText="لا أحدَ ينتظر التفعيل"
      // الصفُّ كلُّه رابط: الهدفُ واحدٌ لكلّ صفّ، فزرٌّ في آخره يصنع هدفاً صغيراً
      // داخل هدفٍ كبير — والعينُ تقرأ الاسمَ ثمّ تبحث عن الزرّ.
      //
      // ويفتح **صفحةَ التفعيل** لا صفحةَ الطلب (خالد ١٩ سبتمبر ٢٠٢٦): صفحةُ الطلب
      // شاشةُ مالٍ — فواتيرُ واستردادٌ وسجلُّ بوّابة — وموظّفُ التفعيل لا شأن له بها.
      onRowClick={(r) => router.push(`/clients/activate/${r.id}`)}
      rowClassName={() => "cursor-pointer"}
    />
  );
}
