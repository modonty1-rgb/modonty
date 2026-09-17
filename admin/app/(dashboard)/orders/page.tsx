import type { CheckoutOrderStatus } from "@prisma/client";
import { PackageOpen, Plus } from "lucide-react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { OrderStatusBadge } from "./components/order-status-badge";
import { OrderStatusFilter } from "./components/order-status-filter";
import { formatMonths } from "./helpers/format-months";
import { formatOrderDate } from "./helpers/format-order-date";
import { formatOrderMoney } from "./helpers/format-order-money";
import { orderMarketLabel } from "./helpers/order-market-label";
import { orderProviderLabel } from "./helpers/order-provider-label";
import { AWAITING_ACTIVATION } from "@/lib/orders/awaiting-activation";
import { ActivateOrderButton } from "./components/activate-order-button";

export const dynamic = "force-dynamic";

const STATUSES: CheckoutOrderStatus[] = ["AWAITING_PAYMENT", "AWAITING_TRANSFER", "PAID", "FAILED", "CANCELLED", "REFUNDED"];
const TAKE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string }> }) {
  const { status, view } = await searchParams;
  const activeStatus = STATUSES.find((candidate) => candidate === status);
  // مشهدٌ لا حالة: «ينتظر التفعيل» = مدفوعٌ بلا `clientId`، وهو غيابُ حقلٍ لا قيمةُ status.
  const isAwaitingView = view === "awaiting-activation";

  const [orders, total, countRows, awaitingActivation] = await Promise.all([
    db.checkoutOrder.findMany({
      where: isAwaitingView ? AWAITING_ACTIVATION : activeStatus ? { status: activeStatus } : undefined,
      select: {
        id: true, number: true, createdAt: true, buyerName: true, market: true,
        planName: true, paidMonths: true, totalMinor: true, currency: true, status: true,
        // للتفعيل: `clientId` يقرّر ظهور الزرّ، والثلاثة الباقية تملأ النافذة بلا استعلامٍ ثانٍ.
        clientId: true, businessName: true, buyerEmail: true, bonusServiceMonths: true,
        transactions: { select: { provider: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: TAKE,
    }),
    db.checkoutOrder.count(),
    db.checkoutOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    db.checkoutOrder.count({ where: AWAITING_ACTIVATION }),
  ]);
  const counts = Object.fromEntries(countRows.map((row) => [row.status, row._count._all])) as Partial<Record<CheckoutOrderStatus, number>>;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">طلبات الاشتراك</h1>
          <p className="text-sm text-muted-foreground">طلبات الاشتراك من صفحة الدفع — تأكيد التحويل والفواتير من تفاصيل كل طلب.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{total} طلباً{orders.length < TAKE ? "" : ` — أحدث ${TAKE}`}</p>
          {/* المنفذ الثاني بجانب صفحة الدفع — ومنه تُعاد إدخال العملاء القائمين. */}
          <Link
            href="/orders/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            طلب اشتراك جديد
          </Link>
        </div>
      </header>

      <OrderStatusFilter
        counts={counts}
        total={total}
        active={activeStatus}
        awaitingActivation={awaitingActivation}
        isAwaitingView={isAwaitingView}
      />

      {orders.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
          <PackageOpen className="size-9 text-muted-foreground" aria-hidden />
          <h2 className="font-semibold">{isAwaitingView ? "ما فيه طلبٌ ينتظر التفعيل" : activeStatus ? "لا طلبات بهذه الحالة" : "لا طلبات بعد"}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{isAwaitingView ? "كل طلبٍ مدفوع له حساب عميل — ما في مالٍ وصل وخدمةٍ لم تبدأ." : activeStatus ? "جرّب حالة أخرى من الأعلى." : "تظهر الطلبات هنا بمجرد أن يبدأ أول عميل الدفع من صفحة الاشتراك."}</p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-9 text-right">رقم الطلب</TableHead>
                <TableHead className="h-9 text-right">التاريخ</TableHead>
                <TableHead className="h-9 text-right">العميل</TableHead>
                <TableHead className="h-9 text-right">السوق</TableHead>
                <TableHead className="h-9 text-right">الباقة</TableHead>
                <TableHead className="h-9 text-right">المدة</TableHead>
                <TableHead className="h-9 text-right">الإجمالي</TableHead>
                <TableHead className="h-9 text-right">الحالة</TableHead>
                <TableHead className="h-9 text-right">البوابة</TableHead>
                <TableHead className="h-9 w-[1%] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="py-2 font-medium">
                    <Link href={`/orders/${order.id}`} className="tabular-nums underline-offset-2 hover:underline">{order.number}</Link>
                  </TableCell>
                  <TableCell className="py-2 text-muted-foreground">{formatOrderDate(order.createdAt)}</TableCell>
                  <TableCell className="py-2">{order.buyerName}</TableCell>
                  <TableCell className="py-2">{orderMarketLabel(order.market)}</TableCell>
                  <TableCell className="py-2">{order.planName}</TableCell>
                  <TableCell className="py-2 tabular-nums">{formatMonths(order.paidMonths)}</TableCell>
                  <TableCell className="py-2 font-medium tabular-nums">{formatOrderMoney(order.totalMinor, order.currency)}</TableCell>
                  <TableCell className="py-2"><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell className="py-2 text-muted-foreground">{order.transactions[0] ? orderProviderLabel(order.transactions[0].provider) : "—"}</TableCell>
                  <TableCell className="py-2">
                    {/* الشرط هو تعريف «ينتظر التفعيل» نفسه: مدفوعٌ بلا كرت. لا حالةَ ثالثة. */}
                    {order.status === "PAID" && !order.clientId ? (
                      <ActivateOrderButton
                        order={{
                          id: order.id,
                          number: order.number,
                          buyerName: order.buyerName,
                          businessName: order.businessName,
                          buyerEmail: order.buyerEmail,
                          planName: order.planName,
                          totalLabel: formatOrderMoney(order.totalMinor, order.currency),
                          termLabel: formatMonths(order.paidMonths) + (order.bonusServiceMonths ? ` + ${formatMonths(order.bonusServiceMonths)} هديّة` : ""),
                        }}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
