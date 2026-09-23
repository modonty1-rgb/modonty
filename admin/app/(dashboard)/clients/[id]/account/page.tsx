import { InvoicePaymentStatus } from "@prisma/client";
import { ArrowRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { checkSalesDesk } from "@/lib/require-sales-desk";
import { formatOrderDate } from "@/app/(dashboard)/orders/helpers/format-order-date";
import { INVOICE_STATUS_LABEL } from "@modonty/shared/lib/payments/invoice-status-label";
import { orderStatusCopy } from "@/lib/orders/order-status-copy";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import {
  invoiceMinor,
  isCollectedOrder,
  isOutstandingInvoice,
} from "@modonty/shared/lib/payments/collected";

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

type CurrencySummary = {
  receivedMinor: number;
  dueMinor: number;
  orderMinor: number;
  invoices: number;
};

/** الطلباتُ التي لم يُتّفق فيها على شيء — لا تُجمع في «الطلبات». */
const VOID_ORDER = new Set(["CANCELLED", "FAILED"]);



export default async function ClientAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromOrder?: string }>;
}) {
  // كشفُ حسابٍ فيه مالُ العميل كلُّه — لمكتب المبيعات والأدمن، لا لكلّ موظّفٍ يفتح اللوحة.
  const gate = await checkSalesDesk();
  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") redirect("/orders");

  const { id } = await params;
  const { fromOrder } = await searchParams;
  if (!isValidObjectId(id)) notFound();
  const returnHref = fromOrder && isValidObjectId(fromOrder) ? `/orders/${fromOrder}` : "/orders";

  const client = await db.client.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!client) notFound();

  const [orders, invoices] = await Promise.all([
    db.checkoutOrder.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true, planName: true, status: true, totalMinor: true, currency: true, paidAt: true, createdAt: true },
    }),
    db.invoice.findMany({
      where: { clientId: id, OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
      orderBy: { issuedAt: "desc" },
      select: { id: true, number: true, currency: true, totalMinor: true, amount: true, paymentStatus: true, issuedAt: true, paidAt: true, orderId: true, fromOpeningBalance: true },
    }),
  ]);

  /**
   * «المستلم» من الطلب، لا من إيصالات البوّابة — القاعدةُ في `shared/lib/payments/collected.ts`.
   * الإيصالُ لا يُكتب للطلب اليدويّ، ولا يتبع تعديلَ المبلغ، ويبقى «ناجحاً» بعد الاسترداد.
   */
  const summaries = new Map<string, CurrencySummary>();
  const summaryFor = (currency: string) => {
    const current = summaries.get(currency) ?? { receivedMinor: 0, dueMinor: 0, orderMinor: 0, invoices: 0 };
    summaries.set(currency, current);
    return current;
  };

  for (const order of orders) {
    const summary = summaryFor(order.currency);
    if (!VOID_ORDER.has(order.status)) summary.orderMinor += order.totalMinor;
    if (isCollectedOrder(order)) summary.receivedMinor += order.totalMinor;
  }
  for (const invoice of invoices) {
    const summary = summaryFor(invoice.currency);
    summary.invoices += 1;
    // المستلمُ من الطلبات وحدها — الفاتورةُ مستندٌ لا مال (مصدرٌ واحد، ٢٣ سبتمبر ٢٠٢٦).
    if (isOutstandingInvoice(invoice)) summary.dueMinor += invoiceMinor(invoice);
  }

  const currencyRows = [...summaries.entries()].sort(([a], [b]) => a.localeCompare(b));
  const invoiceByOrder = new Map(invoices.filter((invoice) => invoice.orderId).map((invoice) => [invoice.orderId as string, invoice]));
  const standaloneInvoices = invoices.filter((invoice) => !invoice.orderId);

  return (
    <main className="mx-auto max-w-6xl space-y-3 pb-10" dir="rtl">
      <header className="flex items-center gap-2 border-b px-1 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={returnHref} aria-label="العودة إلى ملخص الطلب" className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <ReceiptText className="size-4 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">كشف الحساب</p>
            <h1 className="truncate text-lg font-bold">{client.name}</h1>
          </div>
        </div>
      </header>

      {currencyRows.length === 0 ? (
        <section className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          لا توجد طلبات أو فواتير مالية لهذا العميل بعد.
        </section>
      ) : (
        <section className="flex flex-wrap divide-x divide-x-reverse rounded-lg border bg-card" aria-label="ملخص مالي">
          {currencyRows.map(([currency, summary]) => (
            <div key={currency} className="flex min-w-[16rem] flex-1 items-center gap-4 px-4 py-3">
              <Badge variant="secondary" className="shrink-0 tabular-nums">{currency}</Badge>
              <dl className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <InlineMoney label="المستلم" value={formatOrderMoney(summary.receivedMinor, currency)} tone="good" />
                <InlineMoney label="المستحق" value={formatOrderMoney(summary.dueMinor, currency)} tone={summary.dueMinor > 0 ? "bad" : "muted"} />
                <InlineMoney label="الطلبات" value={formatOrderMoney(summary.orderMinor, currency)} tone="muted" />
              </dl>
            </div>
          ))}
        </section>
      )}

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <h2 className="text-sm font-bold">الحركة المالية</h2>
          <span className="text-xs text-muted-foreground">المستلم = الطلبات المدفوعة وحدها — الفاتورة مستند، لا مال</span>
        </div>
        {orders.length === 0 && standaloneInvoices.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">لا توجد حركة مالية لهذا العميل.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-right">الطلب / الفاتورة</TableHead>
                  <TableHead className="text-right">القيمة</TableHead>
                  <TableHead className="text-right">المستلم</TableHead>
                  <TableHead className="text-right">المستحق</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const invoice = invoiceByOrder.get(order.id);
                  const receivedMinor = isCollectedOrder(order) ? order.totalMinor : 0;
                  const dueMinor = invoice && isOutstandingInvoice(invoice) ? invoiceMinor(invoice) : 0;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="min-w-48">
                        <Link href={`/orders/${order.id}`} className="font-medium tabular-nums hover:underline">{order.number}</Link>
                        <p className="truncate text-xs text-muted-foreground">{order.planName}{invoice ? ` · ${invoice.number}` : ""}</p>
                      </TableCell>
                      <TableCell className="tabular-nums">{formatOrderMoney(order.totalMinor, order.currency)}</TableCell>
                      <TableCell className="tabular-nums text-emerald-600 dark:text-emerald-400">{formatOrderMoney(receivedMinor, order.currency)}</TableCell>
                      <TableCell className={dueMinor > 0 ? "tabular-nums text-destructive" : "tabular-nums text-muted-foreground"}>{formatOrderMoney(dueMinor, order.currency)}</TableCell>
                      <TableCell><Badge variant={order.status === "PAID" ? "default" : "secondary"}>{orderStatusCopy(order.status).label}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatOrderDate(order.paidAt ?? order.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
                {standaloneInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="min-w-48">
                      <span className="font-medium tabular-nums">{invoice.number}</span>
                      <p className="text-xs text-muted-foreground">فاتورة تاريخية بلا طلب مرتبط</p>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatOrderMoney(invoiceMinor(invoice), invoice.currency)}</TableCell>
                    {/* فاتورةٌ بلا طلب لا تُعدّ «مستلماً»: المالُ يُسجَّل بطلبٍ أوّلاً (مصدرٌ واحد). */}
                    <TableCell className="tabular-nums text-muted-foreground">—</TableCell>
                    <TableCell className={invoice.paymentStatus === InvoicePaymentStatus.PAID ? "tabular-nums text-muted-foreground" : "tabular-nums text-destructive"}>{invoice.paymentStatus === InvoicePaymentStatus.PAID ? "—" : formatOrderMoney(invoiceMinor(invoice), invoice.currency)}</TableCell>
                    <TableCell><Badge variant={invoice.paymentStatus === InvoicePaymentStatus.PAID ? "default" : "secondary"}>{INVOICE_STATUS_LABEL[invoice.paymentStatus]}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatOrderDate(invoice.issuedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </main>
  );
}

function InlineMoney({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" | "muted" }) {
  const toneClass = tone === "good" ? "text-emerald-600 dark:text-emerald-400" : tone === "bad" ? "text-destructive" : "text-foreground";
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={`truncate text-sm font-bold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}
