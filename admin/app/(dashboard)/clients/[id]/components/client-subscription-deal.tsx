"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { isCollectedOrder } from "@modonty/shared/lib/payments/collected";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { formatMonths } from "@modonty/shared/lib/commercial/arabic-months";
import { formatTermLabel } from "@modonty/shared/lib/commercial/term-label";
import { orderStatusCopy } from "@/lib/orders/order-status-copy";
import type { CheckoutOrderStatus } from "@prisma/client";
import type { ActiveOrderSummary, ClientOrderRow } from "@/lib/orders/resolve-active-order";

/**
 * «الاشتراك الحالي» — the deal that governs this client, read from the ORDER.
 *
 * Everything here is a snapshot frozen at purchase: the price paid, the months bought, the
 * bonus months, the rep who sold it. None of it is read from the catalog or from the client
 * card, because both change and an issued deal must not (MONEY-FLOW §2, §4).
 */

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(minor / 100) +
  " " + currencyLabel(currency);

const day = (d: Date | string | null) =>
  d ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—";

/**
 * الألوانُ هنا وحدها — **والكلمةُ من `orderStatusCopy`** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 * كانت لهذا الكرت قائمةُ كلماتٍ خاصّة: الطلبُ نفسُه «لم يدفع بعد» في صفحة الطلبات و«بانتظار
 * الدفع» هنا (وهي كلمةُ الفاتورة لا الطلب)، والحوالةُ «بانتظار التحويل» — الاسمُ الذي استبدله
 * خالد بـ«حوالة تنتظر تأكيدك» لأنّه لخبط الفريق.
 */
const TONE: Record<string, string> = {
  PAID: "text-green-600 dark:text-green-500 border-green-500/40 bg-green-500/10",
  AWAITING_PAYMENT: "text-amber-600 dark:text-amber-500 border-amber-500/30 bg-amber-500/10",
  AWAITING_TRANSFER: "text-amber-600 dark:text-amber-500 border-amber-500/30 bg-amber-500/10",
  REFUNDED: "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10",
};

function OrderStatus({ status }: { status: string }) {
  const copy = orderStatusCopy(status as CheckoutOrderStatus);
  return (
    <Badge variant="outline" title={copy?.hint} className={cn("text-[11px] font-medium", TONE[status] ?? "text-muted-foreground border-border bg-muted/30")}>
      {copy?.label ?? status}
    </Badge>
  );
}

/**
 * عنوان خانة المبلغ يتبع حالة الطلب: «المدفوع» للطلب `PAID` وحده (isCollectedOrder)،
 * و«المسترد» للمستردّ — الاسترداد لا يحرّك activeOrderId، فكان المبلغ يظهر «مدفوعاً»
 * بجانب شارة «مسترد». وما سواهما مبلغُ طلبٍ لم يدخل بعد.
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
 */
