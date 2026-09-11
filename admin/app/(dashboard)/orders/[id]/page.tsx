import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { OrderStatusBadge } from "../components/order-status-badge";
import { formatOrderDate } from "../helpers/format-order-date";
import { formatOrderDateTime } from "../helpers/format-order-date-time";
import { formatOrderMoney } from "../helpers/format-order-money";
import { orderMarketLabel } from "../helpers/order-market-label";
import { orderProviderLabel } from "../helpers/order-provider-label";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.checkoutOrder.findUnique({ where: { id } });
  if (!order) notFound();

  const [transactions, webhookEvents, attempts] = await Promise.all([
    db.paymentTransaction.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.paymentWebhookEvent.findMany({ where: { orderId: id }, orderBy: { receivedAt: "desc" }, take: 20 }),
    db.paymentAttempt.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 pb-12" dir="rtl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">الطلبات / {order.number}</p>
          <h1 className="text-2xl font-semibold tabular-nums">{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatOrderDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>لقطة الطلب</CardTitle>
          <CardDescription>القيم كما كانت لحظة الطلب — لا تتغيّر لو عُدّلت الباقة أو الأسعار لاحقاً.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <Field label="السوق" value={orderMarketLabel(order.market)} />
            <Field label="الباقة" value={order.planName} />
            <Field label="المدة المدفوعة" value={`${order.paidMonths} أشهر`} />
            <Field label="أشهر الهدية" value={`${order.bonusServiceMonths} أشهر`} />
            <Field label="السعر الشهري" value={formatOrderMoney(order.monthlyBaseMinor, order.currency)} />
            <Field label="الصافي قبل الضريبة" value={formatOrderMoney(order.subtotalMinor, order.currency)} />
            <Field label="الضريبة" value={`${formatOrderMoney(order.vatMinor, order.currency)} (${order.vatRateBp / 100}٪)`} />
            <Field label="الإجمالي" value={<strong className="tabular-nums">{formatOrderMoney(order.totalMinor, order.currency)}</strong>} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>المشتري</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <Field label="الاسم" value={order.buyerName} />
            <Field label="البريد" value={order.buyerEmail} />
            <Field label="الجوال" value={<span dir="ltr">{order.buyerPhone}</span>} />
            <Field label="المنشأة" value={order.businessName || "—"} />
            <Field label="الدولة" value={order.country || "—"} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الخطوات التالية</CardTitle>
          <CardDescription>حساب العميل وإصدار الفاتورة يُضافان كأزرار هنا في بنود لاحقة.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">العميل: {order.clientId ? "مرتبط بحساب" : "لم يُنشأ بعد"}</Badge>
          <Badge variant="outline">الفاتورة: {order.invoiceId ? "صدرت" : "لم تصدر بعد"}</Badge>
          {order.confirmedAt ? <Badge variant="outline">أكّد التحويل: {formatOrderDate(order.confirmedAt)}{order.transferReference ? ` — مرجع ${order.transferReference}` : ""}</Badge> : null}
          {order.failedReason ? <Badge variant="destructive">سبب الفشل: {order.failedReason}</Badge> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>معاملات الدفع</CardTitle></CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا معاملات مسجّلة لهذا الطلب بعد.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-right">المزوّد</TableHead>
                    <TableHead className="h-9 text-right">الحالة</TableHead>
                    <TableHead className="h-9 text-right">المبلغ</TableHead>
                    <TableHead className="h-9 text-right">مرجع المزوّد</TableHead>
                    <TableHead className="h-9 text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="py-2">{orderProviderLabel(transaction.provider)}</TableCell>
                      <TableCell className="py-2">{transaction.status}</TableCell>
                      <TableCell className="py-2 tabular-nums">{formatOrderMoney(transaction.amountMinor, transaction.currency)}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{transaction.providerReference || transaction.providerOrderRef || "—"}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{formatOrderDateTime(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>أحداث الويب هوك</CardTitle></CardHeader>
        <CardContent>
          {webhookEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا أحداث واردة من المزوّد لهذا الطلب بعد.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-right">المزوّد</TableHead>
                    <TableHead className="h-9 text-right">نوع الحدث</TableHead>
                    <TableHead className="h-9 text-right">وصل في</TableHead>
                    <TableHead className="h-9 text-right">عولج في</TableHead>
                    <TableHead className="h-9 text-right">خطأ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="py-2">{orderProviderLabel(event.provider)}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{event.eventType || "—"}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{formatOrderDateTime(event.receivedAt)}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{event.processedAt ? formatOrderDateTime(event.processedAt) : "—"}</TableCell>
                      <TableCell className="py-2 text-destructive">{event.error || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>محاولات فاشلة</CardTitle></CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا محاولات فاشلة مسجّلة لهذا الطلب.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-right">المزوّد</TableHead>
                    <TableHead className="h-9 text-right">السبب</TableHead>
                    <TableHead className="h-9 text-right">الرسالة</TableHead>
                    <TableHead className="h-9 text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="py-2">{orderProviderLabel(attempt.provider)}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{attempt.reasonCode || "—"}</TableCell>
                      <TableCell className="py-2 text-destructive">{attempt.message || "—"}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{formatOrderDateTime(attempt.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
