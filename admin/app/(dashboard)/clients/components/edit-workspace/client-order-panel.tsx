"use client";

import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";


/**
 * **عمودُ الطلب — ما اشتراه العميلُ فعلاً، بجانب ما نعدّله عنه.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦، عن العمود الثالث): «هنجيب البيانات اللي في الـorder اللي
 * تخصّ العميل هذا. البيانات المهمّة اللي تخصّه».
 *
 * -- ولماذا هنا لا في النموذج --
 * الطلبُ مصدرُ الحقيقة للمال والباقة والمدّة، وصفحةُ التعديل لا تكتب فيه حرفاً. فلو
 * دخل بين الحقول لقُرئ حقلاً يُملأ. وهو في عمودٍ يُقرأ ولا يُملأ: الموظّفُ يعدّل
 * بيانات العميل وعينُه على ما دفعه — الباقةُ والحصّةُ والمدّةُ والمبلغُ والبوابة.
 *
 * -- ولا رقمَ يُحسب هنا --
 * كلُّ ما يُعرض مقروءٌ من صفّ الطلب كما هو. الحسابُ الوحيد جمعُ المدفوعة والهديّة،
 * وهو جمعُ حقلين لا اشتقاقُ مبلغ — والمبالغُ تُنسَّق بـ`formatOrderMoney` نفسِه الذي
 * تستعمله صفحةُ الطلب، فلا يختلف رقمٌ بين الشاشتين.
 */
export type ClientActiveOrder = {
  id: string;
  number: string;
  status: string;
  market?: string | null;
  country?: string | null;
  planName?: string | null;
  articlesPerMonth?: number | null;
  paidMonths: number;
  bonusServiceMonths: number;
  serviceStartedAt?: Date | string | null;
  salesRepName?: string | null;
  isInternal?: boolean | null;
};

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PURCHASED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  AWAITING_TRANSFER: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
  REFUNDED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const date = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : null;

export function ClientOrderPanel({ order }: {
  order: ClientActiveOrder | null;
}) {
  // بلا طلبٍ سارٍ: الغيابُ معلومةٌ — عميلٌ بلا طلبٍ لم يُشترَ له شيءٌ بعد.
  if (!order) {
    return (
      <aside dir="rtl" className="rounded-lg border border-dashed bg-card/50 p-3 text-center">
        <ReceiptText className="mx-auto size-5 text-muted-foreground/60" aria-hidden />
        <p className="mt-2 text-[12px] font-medium">لا طلبَ سارٍ</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">لا باقةَ ولا مدّةَ ولا مبلغ.</p>
      </aside>
    );
  }

  const months = order.paidMonths + order.bonusServiceMonths;

  return (
    /**
     * `dir="rtl"` صريحاً: صفحةُ التعديل كلُّها `direction: ltr` (مقيسٌ حيّاً ١٩ سبتمبر
     * ٢٠٢٦)، وجملةٌ عربيّةٌ فيها رقمٌ أو لاتينيٌّ تنقلب فيها المقاطع — «الضريبة 0٪»
     * تُعرض «٪الضريبة 0»، والبريدُ يقفز إلى أوّل الجملة. والنصُّ يُحفظ صحيحاً ويُقرأ
     * خطأً، وهو أسوأ من الاثنين.
     */
    <aside dir="rtl" className="space-y-2.5 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] font-bold tabular-nums">{order.number}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            STATUS_TONE[order.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {order.status}
        </span>
      </div>

      {order.isInternal ? (
        <p className="rounded border border-dashed px-2 py-1 text-[10.5px] text-muted-foreground">
          حسابٌ لنا — خارج تقارير الإيراد.
        </p>
      ) : null}

      {/* الباقةُ والمبلغُ أوّلاً: هما ما يُسأل عنه، والباقي تفصيلٌ يُراجَع. */}
      <div className="rounded-lg bg-muted/50 p-2.5">
        <p className="truncate text-[13px] font-bold">{order.planName?.trim() || "—"}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {order.articlesPerMonth ? `${order.articlesPerMonth} مقال/شهر · ` : ""}
          {order.bonusServiceMonths
            ? `${order.paidMonths}+${order.bonusServiceMonths} = ${months} شهر`
            : `${months} شهر`}
        </p>
      </div>

      <dl className="space-y-0.5">
        <Row label="بدء الخدمة" value={date(order.serviceStartedAt)} />
        <Row label="المندوب" value={order.salesRepName ?? null} />
        {/**
          * **الدولةُ من الطلب** (خالد ١٩ سبتمبر ٢٠٢٦: «في التعديل تنعرض في section تبع
          * الـorder»). سقط حقلُها من النموذج ليبقى لها كاتبٌ واحد — التفعيل.
          *
          * والسوقُ يُذكر فقط حين يخالف الدولة: هما واحدٌ في كلّ الطلبات تقريباً، وسطرٌ
          * يكرّر جارَه ضجيجٌ لا معلومة.
          */}
        <Row
          label="الدولة"
          value={
            order.country?.trim()
              ? order.country.trim() === order.market
                ? order.country.trim()
                : `${order.country.trim()} · سوق ${order.market}`
              : (order.market ?? null)
          }
        />
      </dl>

      <Link
        href={`/orders/${order.id}`}
        className="flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[12px] font-medium hover:bg-accent"
      >
        مراجعة الطلب
        <ArrowLeft className="size-3.5" aria-hidden />
      </Link>
    </aside>
  );
}

/** الفارغُ «—» باهتاً: غيابُ القيمة معلومةٌ للموظّف، وإخفاءُ السطر يخفيها. */
function Row({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[11.5px]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        dir={mono ? "ltr" : undefined}
        className={`min-w-0 truncate ${mono ? "font-mono text-[10.5px]" : "tabular-nums"} ${
          value ? "font-medium" : "text-muted-foreground/50"
        }`}
      >
        {value?.trim() || "—"}
      </dd>
    </div>
  );
}