function amountLabel(status: string): string {
  if (isCollectedOrder({ status })) return "المدفوع";
  if (status === "REFUNDED") return "المسترد";
  return "قيمة الطلب";
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export function ClientSubscriptionDeal({
  activeOrder,
  orders,
}: {
  activeOrder: ActiveOrderSummary | null;
  orders: ClientOrderRow[];
}) {
  const [open, setOpen] = useState(false);

  // No order at all — true for every client created before the checkout page existed.
  // Say so plainly rather than rendering an empty card: the migration (MONEY-FLOW §7 item 11)
  // is what fills these in, and until then the absence IS the information.
  if (!activeOrder) {
    return (
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/20">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
            الاشتراك الحالي
          </span>
        </div>
        <div className="p-4 flex items-start gap-3">
          <Receipt className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            ما فيه طلبٌ مربوطٌ بهذا العميل — فلا سعر ولا مدّة ولا مندوب نقرأهم من مصدرٍ ثابت.
            <span className="block mt-1 text-xs">
              عملاء ما قبل صفحة الدفع يُنشأ لهم طلبٌ بتاريخهم عند ترحيل البيانات القديمة.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const totalMonths = activeOrder.paidMonths + activeOrder.bonusServiceMonths;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
          الاشتراك الحالي
        </span>
        <div className="flex items-center gap-2">
          <OrderStatus status={activeOrder.status} />
          <Link
            href={`/orders/${activeOrder.id}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {activeOrder.number}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Cell label="الباقة">{activeOrder.planName}</Cell>
          <Cell label={amountLabel(activeOrder.status)}>
            <span
              className={cn(
                "tabular-nums",
                activeOrder.status === "REFUNDED" && "text-red-600 dark:text-red-400 line-through decoration-1",
              )}
            >
              {money(activeOrder.totalMinor, activeOrder.currency)}
            </span>
            {activeOrder.status === "REFUNDED" && (
              <span className="block text-xs font-normal text-red-600 dark:text-red-400">
                رُدّ للعميل — لا يُحسب مدفوعاً
              </span>
            )}
          </Cell>
          {/* المدّةُ بصياغة `formatTermLabel` الواحدة — «٦ أشهر + شهر هدية» كالفاتورة والكونسول، لا «1 شهر». */}
          <Cell label="المدّة">
            {formatTermLabel(activeOrder.paidMonths, activeOrder.bonusServiceMonths)}
            {activeOrder.bonusServiceMonths > 0 && (
              <span className="block text-xs text-muted-foreground font-normal">
                الإجمالي {formatMonths(totalMonths)}
              </span>
            )}
          </Cell>
          <Cell label="المندوب">
            {activeOrder.salesRepName ?? <span className="text-muted-foreground font-normal">بلا مندوب</span>}
          </Cell>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
          <Cell label="تاريخ الدفع">
            <span className="tabular-nums font-normal">{day(activeOrder.paidAt)}</span>
          </Cell>
          <Cell label="بدء احتساب الاشتراك">
            {activeOrder.serviceStartedAt ? (
              <span className="tabular-nums font-normal">{day(activeOrder.serviceStartedAt)}</span>
            ) : (
              // Empty is not a gap in the UI — it is the live state of a paid order whose
              // service has not started (no article has reached the client yet).
              <span className="text-xs font-normal text-amber-600 dark:text-amber-500">
                ما بدأ — ينتظر أوّل مقال يوصل العميل
              </span>
            )}
          </Cell>
        </div>

        {activeOrder.derived && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            المؤشّر كان فارغاً، فقُرئ أحدث طلبٍ مدفوع لهذا العميل — وثُبّت الآن.
          </p>
        )}

        {orders.length > 1 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((v) => !v)}
              className="h-7 px-2 text-xs gap-1"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
              كل الطلبات ({orders.length})
            </Button>

            {open && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-start font-medium py-2 px-2">الطلب</th>
                      <th className="text-start font-medium py-2 px-2">الباقة</th>
                      <th className="text-start font-medium py-2 px-2">المبلغ</th>
                      <th className="text-start font-medium py-2 px-2">المدّة</th>
                      <th className="text-start font-medium py-2 px-2">التاريخ</th>
                      <th className="text-start font-medium py-2 px-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        className={cn("border-b last:border-0", o.isActive && "bg-primary/5")}
                      >
                        <td className="py-2 px-2">
                          <Link href={`/orders/${o.id}`} className="text-primary hover:underline">
                            {o.number}
                          </Link>
                          {o.isActive && (
                            <Badge variant="outline" className="ms-2 text-[10px] border-primary/40 text-primary">
                              الساري
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{o.planName}</td>
                        <td className="py-2 px-2 tabular-nums">{money(o.totalMinor, o.currency)}</td>
                        <td className="py-2 px-2 tabular-nums text-muted-foreground">
                          {formatTermLabel(o.paidMonths, o.bonusServiceMonths)}
                        </td>
                        <td className="py-2 px-2 tabular-nums text-muted-foreground">
                          {day(o.paidAt ?? o.createdAt)}
                        </td>
                        <td className="py-2 px-2"><OrderStatus status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  الطلبات القديمة تبقى بأسعارها يوم الشراء — لا تُعدَّل عند الترقية.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
